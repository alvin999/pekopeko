<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "../lib/supabase";
  import AvatarGenerator from "./AvatarGenerator.svelte";

  let drinkType: "coffee" | "tea" = "coffee";
  let flavors: string[] = [];
  let body: "light" | "round" | "heavy" = "round";
  let mood = "🙂";
  let locationUrl = "";
  let shopSearchName = ""; // 新增店名搜尋
  let currentCoords: { lat: number; lng: number } | null = null; // 存儲座標
  let isLoadingLocation = false;
  let searchUrl = "";
  let embedUrl = "";
  let isLoading = false;
  let userLang = "zh-TW"; // 預設值
  let errorMsg = "";
  let hasPostedToday = false;

  // 自動偵測剪貼簿內容
  async function handlePasteCheck() {
    errorMsg = ""; // 清除舊錯誤
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error("您的瀏覽器或環境 (非 HTTPS) 不支援剪貼簿存取");
      }

      const text = await navigator.clipboard.readText();
      const isMapsUrl = text.includes("google.com/maps") || text.includes("goo.gl/maps");
      
      if (isMapsUrl) {
        locationUrl = text;
        // 視覺回饋：閃爍綠色 (這裡使用 accent 顏色)
        const input = document.getElementById("location-url-input");
        if (input) {
          input.classList.add("bg-[--color-accent]", "scale-[1.02]");
          setTimeout(() => input.classList.remove("bg-[--color-accent]", "scale-[1.02]"), 800);
        }
      } else {
        errorMsg = "剪貼簿內沒有發現有效的 Google Maps 連結，請手動複製貼上。";
      }
    } catch (err: any) {
      console.log("無法存取剪貼簿", err);
      if (err.name === 'NotAllowedError') {
        errorMsg = "權限不足：請在瀏覽器設定中允許此網站存取剪貼簿，或手動貼上連結。";
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
    {
      name: "floral",
      label: "花香",
      children: [
        {
          name: "white_flower",
          label: "白花",
          children: [
            { name: "ginger_flower", label: "野薑花" },
            { name: "jasmine", label: "茉莉花" }
          ]
        },
        { name: "red_flower", label: "紅花" }
      ]
    },
    {
      name: "citrus",
      label: "柑橘",
      children: [
        { name: "lemon", label: "檸檬" },
        { name: "orange", label: "甜橙" },
        { name: "grapefruit", label: "葡萄柚" }
      ]
    },
    {
      name: "berry",
      label: "莓果",
      children: [
        { name: "strawberry", label: "草莓" },
        { name: "blueberry", label: "藍莓" },
        { name: "raspberry", label: "覆盆子" }
      ]
    },
    {
      name: "nutty",
      label: "堅果",
      children: [
        { name: "almond", label: "杏仁" },
        { name: "hazelnut", label: "榛果" },
        { name: "walnut", label: "核桃" }
      ]
    },
    { name: "honey", label: "蜂蜜" },
    { name: "chocolate", label: "巧克力" },
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
    if (flavors.includes(flavor)) {
      flavors = flavors.filter((f) => f !== flavor);
    } else {
      flavors = [...flavors, flavor];
    }
  }

  function toggleExpand(nodeName: string) {
    if (expandedNodes.has(nodeName)) {
      expandedNodes.delete(nodeName);
    } else {
      expandedNodes.add(nodeName);
    }
    expandedNodes = expandedNodes; // Trigger Svelte reactivity
  }

  async function handleSubmit() {
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
      flavors,
      body,
      mood,
      location_url: locationUrl,
      location_name: shopSearchName,
    });

    if (error) {
      errorMsg = error.message;
    } else {
      window.location.href = "/";
    }
    isLoading = false;
  }
</script>

