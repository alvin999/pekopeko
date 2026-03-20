<script lang="ts">
  import { onMount } from 'svelte';
  // 僅使用型別，實體由 Layout.astro 的 CDN 載入
  import type maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  // Svelte 5 Props
  interface Location { lat: number; lng: number; name?: string }
  let { 
    location = { lat: 25.0339, lng: 121.5645 }, 
    placeholder = "點擊地圖選擇地點",
    onChange 
  } = $props<{
    location: Location,
    placeholder?: string,
    onChange?: (detail: Location) => void
  }>();

  let mapContainer: HTMLDivElement | undefined = $state();
  let map: maplibregl.Map | undefined;
  let marker: maplibregl.Marker | undefined;
  let isLocating = $state(false);

  onMount(() => {
    if (!mapContainer) return;

    const initMap = async () => {
      // 延遲 200ms
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        const gl = (window as any).maplibregl;
        if (!gl) {
          console.error("MapLibre GL CDN 未能載入");
          return;
        }

        map = new gl.Map({
          container: mapContainer!,
          style: 'https://tiles.openfreemap.org/styles/liberty',
          center: [location.lng, location.lat],
          zoom: 15
        });

        if (map) {
          map.on('load', () => {
            // 強制觸發一次尺寸重算，解決空白畫布問題
            map?.resize();
          });

          marker = new gl.Marker({ draggable: true })
            .setLngLat([location.lng, location.lat])
            .addTo(map);

          if (marker) {
            marker.on('dragend', () => {
              if (marker) {
                const lngLat = marker.getLngLat();
                handleLocationChange(lngLat.lat, lngLat.lng);
              }
            });
          }

          map.on('click', (e: any) => {
            if (!map || !marker) return;
            // 1. 先嘗試捕捉點擊處的地標 (POI)
            const features = map.queryRenderedFeatures(e.point, {
              layers: undefined // 檢索所有圖層，我們會手動過濾
            });

          // 尋找具有 'name' 屬性且可能是地標的特徵
          const poiFeature = features.find((f: any) => {
            const props = f.properties || {};
            return props.name && (
              f.layer.id.includes('poi') || 
              f.layer.id.includes('place') || 
              f.layer.id.includes('label') ||
              props.class === 'shop' ||
              props.class === 'cafe' ||
              props.class === 'restaurant'
            );
          });

          let finalName: string | undefined = undefined;
          let finalLngLat = e.lngLat;

          if (poiFeature) {
            finalName = poiFeature.properties.name;
            // 如果是點狀要素，嘗試吸附到精確中心
            if (poiFeature.geometry.type === 'Point') {
              const coords = poiFeature.geometry.coordinates as [number, number];
              finalLngLat = new gl.LngLat(coords[0], coords[1]);
            }
          }

          // 2. 更新標記位置
          if (marker) {
            marker.setLngLat(finalLngLat);
            handleLocationChange(finalLngLat.lat, finalLngLat.lng, finalName);
          }
        });
      }
      } catch (err) {
        console.error("地圖初始化失敗 (方案 A):", err);
      }
    };

    initMap();

    return () => map?.remove();
  });

  // Svelte 5 反應式追蹤：當外部 location 改變時 (如搜尋選取)，同步更新地圖
  $effect(() => {
    if (map && marker && location) {
      const { lat, lng } = location;
      const currentLngLat = marker.getLngLat();
      // 只有當差距大於微小值時才更新，避免與手動拖動衝突
      if (Math.abs(currentLngLat.lat - lat) > 0.0001 || Math.abs(currentLngLat.lng - lng) > 0.0001) {
        map.flyTo({ center: [lng, lat], zoom: 16 });
        marker.setLngLat([lng, lat]);
      }
    }
  });

  function handleLocationChange(lat: number, lng: number, name?: string) {
    if (onChange) onChange({ lat, lng, name });
  }

  function relocate() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert("您的瀏覽器不支援地理定位元件。");
      return;
    }

    isLocating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (map && marker) {
          map.flyTo({ center: [longitude, latitude], zoom: 16 });
          marker.setLngLat([longitude, latitude]);
          handleLocationChange(latitude, longitude);
        }
        isLocating = false;
      },
      (error) => {
        console.error("定位失敗:", error);
        alert("無法獲取定位，請檢查權限設定。");
        isLocating = false;
      },
      { enableHighAccuracy: true }
    );
  }
</script>

<div class="map-picker-container">
  <div class="map-header">
    <span class="truncate pr-2">{placeholder}</span>
    <button 
      type="button" 
      class="relocate-btn" 
      onclick={relocate}
      disabled={isLocating}
    >
      {isLocating ? '定位中...' : '📍 目前位置'}
    </button>
  </div>
  <div bind:this={mapContainer} class="map-canvas"></div>
  <div class="coords-info">
    <span>經度: {location.lng.toFixed(6)}</span>
    <span>緯度: {location.lat.toFixed(6)}</span>
  </div>
</div>

<style>
  .map-picker-container {
    width: 100%;
    border: 3px solid var(--color-border);
    background: var(--color-bg);
    overflow: hidden;
  }
  .map-canvas {
    height: 300px;
    width: 100%;
  }
  .map-header {
    padding: 0.5rem;
    font-size: 0.7rem;
    font-weight: bold;
    background: var(--color-accent);
    border-bottom: 2px solid var(--color-border);
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
  .relocate-btn {
    flex-shrink: 0;
    background: white;
    border: 2px solid var(--color-border);
    padding: 2px 8px;
    font-size: 0.65rem;
    font-weight: black;
    cursor: pointer;
    box-shadow: 2px 2px 0 var(--color-border);
    transition: all 0.1s;
    white-space: nowrap;
  }
  .relocate-btn:active {
    box-shadow: 0 0 0 var(--color-border);
    transform: translate(2px, 2px);
  }
  .relocate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .coords-info {
    padding: 0.5rem;
    font-size: 0.75rem;
    font-family: monospace;
    display: flex;
    justify-content: space-between;
    background: var(--color-bg-secondary);
    border-top: 2px solid var(--color-border);
  }
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
