<script lang="ts">
  import { onMount } from 'svelte';
  // 僅使用型別，實體由 Layout.astro 的 CDN 載入
  import type maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  interface Props {
    lat: number;
    lng: number;
    name?: string;
  }

  // Svelte 5 Props
  let { lat, lng, name = "" }: Props = $props();

  let mapContainer: HTMLDivElement | undefined = $state();
  let map: maplibregl.Map | undefined;

  onMount(() => {
    if (!lat || !lng || !mapContainer) return;

    const initMap = async () => {
      // 延遲 200ms
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        const gl = (window as any).maplibregl;
        if (!gl) {
          console.error("MapLibre GL CDN 未能載入 (MapView)");
          return;
        }

        map = new gl.Map({
          container: mapContainer!,
          style: 'https://tiles.openfreemap.org/styles/liberty',
          center: [lng, lat],
          zoom: 16,
          interactive: false // 靜態展示
        });

        if (map) {
          map.on('load', () => {
            map?.resize();
          });

          new gl.Marker()
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
