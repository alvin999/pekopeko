<script lang="ts">
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { supabase } from "../lib/supabase";
  import AvatarGenerator from "./AvatarGenerator.svelte";

  let drinkType: "coffee" | "tea" = "coffee";
  let itemName = "";
  let flavors: string[] = [];
  let flavorIntensity: "low" | "medium" | "high" = "medium";

  let mainTastes: string[] = []; // Max 2

  let acidityIntensity: "low" | "medium" | "high" = "medium";
  let acidityType: "dry" | "sweet" = "sweet";

  let sweetnessIntensity: "low" | "medium" | "high" = "medium";

  let mouthfeel: "low" | "medium" | "high" = "medium";
  let mouthfeelTypes: string[] = []; // Max 2

  // 移除 body，改由 mouthfeel 統一控制
  let mood = "🙂";
  let locationUrl = "";
  let shopSearchName = "";
  let currentCoords: { lat: number; lng: number } | null = null;
  let isLoadingLocation = false;
  let isFetchingShopName = false;
  let searchUrl = "";
  let embedUrl = "";
  let isLoading = false;
  let userLang = "zh-TW";
  let errorMsg = "";
  let hasPostedToday = false;
  let scrollY = 0;
  let scrollProgress = 0;
  let isMobile = false;

  $: if (typeof window !== "undefined") {
    isMobile = window.innerWidth < 768;
    // 計算滾動進度 (手機版 0~300px 之間完成縮放，延長感官長度)
    scrollProgress = Math.min(Math.max(scrollY / 300, 0), 1);
  }

  // Toast Notification System
  let toast = {
    message: "",
    type: "warning" as "warning" | "error",
    visible: false,
  };
  let toastTimer: any;

  function showToast(message: string, type: "warning" | "error" = "warning") {
    if (toastTimer) clearTimeout(toastTimer);
    toast = { message, type, visible: true };
    toastTimer = setTimeout(() => {
      toast.visible = false;
    }, 3000);
  }

  async function autoFetchShopName(url: string) {
    if (!url) return;
    isFetchingShopName = true;
    try {
      const res = await fetch(
        `/api/fetch-map-title?url=${encodeURIComponent(url)}`,
      );
      const data = await res.json();
      if (data.title) {
        shopSearchName = data.title;
      }
    } catch (err) {
      console.error("Failed to fetch shop name", err);
    } finally {
      isFetchingShopName = false;
    }
  }

  // 自動偵測剪貼簿內容
  async function handlePasteCheck() {
    errorMsg = ""; // 清除舊錯誤
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error("您的瀏覽器或環境 (非 HTTPS) 不支援剪貼簿存取");
      }

      const text = await navigator.clipboard.readText();
      const isMapsUrl =
        text.includes("google.com/maps") ||
        text.includes("goo.gl/maps") ||
        text.includes("maps.app.goo.gl");

      if (isMapsUrl) {
        locationUrl = text;
        autoFetchShopName(text);
        // 視覺回饋：閃爍綠色
        const input = document.getElementById("location-url-input");
        if (input) {
          input.classList.add("bg-[--color-accent]", "scale-[1.02]");
          setTimeout(
            () => input.classList.remove("bg-[--color-accent]", "scale-[1.02]"),
            800,
          );
        }
      } else {
        errorMsg = "剪貼簿內沒有發現有效的 Google Maps 連結，請手動複製貼上。";
      }
    } catch (err: any) {
      console.log("無法存取剪貼簿", err);
      if (err.name === "NotAllowedError") {
        errorMsg =
          "權限不足：請在瀏覽器設定中允許此網站存取剪貼簿，或手動貼上連結。";
      } else {
        errorMsg = err.message || "讀取剪貼簿時發生錯誤，請嘗試手動貼上。";
      }
    }
  }

  function updateMapUrls() {
    if (!currentCoords) return;
    const { lat, lng } = currentCoords;
    const baseQuery = drinkType === "coffee" ? "coffee" : "tea";
    const finalQuery = shopSearchName
      ? `${baseQuery} ${shopSearchName}`
      : baseQuery;

    // 更新搜尋與嵌入連結，加入 hl 參數以符合使用者語言
    searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(finalQuery)}/@${lat},${lng},17z?hl=${userLang}`;
    embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(finalQuery)}&ll=${lat},${lng}&z=15&output=embed&hl=${userLang}`;
  }

  // 當飲品類型或店名關鍵字改變時更新地圖
  $: if (currentCoords && (drinkType || shopSearchName)) {
    updateMapUrls();
  }

  async function getLocation() {
    isLoadingLocation = true;
    errorMsg = "";
    if (!navigator.geolocation) {
      errorMsg = "您的瀏覽器不支援定位功能";
      isLoadingLocation = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        currentCoords = { lat: latitude, lng: longitude };
        updateMapUrls();
        isLoadingLocation = false;
      },
      (err) => {
        errorMsg = "無法獲取位置：" + err.message;
        isLoadingLocation = false;
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  }

  interface FlavorOption {
    name: string;
    label: string;
    children?: FlavorOption[];
  }

  const flavorOptions: FlavorOption[] = [
    { name: "floral", label: "花香 Floral" },
    {
      name: "fruity",
      label: "果香 Fruity",
      children: [
        { name: "berry", label: "莓果 Berry" },
        { name: "dried_fruit", label: "乾果 Dried Fruit" },
        { name: "citrus_fruit", label: "柑橘 Citrus Fruit" },
      ],
    },
    {
      name: "sour_fermented",
      label: "酸/發酵 Sour/Fermented",
      children: [
        { name: "sour", label: "酸味 Sour" },
        { name: "fermented", label: "發酵 Fermented" },
      ],
    },
    { name: "green_vegetative", label: "草本/植物 Green/Vegetative" },
    {
      name: "other",
      label: "其他 Other",
      children: [
        { name: "chemical", label: "化學 Chemical" },
        { name: "musty_earthy", label: "霉味/大地 Musty/Earthy" },
        { name: "papery", label: "紙味 Papery" },
      ],
    },
    { name: "roasted", label: "烘焙 Roasted" },
    {
      name: "nutty_cocoa",
      label: "堅果/可可 Nutty/Cocoa",
      children: [
        { name: "nutty", label: "堅果 Nutty" },
        { name: "cocoa", label: "可可 Cocoa" },
      ],
    },
    { name: "spicy", label: "香料 Spicy" },
    {
      name: "sweet",
      label: "甜感 Sweet",
      children: [
        { name: "vanilla", label: "香草 Vanilla" },
        { name: "brown_sugar", label: "紅糖 Brown Sugar" },
      ],
    },
  ];

  const itemData = {
    coffee: [
      {
        continent: "Africa 非洲",
        items: [
          "衣索比亞 Ethiopia",
          "肯亞 Kenya",
          "盧安達 Rwanda",
          "布隆地 Burundi",
          "坦尚尼亞 Tanzania",
          "烏干達 Uganda",
          "剛果民主共和國 DR Congo",
          "象牙海岸 Ivory Coast",
          "喀麥隆 Cameroon",
          "馬拉威 Malawi",
          "贊比亞 Zambia",
          "辛巴威 Zimbabwe",
        ],
      },
      {
        continent: "Americas 美洲",
        items: [
          "巴西 Brazil",
          "哥倫比亞 Colombia",
          "墨西哥 Mexico",
          "瓜地馬拉 Guatemala",
          "宏都拉斯 Honduras",
          "薩爾瓦多 El Salvador",
          "尼加拉瓜 Nicaragua",
          "哥斯大黎加 Costa Rica",
          "巴拿馬 Panama",
          "秘魯 Peru",
          "厄瓜多 Ecuador",
          "玻利維亞 Bolivia",
          "牙買加 Jamaica",
          "多明尼加 Dominican Republic",
        ],
      },
      {
        continent: "Asia/Pacific 亞太",
        items: [
          "台灣 Taiwan",
          "越南 Vietnam",
          "印尼 Indonesia",
          "印度 India",
          "葉門 Yemen",
          "泰國 Thailand",
          "寮國 Laos",
          "緬甸 Myanmar",
          "菲律賓 Philippines",
          "雲南 Yunnan",
          "東帝汶 Timor-Leste",
          "巴布亞紐幾內亞 Papua New Guinea",
          "夏威夷 Hawaii",
          "澳洲 Australia",
        ],
      },
    ],
    tea: [
      {
        continent: "Asia 亞洲",
        items: [
          "台灣 Taiwan",
          "中國 China",
          "日本 Japan",
          "印度 India",
          "斯里蘭卡 Sri Lanka",
        ],
      },
      {
        continent: "Africa/Others 其他",
        items: ["肯亞 Kenya (Tea)", "南非 South Africa (Rooibos)"],
      },
    ],
  };

  const flavorIdToParent: Record<string, string> = {};
  flavorOptions.forEach((p) => {
    if (p.children) {
      p.children.forEach((c) => {
        flavorIdToParent[c.name] = p.name;
      });
    }
  });

  // 反應式變數：過濾掉有子項被選取的父項
  $: displayFlavors = flavors.filter((f) => {
    const p = flavorOptions.find((opt) => opt.name === f);
    if (p && p.children) {
      // 如果是父項，檢查是否有子項被選取
      const hasChildSelected = p.children.some((c) => flavors.includes(c.name));
      return !hasChildSelected;
    }
    return true;
  });

  const mainTasteOptions = [
    { name: "salty", label: "鹹 SALTY" },
    { name: "sour", label: "酸 SOUR" },
    { name: "sweet", label: "甜 SWEET" },
    { name: "bitter", label: "苦 BITTER" },
    { name: "umami", label: "鮮 UMAMI" },
  ];

  const mouthfeelOptions = [
    { name: "rough", label: "粗糙 ROUGH (GRITTY, CHALKY, SANDY)" },
    { name: "oily", label: "油脂 OILY" },
    { name: "smooth", label: "滑順 SMOOTH (VELVETY, SILKY, SYRUPY)" },
    { name: "mouth_drying", label: "乾澀 MOUTH-DRYING" },
    { name: "metallic", label: "金屬 METALLIC" },
  ];
  const moods = ["🙂", "😌", "🤯", "🥱", "⚡️", "🌈"];

  let expandedNodes = new Set<string>();

  onMount(async () => {
    // 偵測語言
    userLang = navigator.language || "zh-TW";

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("posts")
        .select("id")
        .eq("user_id", user.id)
        .gt(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        )
        .limit(1);

      if (data && data.length > 0) {
        hasPostedToday = true;
      }
    }
  });

  function toggleFlavor(flavor: string) {
    const option = flavorOptions.find((opt) => opt.name === flavor);

    // 如果點選的是父類別
    if (option && option.children) {
      const childrenNames = option.children.map((c) => c.name);
      const hasChildrenSelected = childrenNames.some((cn) =>
        flavors.includes(cn),
      );

      if (hasChildrenSelected || flavors.includes(flavor)) {
        // 如果有選取子類別，或父類別本身已被選取 -> 全部取消
        flavors = flavors.filter(
          (f) => f !== flavor && !childrenNames.includes(f),
        );
        return;
      }
    }

    // 常規選取/取消
    if (flavors.includes(flavor)) {
      flavors = flavors.filter((f) => f !== flavor);
    } else if (flavors.length < 5) {
      flavors = [...flavors, flavor];
    } else {
      showToast("最多只能選擇 5 種風味喲！🥤", "warning");
    }
  }

  function toggleMainTaste(taste: string) {
    if (mainTastes.includes(taste)) {
      mainTastes = mainTastes.filter((t) => t !== taste);
    } else if (mainTastes.length < 2) {
      mainTastes = [...mainTastes, taste];
    } else {
      showToast("味覺主調選 2 個最精準！😋", "warning");
    }
  }

  function toggleMouthfeel(type: string) {
    if (mouthfeelTypes.includes(type)) {
      mouthfeelTypes = mouthfeelTypes.filter((t) => t !== type);
    } else if (mouthfeelTypes.length < 2) {
      mouthfeelTypes = [...mouthfeelTypes, type];
    } else {
      showToast("口感選 2 個能描述得更棒！👅", "warning");
    }
  }

  function setAcidityType(type: "dry" | "sweet") {
    acidityType = type;
  }

  function setAcidityIntensity(level: "low" | "medium" | "high") {
    acidityIntensity = level;
  }

  function setFlavorIntensity(level: "low" | "medium" | "high") {
    flavorIntensity = level;
  }

  function setSweetnessIntensity(level: "low" | "medium" | "high") {
    sweetnessIntensity = level;
  }

  function setMouthfeelIntensity(level: "low" | "medium" | "high") {
    mouthfeel = level;
  }

  function toggleExpand(nodeName: string) {
    if (expandedNodes.has(nodeName)) {
      expandedNodes.delete(nodeName);
    } else {
      expandedNodes.add(nodeName);
    }
    expandedNodes = expandedNodes; // Trigger Svelte reactivity
  }

  function selectItem(name: string) {
    itemName = name;
  }

  async function handleSubmit() {
    if (hasPostedToday) return; // 安全攔截
    isLoading = true;
    errorMsg = "";

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      errorMsg = "請先登入後再建立貼文";
      isLoading = false;
      return;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      drink_type: drinkType,
      item_name: itemName,
      flavors,
      mood,
      location_url: locationUrl,
      location_name: shopSearchName,
      flavor_intensity: flavorIntensity,
      main_tastes: mainTastes,
      acidity_intensity: acidityIntensity,
      acidity_type: acidityType,
      sweetness_intensity: sweetnessIntensity,
      mouthfeel: mouthfeel,
      mouthfeel_types: mouthfeelTypes,
    });

    if (error) {
      errorMsg = error.message;
    } else {
      window.location.href = "/";
    }
    isLoading = false;
  }
