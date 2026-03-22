<script lang="ts">
  import { onMount } from 'svelte';
  import 'maplibre-gl/dist/maplibre-gl.css';

  // --- Props ---
  interface Props {
    center?: [number, number];
    zoom?: number;
    stores?: Array<{ id: string; name: string; lat: number; lng: number }>;
  }

  let { center = [121.5654, 25.0330], zoom = 12, stores = [] }: Props = $props();

  // --- State (Svelte 5 Runes) ---
  let mapContainer: HTMLElement | null = $state(null);
  let isMapInteractive = $state(false);
  let mapInstance: any = null;

  // --- Lifecycle ---
  onMount(() => {
    let mapInstanceInternal: any = null;

    async function initMap() {
      if (!mapContainer) return;

      const gl = (window as any).maplibregl;
      if (!gl) {
        console.error("MapLibre GL CDN 未能載入");
        return;
      }

      mapInstanceInternal = new gl.Map({
        container: mapContainer,
        style: '/map/style.json', // 參考既有組件，使用本機淨化的樣式
        center: center,
        zoom: zoom,
        interactive: false,
      });
      
      mapInstance = mapInstanceInternal;
    }

    // 稍微延遲或等待下一個 tick 確保 DOM 與 CDN 準備好
    setTimeout(initMap, 100);

    // 清理函數
    return () => {
      if (mapInstanceInternal) {
        mapInstanceInternal.remove();
      }
    };
  });

  // 響應式：當地圖解鎖時，啟用 MapLibre 的互動功能
  $effect(() => {
    if (mapInstance) {
      if (isMapInteractive) {
        mapInstance.dragPan.enable();
        mapInstance.scrollZoom.enable();
        mapInstance.touchZoomRotate.enable();
        mapInstance.doubleClickZoom.enable();
      } else {
        mapInstance.dragPan.disable();
        mapInstance.scrollZoom.disable();
        mapInstance.touchZoomRotate.disable();
        mapInstance.doubleClickZoom.disable();
      }
    }
  });

  // 點擊解鎖
  function unlockMap() {
    isMapInteractive = true;
  }

  // 視窗捲動時自動鎖定（防 Scroll Trap）
  function handleWindowScroll() {
    if (isMapInteractive) {
      isMapInteractive = false;
    }
  }
</script>

<svelte:window onscroll={handleWindowScroll} />

<div class="w-full max-w-4xl mx-auto px-4 mb-12">
  <div class="relative w-full h-[40vh] min-h-[320px] rounded-3xl overflow-hidden border-4 border-[--color-border] shadow-brutalist bg-white group">
    
    <!-- 地圖容器 -->
    <div bind:this={mapContainer} class="w-full h-full grayscale-[0.5] contrast-[1.1]"></div>

    <!-- 互動遮罩 -->
    {#if !isMapInteractive}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        class="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/5 hover:bg-black/10 transition-colors backdrop-blur-[0.5px]"
        onclick={unlockMap}
      >
        <div class="bg-white border-4 border-[--color-border] px-6 py-2 shadow-brutalist translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <span class="font-black italic uppercase tracking-tighter">
            點擊以解鎖地圖探索
          </span>
        </div>
      </div>
    {/if}

    <!-- 狀態標籤 -->
    <div class="absolute top-4 left-4 z-20 pointer-events-none">
      <div class="bg-[--color-accent] text-[--color-text] border-2 border-[--color-border] px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_var(--color-border)]">
        LIVE EXPLORER
      </div>
    </div>
  </div>
</div>

<style>
  /* 針對 Brutalist 風格的微調 */
  :global(.maplibregl-ctrl-attrib) {
    display: none !important;
  }
</style>
