<script lang="ts">
  import type { DrinkData } from "../lib/types";
  import ImageShareCompositor from "./ImageShareCompositor.svelte";
  import { postForm } from "../lib/postForm.svelte";

  interface Props extends Partial<DrinkData> {
    drinkName?: string;
  }

  let { 
    drinkName = "PekoPeko Drink",
    ...drinkProps
  }: Props = $props();

  const drinkData = $derived({
    drinkType: drinkProps.drinkType ?? postForm.drinkType,
    flavors: drinkProps.flavors ?? postForm.flavors,
    mood: drinkProps.mood ?? postForm.mood,
    mouthfeel: drinkProps.mouthfeel ?? postForm.mouthfeel,
    mouthfeelTypes: drinkProps.mouthfeelTypes ?? postForm.mouthfeelTypes,
    flavorIntensity: drinkProps.flavorIntensity ?? postForm.flavorIntensity,
    acidityIntensity: drinkProps.acidityIntensity ?? postForm.acidityIntensity,
    acidityType: drinkProps.acidityType ?? postForm.acidityType,
    sweetnessIntensity: drinkProps.sweetnessIntensity ?? postForm.sweetnessIntensity,
    itemName: drinkProps.itemName ?? postForm.itemName,
    locationName: drinkProps.locationName ?? postForm.shopSearchName
  });

  let showCompositor = $state(false);

  let showCopySuccess = $state(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '杯口杯口 PekoPeko',
          text: `瞧瞧我今天的這杯：${drinkName}！`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed');
      }
    } else {
      // Fallback: Copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        showCopySuccess = true;
        setTimeout(() => showCopySuccess = false, 2000);
      } catch (err) {
        console.error('Copy failed', err);
      }
    }
  }
</script>

<div class="flex flex-col sm:flex-row gap-4 p-1">
  <button 
    class="brutalist-btn bg-white hover:bg-[--color-accent] flex-1 gap-2 group transition-all" 
    onclick={() => showCompositor = true}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-12 transition-transform"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
    <span class="font-black text-xs uppercase italic text-nowrap">Create Share Image</span>
  </button>
  <button class="brutalist-btn-primary flex-1 gap-2 group transition-all relative overflow-hidden" onclick={share}>
    {#if showCopySuccess}
      <div class="absolute inset-0 bg-[--color-accent] text-[--color-text] flex items-center justify-center font-black italic animate-in fade-in zoom-in duration-200">
        LINK COPIED!
      </div>
    {/if}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    <span class="font-black text-xs uppercase italic text-nowrap">Share Post</span>
  </button>
</div>

<ImageShareCompositor
  isOpen={showCompositor}
  onClose={() => showCompositor = false}
  {...drinkData}
/>
