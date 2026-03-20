<script lang="ts">
  import { onMount } from 'svelte';
  // 移除靜態匯入，改為在 onMount 內動態載入
  // import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  interface Props {
    lat: number;
    lng: number;
    name?: string;
  }

  // Svelte 5 Props
  let { lat, lng, name = "" }: Props = $props();

  let mapContainer: HTMLDivElement | undefined = $state();
  let map: any;

  onMount(() => {
    if (!lat || !lng || !mapContainer) return;

    const initMap = async () => {
      // 延遲 200ms
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        const maplibregl = (await import('maplibre-gl')).default;
        const resp = await fetch('https://tiles.openfreemap.org/styles/liberty');
        const style = await resp.json();

        // 方案 A: 對 Style JSON 進行預處理
        if (style.layers) {
          style.layers.forEach((layer: any) => {
            if (layer.paint) {
              Object.keys(layer.paint).forEach(key => {
                if (layer.paint[key] === null) layer.paint[key] = 0;
              });
            }
          });
        }

        map = new maplibregl.Map({
          container: mapContainer!,
          style: style,
          center: [lng, lat],
          zoom: 16,
          interactive: false // 靜態展示
        });

        if (map) {
          map.on('load', () => {
            map?.resize();
          });

          new maplibregl.Marker()
            .setLngLat([lng, lat])
            .addTo(map);
        }
      } catch (err) {
        console.error("地圖視圖初始化失敗 (方案 A):", err);
      }
    };

    initMap();

    return () => {
      if (map) map.remove();
    };
  });
</script>

<div class="map-view-container">
  <div bind:this={mapContainer} class="map-canvas"></div>
  {#if name}
    <div class="location-name">{name}</div>
  {/if}
</div>

<style>
  .map-view-container {
    width: 100%;
    border: 3px solid var(--color-border);
    background: var(--color-bg);
    position: relative;
  }
  .map-canvas {
    height: 200px;
    width: 100%;
  }
  .location-name {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    background: var(--color-bg);
    border: 2px solid var(--color-border);
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: bold;
    box-shadow: 2px 2px 0 var(--color-border);
    z-index: 10;
  }
</style>