</script>

<svelte:window bind:scrollY />

<div class="max-w-4xl mx-auto p-4 space-y-12">
  <div class="text-center">
    <h1 class="text-6xl font-black italic title-outline mb-4">今日杯口</h1>
    <p
      class="font-bold opacity-60 uppercase tracking-widest text-xs border-b-2 border-[--color-border] inline-block pb-2"
    >
      24 小時限定，每日僅此一次。
    </p>
  </div>

  {#if hasPostedToday}
    <div
      class="brutalist-card bg-accent p-6 text-center max-w-2xl mx-auto shadow-[8px_8px_0px_0px_var(--color-border)] animate-in fade-in slide-in-from-top-4"
    >
      <div class="flex items-center justify-center gap-4">
        <span class="text-3xl">⚠️</span>
        <div>
          <p class="text-xl font-black italic uppercase">Already Shared.</p>
          <p class="font-bold opacity-80 text-sm">
            您今天已經有發文紀錄了，目前僅開放預覽操作。
          </p>
        </div>
      </div>
    </div>
  {/if}

  <div class="brutalist-card bg-white p-8 md:p-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
      <!-- Preview Group -->
      <div 
        class="md:sticky md:top-32 self-start space-y-8 z-40 transition-all duration-100 ease-out"
        style={isMobile ? `
          position: sticky; 
          top: ${120 - scrollProgress * 20}px; 
          transform: scale(${1 - scrollProgress * 0.55}) translateY(${scrollProgress * -10}px);
          transform-origin: top center;
          opacity: ${1 - scrollProgress * 0.1};
          margin-bottom: ${-scrollProgress * 200}px;
          filter: drop-shadow(0 ${10 - scrollProgress * 10}px 20px rgba(0,0,0,0.1));
        ` : ""}
      >
        <div 
          class="brutalist-badge badge-accent text-sm! px-4! italic md:block"
          style={isMobile ? `opacity: ${1 - scrollProgress * 2}; height: ${1 - scrollProgress > 0.5 ? 'auto' : '0'}; overflow: hidden;` : ""}
        >
          Live Preview
        </div>
        <div
          class="bg-[#F5F2EA] p-8 md:p-12 border-6 border-[--color-border] shadow-[12px_12px_0px_0px_var(--color-border)] flex flex-col items-center gap-8 transition-all"
          style={isMobile ? `
            padding: ${32 - scrollProgress * 24}px;
            gap: ${32 - scrollProgress * 28}px;
            box-shadow: ${12 - scrollProgress * 8}px ${12 - scrollProgress * 8}px 0px 0px var(--color-border);
          ` : ""}
        >
          <AvatarGenerator
            {drinkType}
            flavors={displayFlavors}
            {mood}
            size={isMobile ? 300 * (1 - scrollProgress * 0.4) : 300}
            {flavorIntensity}
            {acidityIntensity}
            {acidityType}
            {sweetnessIntensity}
            {mouthfeel}
            {mouthfeelTypes}
          />
          <div 
            class="flex flex-wrap justify-center gap-3 transition-opacity"
            style={isMobile ? `opacity: ${1 - scrollProgress * 1.5}; height: ${scrollProgress > 0.7 ? '0' : 'auto'}; overflow: hidden;` : ""}
          >
            {#each displayFlavors as f}
              <span class="brutalist-badge badge-white text-[10px]! px-3!">{f}</span
              >
            {/each}
            <span class="brutalist-badge badge-coffee text-[10px]! px-3! uppercase"
              >{mouthfeel} body</span
            >
          </div>
        </div>
      </div>

      <!-- Form Group -->
      <div class="space-y-10">
        <section>
          <span
            class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50"
            >Select Beverage Type</span
          >
          <div class="flex gap-4">
            <button
              class="brutalist-btn flex-1 transition-all {drinkType === 'coffee'
                ? 'bg-[--color-coffee] text-white -translate-y-1 shadow-brutalist-sm'
                : 'bg-white opacity-60'}"
              on:click={() => (drinkType = "coffee")}
            >
              ☕ COFFEE
            </button>
            <button
              class="brutalist-btn flex-1 transition-all {drinkType === 'tea'
                ? 'bg-[--color-tea] text-white -translate-y-1 shadow-brutalist-sm'
                : 'bg-white opacity-60'}"
              on:click={() => (drinkType = "tea")}
            >
              🍵 TEA
            </button>
          </div>
        </section>

        <!-- Item Selection Section -->
        <section class="space-y-6">
          <header class="border-b-2 border-[--color-border] pb-2">
            <span
              class="font-black text-xs uppercase tracking-[0.2em] opacity-50"
            >
              Select Origin / Item Name
            </span>
          </header>

          <div class="space-y-4">
            {#each itemData[drinkType] as group}
              <div class="space-y-2">
                <button
                  type="button"
                  class="flex items-center gap-2 group cursor-pointer"
                  on:click={() => toggleExpand(group.continent)}
                >
                  <span
                    class="text-[10px] font-black uppercase tracking-widest {expandedNodes.has(
                      group.continent,
                    )
                      ? 'text-[--color-accent]'
                      : 'opacity-40'}">{group.continent}</span
                  >
                  <span
                    class="text-[8px] transition-transform {expandedNodes.has(
                      group.continent,
                    )
                      ? 'rotate-90'
                      : ''}">▶</span
                  >
                </button>

                {#if expandedNodes.has(group.continent)}
                  <div
                    class="flex flex-wrap gap-2 pl-4 border-l-2 border-[--color-border] animate-in fade-in slide-in-from-left-1"
                    transition:fade={{ duration: 150 }}
                  >
                    {#each group.items as item}
                      <button
                        type="button"
                        class="brutalist-badge text-[10px]! px-3! py-1! transition-all {itemName ===
                        item
                          ? 'badge-accent -translate-y-1 shadow-[2px_2px_0px_0px_var(--color-border)]'
                          : 'badge-white opacity-60'}"
                        on:click={() => selectItem(item)}
                      >
                        {item}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}

            <div class="pt-2">
              <input
                type="text"
                placeholder="或手動輸入名稱..."
                class="w-full bg-[#F5F2EA] border-2 border-[--color-border] px-3 py-2 text-xs font-bold focus:bg-accent outline-none"
                bind:value={itemName}
              />
            </div>
          </div>
        </section>

        <!-- 1. Flavor Section -->
        <section class="space-y-6">
          <header
            class="flex justify-between items-end border-b-2 border-[--color-border] pb-2"
          >
            <span
              class="font-black text-xs uppercase tracking-[0.2em] opacity-50"
              >Flavor Profile</span
            >
            <div class="flex gap-2">
              {#each ["low", "medium", "high"] as const as level}
                <button
                  type="button"
                  class="text-[10px] font-black px-2 py-0.5 border-2 border-[--color-border] transition-all {flavorIntensity ===
                  level
                    ? 'bg-accent -translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-border)]'
                    : 'bg-white opacity-40'}"
                  on:click={() => setFlavorIntensity(level)}
                >
                  {level.toUpperCase()}
                </button>
              {/each}
            </div>
          </header>

          <div class="space-y-4">
            <div class="flex flex-wrap gap-2 mb-2">
              <span class="text-[9px] font-bold opacity-40 uppercase"
                >Select up to five:</span
              >
            </div>
            {#each flavorOptions as f}
              <div class="flavor-group">
                <div class="flex items-center gap-2">
                  <button
                    class="brutalist-badge text-xs! px-4! transition-all {flavors.includes(
                      f.name,
                    )
                      ? 'badge-accent -translate-y-1 shadow-[2px_2px_0px_0px_var(--color-border)]'
                      : 'badge-white opacity-60'}"
                    on:click={() => {
                      toggleFlavor(f.name);
                      if (f.children) toggleExpand(f.name);
                    }}
                  >
                    {f.label.toUpperCase()}
                  </button>
                </div>

                {#if f.children && expandedNodes.has(f.name)}
                  <div
                    class="ml-6 mt-3 pl-4 border-l-2 border-[--color-border] flex flex-wrap gap-3"
                  >
                    {#each f.children as child}
                      <button
                        class="brutalist-badge text-xs! px-4! transition-all {flavors.includes(
                          child.name,
                        )
                          ? 'badge-accent -translate-y-1 shadow-[2px_2px_0px_0px_var(--color-border)]'
                          : 'badge-white opacity-60'}"
                        on:click={() => toggleFlavor(child.name)}
                      >
                        {child.label.toUpperCase()}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </section>

        <!-- 2. Main Taste Section -->
        <section class="space-y-4">
          <header class="border-b-2 border-[--color-border] pb-2">
            <span
              class="font-black text-xs uppercase tracking-[0.2em] opacity-50"
              >Main Taste (Select up to two)</span
            >
          </header>
          <div class="flex flex-wrap gap-3">
            {#each mainTasteOptions as opt}
              <button
                class="brutalist-badge text-xs! px-4! transition-all {mainTastes.includes(
                  opt.name,
                )
                  ? 'badge-accent -translate-y-1 shadow-[2px_2px_0px_0px_var(--color-border)]'
                  : 'badge-white opacity-60'}"
                on:click={() => toggleMainTaste(opt.name)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </section>

        <!-- 3. Acidity Section -->
        <section class="space-y-4">
          <header
            class="flex justify-between items-end border-b-2 border-[--color-border] pb-2"
          >
            <span
              class="font-black text-xs uppercase tracking-[0.2em] opacity-50"
              >Acidity</span
            >
            <div class="flex gap-2">
              {#each ["low", "medium", "high"] as const as level}
                <button
                  type="button"
                  class="text-[10px] font-black px-2 py-0.5 border-2 border-[--color-border] transition-all {acidityIntensity ===
                  level
                    ? 'bg-accent -translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-border)]'
                    : 'bg-white opacity-40'}"
                  on:click={() => setAcidityIntensity(level)}
                >
                  {level.toUpperCase()}
                </button>
              {/each}
            </div>
          </header>
          <div class="flex gap-4">
            <button
              type="button"
              class="flex-1 py-3 text-xs font-black border-3 border-[--color-border] transition-all {acidityType ===
              'dry'
                ? 'bg-accent -translate-y-1 shadow-brutalist-sm'
                : 'bg-white opacity-60 shadow-none'}"
              on:click={() => setAcidityType("dry")}
            >
              DRY (HERBY, GRASSY, TART)
            </button>
            <button
              type="button"
              class="flex-1 py-3 text-xs font-black border-3 border-[--color-border] transition-all {acidityType ===
              'sweet'
                ? 'bg-accent -translate-y-1 shadow-brutalist-sm'
                : 'bg-white opacity-60 shadow-none'}"
              on:click={() => setAcidityType("sweet")}
            >
              SWEET (JUICY, BRIGHT)
            </button>
          </div>
        </section>

        <!-- 4. Sweetness Section -->
        <section class="space-y-4">
          <header
            class="flex justify-between items-end border-b-2 border-[--color-border] pb-2"
          >
            <span
              class="font-black text-xs uppercase tracking-[0.2em] opacity-50"
              >Sweetness</span
            >
            <div class="flex gap-2">
              {#each ["low", "medium", "high"] as const as level}
                <button
                  type="button"
                  class="text-[10px] font-black px-2 py-0.5 border-2 border-[--color-border] transition-all {sweetnessIntensity ===
                  level
                    ? 'bg-accent -translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-border)]'
                    : 'bg-white opacity-40'}"
                  on:click={() => setSweetnessIntensity(level)}
                >
                  {level.toUpperCase()}
                </button>
              {/each}
            </div>
          </header>
        </section>

        <!-- 5. Mouthfeel Section -->
        <section class="space-y-4">
          <header
            class="flex justify-between items-end border-b-2 border-[--color-border] pb-2"
          >
            <div class="flex items-baseline gap-2">
              <span
                class="font-black text-xs uppercase tracking-[0.2em] opacity-50"
                >Mouthfeel</span
              >
              <span class="text-[9px] font-bold opacity-30 uppercase"
                >(Select up to two)</span
              >
            </div>
            <div class="flex gap-2">
              {#each ["low", "medium", "high"] as const as level}
                <button
                  type="button"
                  class="text-[10px] font-black px-2 py-0.5 border-2 border-[--color-border] transition-all {mouthfeel ===
                  level
                    ? 'bg-accent -translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-border)]'
                    : 'bg-white opacity-40'}"
                  on:click={() => setMouthfeelIntensity(level)}
                >
                  {level.toUpperCase()}
                </button>
              {/each}
            </div>
          </header>
          <div class="flex flex-wrap gap-3">
            {#each mouthfeelOptions as opt}
              <button
                class="brutalist-badge text-xs! px-3! transition-all {mouthfeelTypes.includes(
                  opt.name,
                )
                  ? 'badge-accent -translate-y-1 shadow-[2px_2px_0px_0px_var(--color-border)]'
                  : 'badge-white opacity-60'}"
                on:click={() => toggleMouthfeel(opt.name)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </section>

        <section>
          <span
            class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50"
            >Current Mood</span
          >
          <div
            class="flex justify-between p-4 bg-[#F5F2EA] border-2 border-[--color-border]"
          >
            {#each moods as m}
              <button
                class="text-3xl transition-all {mood === m
                  ? 'scale-125 grayscale-0'
                  : 'opacity-30 grayscale hover:opacity-60'}"
                on:click={() => (mood = m)}
              >
                {m}
              </button>
            {/each}
          </div>
        </section>

        <section>
          <span
            class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50"
            >Discovery Location</span
          >

          <div class="space-y-4">
            <div
              class="bg-[#F5F2EA] border-2 border-[--color-border] p-4 space-y-4"
            >
              <!-- 搜尋輸入框 -->
              <div class="relative">
                <input
                  type="text"
                  placeholder="搜尋特定店名..."
                  class="w-full bg-white border-2 border-[--color-border] px-3 py-2 text-xs font-bold focus:bg-accent outline-none {isFetchingShopName
                    ? 'pr-10'
                    : ''}"
                  bind:value={shopSearchName}
                />
                {#if isFetchingShopName}
                  <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <span class="loading loading-spinner loading-xs"></span>
                  </div>
                {/if}
              </div>

              <!-- 嵌入地圖 (有座標才顯示) -->
              {#if embedUrl}
                <div class="animate-in fade-in slide-in-from-top-1">
                  <div
                    class="border-2 border-[--color-border] shadow-brutalist-sm overflow-hidden h-[200px]"
                  >
                    <iframe
                      title="Search Map"
                      width="100%"
                      height="100%"
                      frameborder="0"
                      src={embedUrl}
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              {/if}

              <!-- 操作說明與定位按鈕 (一律顯示) -->
              <div
                class="bg-black p-3 space-y-2 border-2 border-[--color-border]"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="space-y-2">
                    <p
                      class="text-[11px] font-black leading-tight uppercase tabular-nums text-white"
                    >
                      1. <span class="text-[--color-accent]">定位</span
                      >或在地圖找到店家
                    </p>
                    <p
                      class="text-[11px] font-black leading-tight uppercase tabular-nums text-white text-opacity-100"
                    >
                      2. 點選「<span class="text-[--color-accent]">分享</span
                      >」並「<span class="text-[--color-accent]">複製連結</span
                      >」
                    </p>
                    <p
                      class="text-[11px] font-black leading-tight uppercase tabular-nums text-white"
                    >
                      3. 回到此處點擊<span class="text-[--color-accent]"
                        >偵測按鈕</span
                      >
                    </p>
                  </div>

                  <button
                    class="brutalist-badge badge-accent text-[9px]! px-2! py-1! min-h-0 h-auto cursor-pointer hover:-translate-y-0.5 transition-transform shrink-0"
                    on:click={getLocation}
                    disabled={isLoadingLocation}
                  >
                    {#if isLoadingLocation}
                      <span class="loading loading-spinner loading-box-xs"
                      ></span>
                    {:else}
                      📍 獲取位置
                    {/if}
                  </button>
                </div>
              </div>

              <!-- 偵測按鈕 -->
              <button
                class="brutalist-btn bg-[--color-accent] w-full py-2! text-[10px]! text-center block"
                on:click={handlePasteCheck}
              >
                ⚡️ 偵測剪貼簿連結並填入
              </button>
            </div>

            <div class="space-y-1">
              <label
                for="location-url-input"
                class="text-[10px] font-black uppercase opacity-60 ml-1"
                >Step 2: Paste Link</label
              >
              <input
                id="location-url-input"
                type="url"
                placeholder="貼上 Google Maps 店家連結 (URL)..."
                class="w-full p-4 border-4 border-[--color-border] font-bold text-sm focus:bg-[--color-accent] outline-none transition-colors"
                bind:value={locationUrl}
              />
            </div>
          </div>
        </section>

        {#if errorMsg}
          <div
            class="brutalist-badge bg-error text-white w-full! py-2! text-center"
          >
            {errorMsg}
          </div>
        {/if}

        <button
          class="brutalist-btn-primary w-full! py-6! text-xl {hasPostedToday
            ? 'bg-gray-400 grayscale cursor-not-allowed border-gray-500'
            : ''}"
          disabled={isLoading || hasPostedToday}
          on:click={handleSubmit}
        >
          {#if isLoading}
            <span class="loading loading-spinner mr-2"></span>
          {/if}
          {#if hasPostedToday}
            ALREADY PUBLISHED TODAY
          {:else}
            PUBLISH TODAY'S NOTE
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Toast Notification -->
{#if toast.visible}
  <div
    class="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
    in:fly={{ y: 20, duration: 400 }}
    out:fade={{ duration: 200 }}
  >
    <div
      class="brutalist-card {toast.type === 'error'
        ? 'bg-error text-white'
        : 'bg-accent'} p-4 flex items-center gap-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-shake"
    >
      <span class="text-2xl">{toast.type === "error" ? "❌" : "💡"}</span>
      <p class="font-black italic uppercase tracking-tight text-sm">
        {toast.message}
      </p>
    </div>
  </div>
{/if}

<style>
  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-4px);
    }
    75% {
      transform: translateX(4px);
    }
  }
  .animate-shake {
    animation: shake 0.2s ease-in-out 0s 2;
  }
</style>
