<script lang="ts">
  import { onMount } from "svelte";
  import { postForm } from "../lib/postForm.svelte";
  import { viewport } from "../lib/viewportTracker.svelte";

  // UI Components
  import ToastSystem from "./editor/ToastSystem.svelte";
  import PreviewSection from "./editor/PreviewSection.svelte";
  import TypeToggle from "./editor/TypeToggle.svelte";
  import IntensitySlider from "./editor/IntensitySlider.svelte";
  import MoodGrid from "./editor/MoodGrid.svelte";
  import HierarchicalPicker from "./editor/HierarchicalPicker.svelte";
  import MapPicker from "./map/MapPicker.svelte";
  import { supabase } from "../lib/supabase";

  let showMap = $state(false);
  let searchSuggestions = $state<{ name: string; lat: number; lng: number; id?: string; source: string }[]>([]);
  let isSearching = $state(false);
  let searchTimeout: any;

  async function handleSearch(query: string) {
    postForm.isLocationSelected = false; // 開始輸入即視為未選取權威地點
    if (!query || query.length < 2) {
      searchSuggestions = [];
      return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      isSearching = true;
      try {
        // 1. 搜尋 Supabase 本地商店
        const { data: localShops } = await supabase
          .from("shops")
          .select("id, name, latitude, longitude")
          .ilike("name", `%${query}%`)
          .limit(3);

        // 2. 搜尋 Nominatim 全球地標
        // 注意：Nominatim 要求 User-Agent，但在瀏覽器 fetch 中通常不可設，
        // 這裡直接使用其公開 API。頻率過高可能被暫時封鎖。
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
        );
        const globalShops = await nominatimResponse.json();

        // 整合結果 (優先顯示本地)
        const suggestions = [
          ...(localShops?.map(s => ({
            id: s.id,
            name: s.name,
            lat: s.latitude,
            lng: s.longitude,
            source: '本地商店'
          })) || []),
          ...globalShops.map((g: any) => ({
            name: g.display_name.split(',')[0], // 取得主要名稱
            lat: parseFloat(g.lat),
            lng: parseFloat(g.lon),
            source: '全球地標'
          }))
        ];

        // 簡單去重
        searchSuggestions = suggestions.filter((v, i, a) => 
          a.findIndex(t => t.name === v.name) === i
        );
      } catch (e) {
        console.error("搜尋地點失敗:", e);
      } finally {
        isSearching = false;
      }
    }, 400);
  }

  function selectSuggestion(s: any) {
    postForm.shopSearchName = s.name;
    postForm.lat = s.lat;
    postForm.lng = s.lng;
    postForm.shopId = s.id || null;
    postForm.isLocationSelected = true; // 明確點選建議
    searchSuggestions = [];
    showMap = true; // 選取後展示地圖確認
  }

  // Configuration Data (Keep static data here)
  const flavorOptions = [
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

  const originData = {
    coffee: [
      {
        name: "Africa 非洲",
        label: "Africa 非洲",
        children: [
          "衣索比亞",
          "肯亞",
          "盧安達",
          "布隆地",
          "坦尚尼亞",
          "烏干達",
          "剛果民主",
          "象牙海岸",
          "喀麥隆",
          "馬拉威",
          "贊比亞",
          "辛巴威",
        ].map((n) => ({ name: n, label: n })),
      },
      {
        name: "Americas 美洲",
        label: "Americas 美洲",
        children: [
          "巴西",
          "哥倫比亞",
          "墨西哥",
          "瓜地馬拉",
          "宏都拉斯",
          "薩爾瓦多",
          "尼加拉瓜",
          "哥斯大黎加",
          "巴拿馬",
          "秘魯",
          "厄瓜多",
          "玻利維亞",
          "牙買加",
          "多明尼加",
        ].map((n) => ({ name: n, label: n })),
      },
      {
        name: "Asia/Pacific 亞太",
        label: "Asia/Pacific 亞太",
        children: [
          "台灣",
          "越南",
          "印尼",
          "印度",
          "葉門",
          "泰國",
          "寮國",
          "緬甸",
          "菲律賓",
          "雲南",
          "東帝汶",
          "巴布亞紐幾內亞",
          "夏威夷",
          "澳洲",
        ].map((n) => ({ name: n, label: n })),
      },
    ],
    tea: [
      {
        name: "Asia 亞洲",
        label: "Asia 亞洲",
        children: ["台灣", "中國", "日本", "印度", "斯里蘭卡"].map((n) => ({
          name: n,
          label: n,
        })),
      },
      {
        name: "Africa/Others 其他",
        label: "Africa/Others 其他",
        children: [
          { name: "肯亞 Kenya (Tea)", label: "肯亞 Kenya (Tea)" },
          {
            name: "南非 South Africa (Rooibos)",
            label: "南非 South Africa (Rooibos)",
          },
        ],
      },
    ],
  };

  const mainTasteOptions = [
    { name: "salty", label: "鹹 SALTY" },
    { name: "sour", label: "酸 SOUR" },
    { name: "sweet", label: "甜 SWEET" },
    { name: "bitter", label: "苦 BITTER" },
    { name: "umami", label: "鮮 UMAMI" },
  ];

  const mouthfeelOptions = [
    { name: "rough", label: "粗糙 ROUGH" },
    { name: "oily", label: "油脂 OILY" },
    { name: "smooth", label: "滑順 SMOOTH" },
    { name: "mouth_drying", label: "乾澀 MOUTH-DRYING" },
    { name: "metallic", label: "金屬 METALLIC" },
  ];

  const acidityOptions = [
    { name: "dry", label: "DRY\n(HERBY, GRASSY, TART)" },
    { name: "sweet", label: "SWEET\n(JUICY, BRIGHT)" },
  ];

  // Derived logic for Avatar (Filtered Parent Flavors)
  const displayFlavors = $derived(
    postForm.flavors.filter((f) => {
      const p = flavorOptions.find((opt) => opt.name === f);
      if (p && p.children) {
        const hasChildSelected = p.children.some((c) =>
          postForm.flavors.includes(c.name),
        );
        return !hasChildSelected;
      }
      return true;
    }),
  );

  onMount(() => {
    postForm.load();
    postForm.checkAlreadyPosted();
    return viewport.init();
  });

  $effect(() => {
    // This effect ensures any change to postForm state is persisted to localStorage
    // for anonymous users or accidental refreshes.
    postForm.drinkType;
    postForm.itemName;
    postForm.flavors;
    postForm.flavorIntensity;
    postForm.mainTastes;
    postForm.acidityIntensity;
    postForm.acidityType;
    postForm.sweetnessIntensity;
    postForm.mouthfeel;
    postForm.mouthfeelTypes;
    postForm.mood;
    postForm.shopSearchName;
    
    postForm.persist();
  });
</script>

<div class="max-w-4xl mx-auto p-4 space-y-12">
  <div class="text-center">
    <h1 class="text-6xl font-black italic title-outline mb-4">今日杯口</h1>
    <p
      class="font-bold opacity-60 uppercase tracking-widest text-xs border-b-2 border-[--color-border] inline-block pb-2"
    >
      今日限定，每日 0 點重設。
    </p>
  </div>

  {#if postForm.hasPostedToday}
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
      <!-- Left: Preview -->
      <PreviewSection {displayFlavors} />

      <!-- Right: Form -->
      <div class="space-y-10">
        <TypeToggle />

        <!-- Origin Selection -->
        <section class="space-y-4">
          <HierarchicalPicker
            title="Select Origin / Item Name"
            options={originData[postForm.drinkType]}
            selectedItems={[postForm.itemName]}
            onClick={(name) => (postForm.itemName = name)}
          />
          <div class="pt-2">
            <input
              type="text"
              placeholder="或手動輸入全名..."
              class="w-full bg-[#F5F2EA] border-2 border-[--color-border] px-3 py-2 text-xs font-bold focus:bg-accent outline-none"
              bind:value={postForm.itemName}
            />
          </div>
        </section>

        <!-- Flavor Profile -->
        <HierarchicalPicker
          title="Flavor Profile"
          options={flavorOptions}
          selectedItems={postForm.flavors}
          onToggle={(id, isParent, children, parent) =>
            postForm.toggleFlavor(id, isParent, children, parent)}
          showIntensity={true}
          bind:intensityValue={postForm.flavorIntensity}
        />

        <!-- Main Taste -->
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
                type="button"
                class="brutalist-badge text-xs! px-3! transition-all {postForm.mainTastes.includes(
                  opt.name,
                )
                  ? 'badge-accent -translate-y-1 shadow-[2px_2px_0px_0px_var(--color-border)]'
                  : 'badge-white opacity-60'}"
                onclick={() => postForm.toggleMainTaste(opt.name)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </section>

        <!-- Acidity -->
        <section class="space-y-4">
          <IntensitySlider
            label="Acidity"
            bind:value={postForm.acidityIntensity}
          />
          <div class="flex gap-4">
            {#each acidityOptions as opt}
              <button
                type="button"
                class="flex-1 py-3 text-xs font-black border-3 border-[--color-border] whitespace-pre-line transition-all {postForm.acidityType ===
                opt.name
                  ? 'bg-accent -translate-y-1 shadow-brutalist-sm'
                  : 'bg-white opacity-60 shadow-none'}"
                onclick={() => (postForm.acidityType = opt.name as any)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </section>

        <!-- Sweetness -->
        <IntensitySlider
          label="Sweetness"
          bind:value={postForm.sweetnessIntensity}
        />

        <!-- Mouthfeel -->
        <section class="space-y-4">
          <IntensitySlider label="Mouthfeel" bind:value={postForm.mouthfeel} />
          <div class="flex flex-wrap gap-3">
            {#each mouthfeelOptions as opt}
              <button
                class="brutalist-badge text-xs! px-3! transition-all {postForm.mouthfeelTypes.includes(
                  opt.name,
                )
                  ? 'badge-accent -translate-y-1 shadow-[2px_2px_0px_0px_var(--color-border)]'
                  : 'badge-white opacity-60'}"
                onclick={() => postForm.toggleMouthfeel(opt.name)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </section>

        <MoodGrid />

        <!-- Location -->
        <section>
          <div class="flex justify-between items-end mb-4">
            <span class="font-black text-xs uppercase tracking-[0.2em] opacity-50">Discovery Location</span>
            <button 
              type="button"
              class="text-[10px] font-bold underline decoration-2 underline-offset-4 hover:text-accent"
              onclick={() => showMap = !showMap}
            >
              {showMap ? '[- Close Map]' : '[+ Add Map Location]'}
            </button>
          </div>
          
          <div class="bg-[#F5F2EA] border-2 border-[--color-border] p-4 space-y-4">
            <div class="relative">
              <input
                type="text"
                placeholder="輸入地點名稱 (如：西門町、某某咖啡店)..."
                class="w-full bg-white border-2 border-[--color-border] px-3 py-2 text-xs font-bold focus:bg-accent outline-none"
                bind:value={postForm.shopSearchName}
                oninput={(e) => handleSearch(e.currentTarget.value)}
              />
              
              {#if isSearching || searchSuggestions.length > 0}
                <div class="absolute z-50 left-0 right-0 top-full mt-1 bg-white border-2 border-[--color-border] shadow-[4px_4px_0_var(--color-border)] max-h-60 overflow-y-auto">
                  {#if isSearching}
                    <div class="p-3 text-[10px] font-bold opacity-50 italic">搜尋中...</div>
                  {/if}
                  
                  {#each searchSuggestions as s}
                    <button 
                      type="button"
                      class="w-full text-left p-3 border-b last:border-b-0 border-[--color-border] hover:bg-accent group transition-colors"
                      onclick={() => selectSuggestion(s)}
                    >
                      <div class="flex justify-between items-start gap-2">
                        <span class="text-xs font-black truncate">{s.name}</span>
                        <span class="text-[9px] font-bold px-1 bg-[--color-border] text-white group-hover:bg-black uppercase shrink-0">
                          {s.source}
                        </span>
                      </div>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            {#if showMap}
              <div class="animate-in fade-in zoom-in-95 duration-200">
                <MapPicker 
                  location={{ lat: postForm.lat || 25.0339, lng: postForm.lng || 121.5645 }}
                  onChange={(detail) => {
                    postForm.lat = detail.lat;
                    postForm.lng = detail.lng;
                    if (detail.name) {
                      postForm.shopSearchName = detail.name;
                      postForm.isLocationSelected = true; // 點選地圖地標
                    }
                  }}
                  placeholder="拖動圖釘以標記精確位置"
                />
              </div>
            {/if}
          </div>
        </section>

        {#if postForm.errorMsg}
          <div
            class="brutalist-badge bg-error text-white w-full! py-2! text-center"
          >
            {postForm.errorMsg}
          </div>
        {/if}

        <button
          class="brutalist-btn-primary w-full! py-6! text-xl {postForm.hasPostedToday
            ? 'bg-gray-400 grayscale cursor-not-allowed border-gray-500'
            : ''}"
          disabled={postForm.isLoading || postForm.hasPostedToday}
          onclick={postForm.submit}
        >
          {#if postForm.isLoading}
            <span class="loading loading-spinner mr-2"></span>
          {/if}
          {postForm.hasPostedToday
            ? "ALREADY PUBLISHED TODAY"
            : "PUBLISH TODAY'S NOTE"}
        </button>
      </div>
    </div>
  </div>
</div>

<ToastSystem />
