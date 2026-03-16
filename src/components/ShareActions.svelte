<script lang="ts">
  export let svgElement: HTMLElement | null = null;
  export let drinkName = "PekoPeko Drink";

  function getSvgTarget() {
    return svgElement || document.getElementById('avatar-target');
  }

  function downloadSVG() {
    const target = getSvgTarget();
    if (!target) return;
    const svg = target.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${drinkName}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  let showCopySuccess = false;

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
  <button class="brutalist-btn bg-white hover:bg-[--color-accent] flex-1 gap-2 group transition-all" on:click={downloadSVG}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-y-0.5 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    <span class="font-black text-xs uppercase italic">Download SVG</span>
  </button>
  <button class="brutalist-btn-primary flex-1 gap-2 group transition-all relative overflow-hidden" on:click={share}>
    {#if showCopySuccess}
      <div class="absolute inset-0 bg-[--color-accent] text-[--color-text] flex items-center justify-center font-black italic animate-in fade-in zoom-in duration-200">
        LINK COPIED!
      </div>
    {/if}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    <span class="font-black text-xs uppercase italic">Share Post</span>
  </button>
</div>
