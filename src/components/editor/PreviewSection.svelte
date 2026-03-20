<script lang="ts">
  import AvatarGenerator from "../AvatarGenerator.svelte";
  import ImageShareCompositor from "../ImageShareCompositor.svelte";
  import { viewport } from "../../lib/viewportTracker.svelte";
  import { postForm } from "../../lib/postForm.svelte";

  let showCompositor = $state(false);

  // 選取顯示用風味（邏輯維持原樣：過濾掉有子項被選取的父項）
  // 這裡我們直接傳入處理過的 flavors 或是讓 Preview 自己處理
  let { displayFlavors, forceFullSize = false } = $props<{ displayFlavors: string[], forceFullSize?: boolean }>();

  // 不再使用 effectiveProgress 模擬，改回 viewport.scrollProgress，
  // 並且在 forceFullSize 時解除 sticky 與縮放效果，避免蓋到下方的表單內容。
</script>

<div 
  class="self-start space-y-8 transition-all duration-300 ease-out w-full"
  style={viewport.isMobile && !forceFullSize ? `
    transform: scale(${1 - viewport.scrollProgress * 0.55}) translateY(${viewport.scrollProgress * -10}px);
    transform-origin: top center;
    opacity: ${1 - viewport.scrollProgress * 0.1};
    margin-bottom: ${-viewport.scrollProgress * 200}px;
    filter: drop-shadow(0 ${10 - viewport.scrollProgress * 10}px 20px rgba(0,0,0,0.1));
  ` : ""}
>
  <div 
    class="brutalist-badge badge-accent text-sm! px-4! italic md:block"
    style={viewport.isMobile && !forceFullSize ? `opacity: ${1 - viewport.scrollProgress * 2}; height: ${1 - viewport.scrollProgress > 0.5 ? 'auto' : '0'}; overflow: hidden;` : ""}
  >
    Live Preview
  </div>
  <div
    class="bg-[#F5F2EA] p-8 md:p-8 border-6 border-[--color-border] shadow-[12px_12px_0px_0px_var(--color-border)] flex flex-col items-center gap-8 transition-all"
    style={viewport.isMobile && !forceFullSize ? `
      padding: ${32 - viewport.scrollProgress * 24}px;
      gap: ${32 - viewport.scrollProgress * 28}px;
      box-shadow: ${12 - viewport.scrollProgress * 8}px ${12 - viewport.scrollProgress * 8}px 0px 0px var(--color-border);
    ` : ""}
  >
    <AvatarGenerator
      drinkType={postForm.drinkType}
      flavors={displayFlavors}
      mood={postForm.mood}
      size={viewport.isMobile && !forceFullSize ? 300 * (1 - viewport.scrollProgress * 0.4) : 300}
      flavorIntensity={postForm.flavorIntensity}
      acidityIntensity={postForm.acidityIntensity}
      acidityType={postForm.acidityType}
      sweetnessIntensity={postForm.sweetnessIntensity}
      mouthfeel={postForm.mouthfeel}
      mouthfeelTypes={postForm.mouthfeelTypes}
    />
    <div 
      class="flex flex-col items-center gap-4 transition-opacity w-full"
      style={viewport.isMobile && !forceFullSize ? `opacity: ${1 - viewport.scrollProgress * 1.5}; height: ${viewport.scrollProgress > 0.7 ? '0' : 'auto'}; overflow: hidden;` : ""}
    >
      <div class="flex flex-wrap justify-center gap-3">
        {#each displayFlavors as f}
          <span class="brutalist-badge badge-white text-[10px]! px-3!">{f}</span>
        {/each}
        <span class="brutalist-badge badge-coffee text-[10px]! px-3! uppercase">
          {postForm.mouthfeel} body
        </span>
      </div>
    </div>
  </div>
</div>
