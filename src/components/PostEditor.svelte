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
  import ImageShareCompositor from "./ImageShareCompositor.svelte";
  
  // Refactored Sub-components
  import DraftPrompt from "./editor/DraftPrompt.svelte";
  import PostStatusAlert from "./editor/PostStatusAlert.svelte";
  import LocationSection from "./editor/LocationSection.svelte";

  // Constants
  import { 
    flavorOptions, 
    originData, 
    mainTasteOptions, 
    mouthfeelOptions, 
    acidityOptions 
  } from "../lib/editorConstants";

  let showDraftPrompt = $state(false);
  let showCompositor = $state(false);
  let showPublishConfirm = $state(false);

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
    const { hasDraft, dateMatch } = postForm.load();

    if (hasDraft) {
      if (!dateMatch) {
        postForm.clear();
        postForm.reset();
      } else {
        showDraftPrompt = true;
      }
    }

    postForm.checkAlreadyPosted();
    return viewport.init();
  });

  $effect(() => {
    // Persist changes to localStorage
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
    <p class="font-bold opacity-60 uppercase tracking-widest text-xs border-b-2 border-[--color-border] inline-block pb-2">
      今日限定，每日 0 點重設。
    </p>
  </div>

  <DraftPrompt bind:showDraftPrompt />
  <PostStatusAlert />

  <div class="brutalist-card bg-white p-8 md:p-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
      
      <!-- Left: Preview Column -->
      <div 
        id="preview-column"
        class="flex flex-col gap-8 self-start md:sticky md:top-32"
        style={viewport.isMobile && !showPublishConfirm ? `
          position: sticky; 
          top: ${120 - viewport.scrollProgress * 20}px; 
          z-index: 40;
        ` : ""}
      >
        <PreviewSection {displayFlavors} forceFullSize={showPublishConfirm} />
        
        {#if viewport.isMobile && showPublishConfirm}
           <div id="mobile-confirm-area" class="animate-in fade-in slide-in-from-top-4 duration-300">
             {@render confirmationUI()}
           </div>
        {/if}
      </div>

      <!-- Right: Form Column -->
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
            <span class="font-black text-xs uppercase tracking-[0.2em] opacity-50">
              Main Taste (Select up to two)
            </span>
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
                class="flex-1 py-3 text-xs font-black border-3 border-[--color-border] whitespace-pre-line transition-all {postForm.acidityType === opt.name
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
        
        <LocationSection />

        {#if postForm.errorMsg}
          <div class="brutalist-badge bg-error text-white w-full! py-2! text-center">
            {postForm.errorMsg}
          </div>
        {/if}

        {#if !postForm.hasPostedToday}
          <div class="space-y-4 pt-4 border-t-4 border-[--color-border]/10">
            <button
              class="brutalist-btn bg-white hover:bg-accent w-full py-4 flex items-center justify-center gap-2 group transition-all"
              onclick={() => (showCompositor = true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-12 transition-transform">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span class="font-black text-sm uppercase italic">Create Share Image</span>
            </button>

            {#if !showPublishConfirm}
              <button
                class="brutalist-btn-primary w-full! py-6! text-xl"
                disabled={postForm.isLoading || postForm.hasPostedToday}
                onclick={() => {
                  showPublishConfirm = true;
                  if (viewport.isMobile) {
                    setTimeout(() => {
                      const el = document.getElementById("preview-column");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 50);
                  }
                }}
              >
                {#if postForm.isLoading}
                  <span class="loading loading-spinner mr-2"></span>
                {/if}
                PUBLISH TODAY'S NOTE
              </button>
            {/if}

            {#if !viewport.isMobile && showPublishConfirm}
              <div class="animate-in fade-in zoom-in-95 duration-300">
                {@render confirmationUI()}
              </div>
            {/if}
          </div>
        {:else}
          <div class="brutalist-badge bg-accent w-full! py-4! text-center font-black">
            ALREADY PUBLISHED TODAY
          </div>
        {/if}

        <!-- Reset Button -->
        {#if !postForm.hasPostedToday}
          <div class="text-center">
            <button
              type="button"
              class="text-[10px] font-bold opacity-40 hover:opacity-100 hover:text-error transition-all uppercase tracking-widest decoration-1 underline underline-offset-4"
              onclick={() => {
                if (confirm("確定要清空目前所有輸入內容嗎？")) {
                  postForm.clear();
                  postForm.reset();
                }
              }}
            >
              [ Reset / Clear All Fields ]
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

{#snippet confirmationUI()}
  <div class="brutalist-card bg-accent p-6 flex flex-col items-center gap-4 border-4 border-[--color-border] shadow-brutalist w-full">
    <div class="text-center">
      <p class="font-black text-xl italic uppercase title-outline">Ready to Publish?</p>
      <p class="font-bold text-[10px] opacity-70 mt-1">每日一篇限定，請確認內容正確哦！</p>
    </div>
    <div class="flex gap-3 w-full">
      <button
        class="flex-1 brutalist-btn bg-black text-white py-4 font-black text-sm hover:bg-black/90 active:translate-y-1 transition-all"
        onclick={async () => {
          await postForm.submit();
          showPublishConfirm = false;
        }}
      >
        CONFIRM
      </button>
      <button
        class="flex-1 brutalist-btn bg-white py-4 font-black text-sm hover:bg-bg active:translate-y-1 transition-all"
        onclick={() => (showPublishConfirm = false)}
      >
        CANCEL
      </button>
    </div>
  </div>
{/snippet}

<ToastSystem />

<ImageShareCompositor
  isOpen={showCompositor}
  onClose={() => (showCompositor = false)}
  drinkType={postForm.drinkType}
  flavors={postForm.flavors}
  mood={postForm.mood}
  mouthfeel={postForm.mouthfeel}
  mouthfeelTypes={postForm.mouthfeelTypes}
  flavorIntensity={postForm.flavorIntensity}
  acidityIntensity={postForm.acidityIntensity}
  acidityType={postForm.acidityType}
  sweetnessIntensity={postForm.sweetnessIntensity}
  itemName={postForm.itemName}
  locationName={postForm.shopSearchName}
/>