<div class="max-w-4xl mx-auto p-4 space-y-12">
  <div class="text-center">
    <h1 class="text-6xl font-black italic title-outline mb-4">今日飲筆記</h1>
    <p
      class="font-bold opacity-60 uppercase tracking-widest text-xs border-b-2 border-[--color-border] inline-block pb-2"
    >
      24 小時限定，每日僅此一次。
    </p>
  </div>

  {#if hasPostedToday}
    <div class="brutalist-card bg-white p-12 text-center max-w-2xl mx-auto">
      <p class="text-2xl font-black italic uppercase">Already Shared.</p>
      <p class="mt-2 font-bold opacity-60">
        你今天已經分享過飲品了！明天再來吧 🙏
      </p>
      <a href="/" class="brutalist-btn-primary mt-8">返回首頁</a>
    </div>
  {:else}
    <div class="brutalist-card bg-white p-8 md:p-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <!-- Preview Group -->
        <div class="space-y-8">
          <div class="brutalist-badge badge-accent text-sm! px-4! italic">Live Preview</div>
          <div
            class="bg-[#F5F2EA] p-12 border-6 border-[--color-border] shadow-[12px_12px_0px_0px_var(--color-border)] flex flex-col items-center gap-8"
          >
            <AvatarGenerator {drinkType} {flavors} {body} {mood} size={300} />
            <div class="flex flex-wrap justify-center gap-3">
              {#each flavors as f}
                <span class="brutalist-badge badge-white text-sm! px-4!">{f}</span>
              {/each}
              <span
                class="brutalist-badge badge-coffee text-sm! px-4! uppercase"
                >{body} body</span
              >
            </div>
          </div>
        </div>

        <!-- Form Group -->
        <div class="space-y-10">
          <section>
            <label
              class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50"
              >Select Beverage Type</label
            >
            <div class="flex gap-4">
              <button
                class="brutalist-btn flex-1 {drinkType === 'coffee'
                  ? 'bg-[--color-coffee] text-white'
                  : 'bg-white'}"
                on:click={() => (drinkType = "coffee")}
              >
                ☕ COFFEE
              </button>
              <button
                class="brutalist-btn flex-1 {drinkType === 'tea'
                  ? 'bg-[--color-tea] text-white'
                  : 'bg-white'}"
                on:click={() => (drinkType = "tea")}
              >
                🍵 TEA
              </button>
            </div>
          </section>

          <section>
            <label
              class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50"
              >Flavor Profile</label
            >
            
            <div class="space-y-4">
              {#each flavorOptions as f}
                <div class="flavor-group">
                  <div class="flex items-center gap-2">
                    <button
                      class="brutalist-badge text-xs! px-4! transition-all {flavors.includes(f.name)
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
                    <div class="ml-6 mt-3 pl-4 border-l-2 border-[--color-border] flex flex-wrap gap-3">
                      {#each f.children as child}
                        <div class="flex flex-col gap-3">
                          <button
                            class="brutalist-badge text-xs! px-4! transition-all {flavors.includes(child.name)
                              ? 'badge-accent -translate-y-1 shadow-[2px_2px_0px_0px_var(--color-border)]'
                              : 'badge-white opacity-60'}"
                            on:click={() => {
                              toggleFlavor(child.name);
                              if (child.children) toggleExpand(child.name);
                            }}
                          >
                            {child.label.toUpperCase()}
                          </button>
                          
                          {#if child.children && expandedNodes.has(child.name)}
                            <div class="ml-4 pl-4 border-l-2 border-[--color-border] border-dashed flex flex-wrap gap-2">
                              {#each child.children as grandchild}
                                <button
                                  class="brutalist-badge text-xs! px-4! transition-all {flavors.includes(grandchild.name)
                                    ? 'badge-accent -translate-y-1 shadow-[1px_1px_0px_0px_var(--color-border)]'
                                    : 'badge-white opacity-50'}"
                                  on:click={() => toggleFlavor(grandchild.name)}
                                >
                                  {grandchild.label.toUpperCase()}
                                </button>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </section>

          <section>
            <label
              class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50"
              >Mouthfeel (Body)</label
            >
            <div class="px-2">
              <input
                type="range"
                min="0"
                max="2"
                class="range range-xs"
                step="1"
                on:change={(e) => {
                  const val = parseInt(e.currentTarget.value);
                  body = val === 0 ? "light" : val === 1 ? "round" : "heavy";
                }}
              />
              <div
                class="w-full flex justify-between font-black text-[10px] uppercase mt-4 text-[--color-text] opacity-80"
              >
                <span>Light / 清爽</span>
                <span>Round / 圓潤</span>
                <span>Heavy / 厚實</span>
              </div>
            </div>
          </section>

          <section>
            <label
              class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50"
              >Current Mood</label
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
            <label
              class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50"
              >Discovery Location</label
            >
            
            <div class="space-y-4">
              <div class="bg-[#F5F2EA] border-2 border-[--color-border] p-4 space-y-4">
                <!-- 搜尋輸入框 -->
                <div class="relative">
                  <input 
                    type="text"
                    placeholder="搜尋特定店名..."
                    class="w-full bg-white border-2 border-[--color-border] px-3 py-2 text-xs font-bold focus:bg-[--color-accent] outline-none"
                    bind:value={shopSearchName}
                  />
                </div>

                <!-- 嵌入地圖 (有座標才顯示) -->
                {#if embedUrl}
                  <div class="animate-in fade-in slide-in-from-top-1">
                    <div class="border-2 border-[--color-border] shadow-[4px_4px_0px_0px_var(--color-border)] overflow-hidden h-[200px]">
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
                <div class="bg-black p-3 space-y-2 border-2 border-[--color-border]">
                  <div class="flex items-start justify-between gap-2">
                    <div class="space-y-2">
                      <p class="text-[11px] font-black leading-tight uppercase tabular-nums text-white">
                        1. <span class="text-[--color-accent]">定位</span>或在地圖找到店家
                      </p>
                      <p class="text-[11px] font-black leading-tight uppercase tabular-nums text-white text-opacity-100">
                        2. 點選「<span class="text-[--color-accent]">分享</span>」並「<span class="text-[--color-accent]">複製連結</span>」
                      </p>
                      <p class="text-[11px] font-black leading-tight uppercase tabular-nums text-white">
                        3. 回到此處點擊<span class="text-[--color-accent]">偵測按鈕</span>
                      </p>
                    </div>
                    
                    <button 
                      class="brutalist-badge badge-accent text-[9px]! px-2! py-1! min-h-0 h-auto cursor-pointer hover:-translate-y-0.5 transition-transform shrink-0"
                      on:click={getLocation}
                      disabled={isLoadingLocation}
                    >
                      {#if isLoadingLocation}
                        <span class="loading loading-spinner loading-box-xs"></span>
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
                >Step 2: Paste Link</label>
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
            class="brutalist-btn-primary w-full! py-6! text-xl"
            disabled={isLoading}
            on:click={handleSubmit}
          >
            {#if isLoading}
              <span class="loading loading-spinner mr-2"></span>
            {/if}
            PUBLISH TODAY'S NOTE
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
