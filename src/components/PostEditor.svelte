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
        children: ["衣索比亞", "肯亞", "盧安達", "布隆地", "坦尚尼亞", "烏干達", "剛果民主", "象牙海岸", "喀麥隆", "馬拉威", "贊比亞", "辛巴威"].map(n => ({ name: n, label: n })),
      },
      {
        name: "Americas 美洲",
        label: "Americas 美洲",
        children: ["巴西", "哥倫比亞", "墨西哥", "瓜地馬拉", "宏都拉斯", "薩爾瓦多", "尼加拉瓜", "哥斯大黎加", "巴拿馬", "秘魯", "厄瓜多", "玻利維亞", "牙買加", "多明尼加"].map(n => ({ name: n, label: n })),
      },
      {
        name: "Asia/Pacific 亞太",
        label: "Asia/Pacific 亞太",
        children: ["台灣", "越南", "印尼", "印度", "葉門", "泰國", "寮國", "緬甸", "菲律賓", "雲南", "東帝汶", "巴布亞紐幾內亞", "夏威夷", "澳洲"].map(n => ({ name: n, label: n })),
      },
    ],
    tea: [
      {
        name: "Asia 亞洲",
        label: "Asia 亞洲",
        children: ["台灣", "中國", "日本", "印度", "斯里蘭卡"].map(n => ({ name: n, label: n })),
      },
      {
        name: "Africa/Others 其他",
        label: "Africa/Others 其他",
        children: [{ name: "肯亞 Kenya (Tea)", label: "肯亞 Kenya (Tea)" }, { name: "南非 South Africa (Rooibos)", label: "南非 South Africa (Rooibos)" }],
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
    { name: "dry", label: "DRY (HERBY, GRASSY, TART)" },
    { name: "sweet", label: "SWEET (JUICY, BRIGHT)" }
  ];

  // Derived logic for Avatar (Filtered Parent Flavors)
  const displayFlavors = $derived(
    postForm.flavors.filter((f) => {
      const p = flavorOptions.find((opt) => opt.name === f);
      if (p && p.children) {
        const hasChildSelected = p.children.some((c) => postForm.flavors.includes(c.name));
        return !hasChildSelected;
      }
      return true;
    })
  );

  onMount(() => {
    postForm.checkAlreadyPosted();
    return viewport.init();
  });
</script>

<div class="max-w-4xl mx-auto p-4 space-y-12">
  <div class="text-center">
    <h1 class="text-6xl font-black italic title-outline mb-4">今日杯口</h1>
    <p class="font-bold opacity-60 uppercase tracking-widest text-xs border-b-2 border-[--color-border] inline-block pb-2">
      24 小時限定，每日僅此一次。
    </p>
  </div>

  {#if postForm.hasPostedToday}
    <div class="brutalist-card bg-accent p-6 text-center max-w-2xl mx-auto shadow-[8px_8px_0px_0px_var(--color-border)] animate-in fade-in slide-in-from-top-4">
      <div class="flex items-center justify-center gap-4">
        <span class="text-3xl">⚠️</span>
        <div>
          <p class="text-xl font-black italic uppercase">Already Shared.</p>
          <p class="font-bold opacity-80 text-sm">您今天已經有發文紀錄了，目前僅開放預覽操作。</p>
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
              placeholder="或手動輸入名稱..."
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
          onToggle={(id, isParent, children, parent) => postForm.toggleFlavor(id, isParent, children, parent)}
          showIntensity={true}
          bind:intensityValue={postForm.flavorIntensity}
        />

        <!-- Main Taste -->
        <section class="space-y-4">
          <header class="border-b-2 border-[--color-border] pb-2">
            <span class="font-black text-xs uppercase tracking-[0.2em] opacity-50">Main Taste (Select up to two)</span>
          </header>
          <div class="flex flex-wrap gap-3">
            {#each mainTasteOptions as opt}
              <button
                type="button"
                class="brutalist-badge text-xs! px-3! transition-all {postForm.mainTastes.includes(opt.name)
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
          <IntensitySlider label="Acidity" bind:value={postForm.acidityIntensity} />
          <div class="flex gap-4">
            {#each acidityOptions as opt}
              <button
                type="button"
                class="flex-1 py-3 text-xs font-black border-3 border-[--color-border] transition-all {postForm.acidityType === opt.name
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
        <IntensitySlider label="Sweetness" bind:value={postForm.sweetnessIntensity} />

        <!-- Mouthfeel -->
        <section class="space-y-4">
          <IntensitySlider label="Mouthfeel" bind:value={postForm.mouthfeel} />
          <div class="flex flex-wrap gap-3">
            {#each mouthfeelOptions as opt}
              <button
                class="brutalist-badge text-xs! px-3! transition-all {postForm.mouthfeelTypes.includes(opt.name)
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
          <span class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50">Discovery Location</span>
          <div class="bg-[#F5F2EA] border-2 border-[--color-border] p-4">
            <input
              type="text"
              placeholder="輸入地點名稱 (如：西門町、某某咖啡店)..."
              class="w-full bg-white border-2 border-[--color-border] px-3 py-2 text-xs font-bold focus:bg-accent outline-none"
              bind:value={postForm.shopSearchName}
            />
          </div>
        </section>

        {#if postForm.errorMsg}
          <div class="brutalist-badge bg-error text-white w-full! py-2! text-center">
            {postForm.errorMsg}
          </div>
        {/if}

        <button
          class="brutalist-btn-primary w-full! py-6! text-xl {postForm.hasPostedToday ? 'bg-gray-400 grayscale cursor-not-allowed border-gray-500' : ''}"
          disabled={postForm.isLoading || postForm.hasPostedToday}
          onclick={postForm.submit}
        >
          {#if postForm.isLoading}
            <span class="loading loading-spinner mr-2"></span>
          {/if}
          {postForm.hasPostedToday ? 'ALREADY PUBLISHED TODAY' : "PUBLISH TODAY'S NOTE"}
        </button>
      </div>
    </div>
  </div>
</div>

<ToastSystem />
