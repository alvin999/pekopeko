<script lang="ts">
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  // Svelte 5 Props
  let { lat, lng, name = "" } = $props();

  let mapContainer: HTMLDivElement | undefined = $state();
  let map: maplibregl.Map | undefined;

  onMount(() => {
    if (!lat || !lng || !mapContainer) return;

    map = new maplibregl.Map({
      container: mapContainer,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [lng, lat],
      zoom: 16,
      interactive: false // 靜態展示
    });

    new maplibregl.Marker()
      .setLngLat([lng, lat])
      .addTo(map);

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
