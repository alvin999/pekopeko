<script lang="ts">
  import { onMount, tick } from "svelte";
  import type maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";

  // --- Props ---
  interface Store {
    id: string;
    name: string;
    lat: number;
    lng: number;
  }

  interface Props {
    center?: [number, number];
    zoom?: number;
    stores?: Store[];
  }

  let {
    center = [121.5654, 25.033],
    zoom = 12,
    stores = [],
  } = $props<{
    center?: [number, number];
    zoom?: number;
    stores?: Store[];
  }>();

  // --- State (Svelte 5 Runes) ---
  let mapContainer: HTMLDivElement | undefined = $state();
  let isMapInteractive = $state(false);
  let mapInstance = $state<maplibregl.Map | null>(null);
  let isLocating = $state(false);
  let markers: maplibregl.Marker[] = []; // 用於追蹤與清理標記
  let scrollY = $state(0);
  let isSticky = $derived(scrollY > 100);
  // 當置頂且非互動狀態時為「纖薄模式」
  let isThin = $derived(isSticky && !isMapInteractive);
  // 動態透明度：纖薄模式下半透明，增加閱讀舒適度
  let mapOpacity = $derived(isThin ? 0.6 : 1);

  // 顯示店家標記
  $effect(() => {
    if (mapInstance && stores && stores.length > 0) {
      const gl = (window as any).maplibregl;
      if (!gl) return;

      // 清除舊標記
      markers.forEach((m) => m.remove());
      markers = [];

      // 加入新標記
      stores.forEach((s: Store) => {
        if (s.lat && s.lng) {
          const marker = new gl.Marker({ color: "#FE7112" }) // 使用品牌色或顯眼顏色
            .setLngLat([s.lng, s.lat])
            .setPopup(
              new gl.Popup({ offset: 25 }).setHTML(
                `<div class="p-2 font-bold text-xs">${s.name}</div>`,
              ),
            )
            .addTo(mapInstance!);
          markers.push(marker);
        }
      });

      // 如果有標記，自動調整地圖縮放以包含所有標記
      if (markers.length > 0) {
        const bounds = new gl.LngLatBounds();
        stores.forEach((s: Store) => {
          if (s.lng && s.lat) bounds.extend([s.lng, s.lat]);
        });
        mapInstance!.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }
    }
  });

  function relocate() {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      alert("您的瀏覽器不支援地理定位。");
      return;
    }

    isLocating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstance) {
          mapInstance.flyTo({ center: [longitude, latitude], zoom: 14 });
          isMapInteractive = true; // 定位後自動解鎖以便操作
        }
        isLocating = false;
      },
      (error) => {
        console.error("定位失敗:", error);
        alert("無法獲取定位，請檢查權限設定。");
        isLocating = false;
      },
      { enableHighAccuracy: true },
    );
  }

  // --- Lifecycle ---
  onMount(() => {
    let mapInstanceInternal: maplibregl.Map | null = null;

    // 監聽外部「移動到指定位置」的請求
    const handleMoveTo = (e: any) => {
      const { lat, lng } = e.detail;
      if (mapInstanceInternal) {
        mapInstanceInternal.flyTo({ center: [lng, lat], zoom: 16 });
        isMapInteractive = true; // 點擊時自動解鎖
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("pekopeko:map-move-to", handleMoveTo);
    }

    async function initMap() {
      // 等待 DOM 與可能需要的 tick
      await tick();
      // 延遲 300ms 確保穩定
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!mapContainer) return;

      const gl = (window as any).maplibregl;
      if (!gl) {
        console.error("MapLibre GL CDN 未能載入");
        return;
      }

      // 再次確認數值合法性
      const safeCenter = Array.isArray(center) ? center : [121.5654, 25.033];
      const safeZoom = typeof zoom === "number" ? zoom : 12;

      mapInstanceInternal = new gl.Map({
        container: mapContainer,
        style: "/map/style.json",
        center: safeCenter,
        zoom: safeZoom,
        interactive: false,
      });

      mapInstance = mapInstanceInternal;
    }

    initMap();

    // 清理函數
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("pekopeko:map-move-to", handleMoveTo);
      }
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

  // 監聽尺寸變動並調整地圖渲染
  $effect(() => {
    if (mapInstance && (isSticky || isThin || isMapInteractive)) {
      // 在高度動畫執行中或結束後呼叫 resize
      setTimeout(() => mapInstance?.resize(), 100);
      setTimeout(() => mapInstance?.resize(), 500);
    }
  });

  // 點擊解鎖
  function unlockMap() {
    isMapInteractive = true;
  }

  // 視窗捲動時自動更新狀態
  function handleWindowScroll() {
    scrollY = window.scrollY;
    if (isMapInteractive && !isSticky) {
      isMapInteractive = false;
    }
  }
</script>

<svelte:window onscroll={handleWindowScroll} />

<div
  class="w-full transition-all duration-500 ease-in-out"
  style="opacity: {mapOpacity};"
>
  <div
    class="relative w-full transition-all duration-500 ease-in-out overflow-hidden border-4 border-[--color-border] shadow-brutalist bg-white group"
    class:h-[40vh]={!isSticky}
    class:min-h-[320px]={!isSticky}
    class:h-[180px]={isSticky && isMapInteractive}
    class:h-[80px]={isThin}
    class:rounded-3xl={!isSticky}
    class:rounded-xl={isSticky}
    class:shadow-none={isSticky}
  >
    <!-- 地圖容器 -->
    <div bind:this={mapContainer} class="w-full h-full"></div>

    <!-- 互動遮罩 (僅在非置頂或未解鎖時顯示核心提示) -->
    {#if !isMapInteractive}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/5 hover:bg-black/10 transition-colors backdrop-blur-[0.5px]"
        onclick={unlockMap}
      >
        {#if !isSticky}
          <div
            class="bg-white border-4 border-[--color-border] px-6 py-2 shadow-brutalist translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          >
            <span class="font-black italic uppercase tracking-tighter">
              點擊以解鎖地圖探索
            </span>
          </div>
        {/if}
      </div>
    {/if}

    <!-- 狀態標籤 -->
    <div class="absolute top-4 left-4 z-20 pointer-events-none">
      <div
        class="bg-[--color-accent] text-[--color-text] border-2 border-[--color-border] px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_var(--color-border)]"
      >
        LIVE EXPLORER
      </div>
    </div>

    <!-- 定位按鈕 -->
    <div class="absolute bottom-4 right-4 z-20">
      <button
        class="bg-white border-2 border-[--color-border] p-2 shadow-[2px_2px_0px_0px_var(--color-border)] hover:bg-[--color-accent] active:translate-x-px active:translate-y-px active:shadow-none transition-all disabled:opacity-50"
        onclick={relocate}
        disabled={isLocating}
        title="取得目前位置"
      >
        {#if isLocating}
          <div
            class="w-4 h-4 border-2 border-[--color-border] border-t-transparent rounded-full animate-spin"
          ></div>
        {:else}
          <span class="text-sm">📍</span>
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  /* 針對 Brutalist 風格的微調 */
  :global(.maplibregl-ctrl-attrib) {
    display: none !important;
  }
</style>
