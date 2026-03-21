<script lang="ts">
  import { onMount } from 'svelte';
  import AvatarGenerator from './AvatarGenerator.svelte';
  import type { DrinkData } from '../lib/types';
 
  interface Props extends Partial<DrinkData> {
    isOpen?: boolean;
    onClose?: () => void;
  }

  let {
    drinkType = "coffee",
    flavors = [],
    mood = "🙂",
    mouthfeel = "medium",
    mouthfeelTypes = [],
    flavorIntensity = "medium",
    acidityIntensity = "medium",
    acidityType = "sweet",
    sweetnessIntensity = "medium",
    itemName = "",
    locationName = "",
    isOpen = false,
    onClose
  }: Props = $props();

  let canvas = $state<HTMLCanvasElement>();
  let userImage = $state<HTMLImageElement | null>(null);
  let mode: 'graphics' | 'full' = $state('full');
  let isProcessing = $state(false);
  let avatarContainer = $state<HTMLDivElement>();

  // Avatar position and dragging state
  let avatarState = $state({
    x: 800,
    y: 100,
    scale: 1.0
  });
  
  // Label position state
  let labelState = $state({
    x: 60,
    y: 850,
    scale: 1.0,
    width: 800,
    height: 300
  });

  // Background image state
  let imageState = $state({
    x: 0,
    y: 0,
    scale: 1.0
  });
  
  let isDragging = $state(false);
  let dragTarget: 'avatar' | 'labels' | 'image' | null = $state(null);
  let lastX = 0;
  let lastY = 0;
  
  const AVATAR_SIZE = 350;
  let cachedAvatarImg: HTMLImageElement | null = $state(null);

  // Use a portal action to move the modal to body, avoiding transform issues from parents
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
    };
  }

  const ASPECT_RATIOS = [
    { id: 'story', name: '9:16 (限動)', width: 1080, height: 1920, label: 'STORY' },
    { id: 'square', name: '1:1 (正方)', width: 1200, height: 1200, label: '1:1' },
    { id: 'portrait', name: '4:5 (人像)', width: 1080, height: 1350, label: '4:5' },
    { id: 'classic', name: '3:4 (傳統)', width: 1080, height: 1440, label: '3:4' },
  ];

  let selectedRatio = $state(ASPECT_RATIOS[0]);
  let canvasWidth = $derived(selectedRatio.width);
  let canvasHeight = $derived(selectedRatio.height);

  // Handle image upload
  function handleImageUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          userImage = img;
          triggerRender();
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // --- CustomEvent & Actions ---
  
  function triggerRender(dragging: boolean = false) {
    if (!canvas) return;
    canvas.dispatchEvent(new CustomEvent('peko:render', { 
      detail: { dragging } 
    }));
  }

  function setupCanvas(node: HTMLCanvasElement) {
    const handleRender = (e: any) => {
      renderCanvas(e.detail?.dragging || false);
    };
    node.addEventListener('peko:render', handleRender);
    
    // Initial draw - delay more to ensure AvatarGenerator has mounted its SVG
    setTimeout(() => {
        console.log("[Peko] Triggering initial render...");
        triggerRender();
    }, 500);

    return {
      destroy() {
        node.removeEventListener('peko:render', handleRender);
      }
    };
  }

  // --- Canvas Rendering Modules ---

  function drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#F5F2EA"; // Cream background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (userImage) {
      const baseScale = Math.max(canvasWidth / userImage.width, canvasHeight / userImage.height);
      const finalScale = baseScale * imageState.scale;
      const w = userImage.width * finalScale;
      const h = userImage.height * finalScale;
      
      const startX = (canvasWidth - w) / 2 + imageState.x;
      const startY = (canvasHeight - h) / 2 + imageState.y;
      
      ctx.drawImage(userImage, startX, startY, w, h);
    }
  }

  function drawAvatarLayer(ctx: CanvasRenderingContext2D, avatarImg: HTMLImageElement | null, dragging: boolean) {
    if (!avatarImg) return;
    const currentSize = AVATAR_SIZE * avatarState.scale;
    
    ctx.drawImage(avatarImg, avatarState.x, avatarState.y, currentSize, currentSize);
    
    // Draw drag boundary
    if (dragging && dragTarget === 'avatar') {
      ctx.strokeStyle = "#ffd43b";
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(avatarState.x, avatarState.y, currentSize, currentSize);
      ctx.setLineDash([]);
    }
  }

  let isRendering = false;
  async function renderCanvas(dragging: boolean = false) {
    if (!canvas || isRendering) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // CRITICAL: We MUST prepare all async assets BEFORE clearing/drawing the visible canvas
    // This is what prevents the flickering (frame with only background)
    if (!dragging) isProcessing = true;
    isRendering = true;

    try {
      const avatarImg = dragging ? cachedAvatarImg : await getAvatarAsImage();
      if (!avatarImg && !dragging) {
          console.warn("[Peko] No avatar image available (SVG not ready?)");
      }
      
      if (!dragging && avatarImg) cachedAvatarImg = avatarImg;

      // NOW we draw everything synchronously in one single frame
      drawBackground(ctx);
      drawAvatarLayer(ctx, avatarImg, dragging);

      if (mode === 'full') {
        const bounds = drawFullInfo(ctx);
        labelState.width = bounds.width;
        labelState.height = bounds.height;
      }
    } catch (err) {
      console.error("[Peko] Render failed:", err);
    } finally {
      if (!dragging) isProcessing = false;
      isRendering = false;
    }
  }

  function drawFullInfo(ctx: CanvasRenderingContext2D) {
    const scale = labelState.scale;
    let currentY = labelState.y;
    let maxWidth = 0;

    // Labels Area drag indicator (only if dragging labels)
    if (isDragging && dragTarget === 'labels') {
      ctx.strokeStyle = "#ffd43b";
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(labelState.x - 20, labelState.y - 50, labelState.width + 40, labelState.height + 60);
      ctx.setLineDash([]);
    }

    // Info Container
    ctx.strokeStyle = "#2D2D2D";
    ctx.lineWidth = Math.max(2, 10 * scale);
    
    // Item Name Label
    if (itemName) {
      const text = itemName.toUpperCase();
      const fontSize = Math.floor(48 * scale);
      ctx.font = `900 ${fontSize}px Inter, system-ui`;
      const metrics = ctx.measureText(text);
      const padding = Math.floor(24 * scale);
      const h = Math.floor(80 * scale);
      
      // Label Background
      ctx.fillStyle = "#2D2D2D";
      ctx.fillRect(labelState.x, currentY, metrics.width + padding * 2, h);
      
      // Text
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(text, labelState.x + padding, currentY + Math.floor(55 * scale));
      
      maxWidth = Math.max(maxWidth, metrics.width + padding * 2);
      currentY += Math.floor(100 * scale);
    }

    // Location Label
    if (locationName) {
      const text = locationName.toUpperCase();
      const fontSize = Math.floor(32 * scale);
      ctx.font = `700 ${fontSize}px Inter, system-ui`;
      const metrics = ctx.measureText(text);
      const padding = Math.floor(16 * scale);
      const h = Math.floor(60 * scale);

      ctx.fillStyle = "#ffd43b";
      ctx.fillRect(labelState.x, currentY, metrics.width + padding * 2, h);
      ctx.strokeStyle = "#2D2D2D";
      ctx.lineWidth = Math.max(2, 6 * scale);
      ctx.strokeRect(labelState.x, currentY, metrics.width + padding * 2, h);

      ctx.fillStyle = "#2D2D2D";
      ctx.fillText(text, labelState.x + padding, currentY + Math.floor(42 * scale));
      
      maxWidth = Math.max(maxWidth, metrics.width + padding * 2);
      currentY += Math.floor(80 * scale);
    }

    // Flavors Row
    if (flavors.length > 0) {
      let currentX = labelState.x;
      const fontSize = Math.floor(24 * scale);
      ctx.font = `600 ${fontSize}px Inter, system-ui`;
      const padding = Math.floor(12 * scale);
      const h = Math.floor(45 * scale);
      const gap = Math.floor(15 * scale);
      
      flavors.forEach(flavor => {
        const text = flavor.toUpperCase();
        const metrics = ctx.measureText(text);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(currentX, currentY, metrics.width + padding * 2, h);
        ctx.strokeStyle = "#2D2D2D";
        ctx.lineWidth = Math.max(2, 4 * scale);
        ctx.strokeRect(currentX, currentY, metrics.width + padding * 2, h);

        ctx.fillStyle = "#2D2D2D";
        ctx.fillText(text, currentX + padding, currentY + Math.floor(32 * scale));
        
        currentX += metrics.width + padding * 2 + gap;
        maxWidth = Math.max(maxWidth, currentX - labelState.x);
      });
      currentY += h;
    }

    return {
      width: maxWidth,
      height: currentY - labelState.y
    };
  }

  async function getAvatarAsImage(): Promise<HTMLImageElement | null> {
    const svg = avatarContainer?.querySelector('svg');
    if (!svg) return null;

    const svgData = new XMLSerializer().serializeToString(svg);
    // Add xmlns if missing
    const svgWithXmlns = svgData.includes('xmlns="http://www.w3.org/2000/svg"') 
      ? svgData 
      : svgData.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    
    const blob = new Blob([svgWithXmlns], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      }
      img.src = url;
    });
  }

  function downloadImage() {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `PekoPeko_${itemName || 'Share'}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  }

  function resetAvatarPosition() {
    const currentSize = AVATAR_SIZE * avatarState.scale;
    if (mode === 'graphics') {
        avatarState.x = canvasWidth - currentSize - 40;
        avatarState.y = canvasHeight - currentSize - 40;
    } else {
        avatarState.x = canvasWidth - currentSize - 40;
        avatarState.y = 60;
    }
  }

  function resetAll() {
    imageState.x = 0;
    imageState.y = 0;
    imageState.scale = 1.0;
    labelState.x = 60;
    labelState.y = selectedRatio.id === 'story' ? 1200 : 850;
    labelState.scale = 1.0;
    avatarState.scale = 1.0;
    resetAvatarPosition();
    triggerRender();
  }

  async function shareImage() {
    if (!canvas) return;
    
    if (!navigator.share) {
      alert("您的瀏覽器不支援原生分享功能，請直接使用下載按鈕。");
      return;
    }

    isProcessing = true;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Canvas toBlob failed");
        
        const file = new File([blob], `PekoPeko_${itemName || 'Share'}.png`, { type: 'image/png' });
        
        const shareData = {
          files: [file],
          title: '杯口杯口 PekoPeko 分享',
          text: `這是我在 ${locationName || '這裡'} 品嚐的 ${itemName || '咖啡'}！ #PekoPeko`,
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          // Fallback if file sharing is not supported but basic sharing is
          await navigator.share({
            title: shareData.title,
            text: shareData.text,
            url: window.location.href
          });
        }
        isProcessing = false;
      }, 'image/png');
    } catch (err) {
      console.error("分享失敗:", err);
      isProcessing = false;
    }
  }

  $effect(() => {
    if (isOpen) {
      setTimeout(triggerRender, 100);
    }
  });

  // --- Interactions & Dragging ---

  function getCanvasCoordinates(clientX: number, clientY: number) {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvasWidth / rect.width);
    const y = (clientY - rect.top) * (canvasHeight / rect.height);
    return { x, y };
  }

  function startDragging(x: number, y: number) {
    lastX = x;
    lastY = y;

    // Hit test Avatar
    const currentSize = AVATAR_SIZE * avatarState.scale;
    if (x >= avatarState.x && x <= avatarState.x + currentSize && y >= avatarState.y && y <= avatarState.y + currentSize) {
      isDragging = true;
      dragTarget = 'avatar';
      return true;
    }

    // Hit test Labels Area (dynamic box)
    if (mode === 'full' && x >= labelState.x - 20 && x <= labelState.x + labelState.width + 20 && y >= labelState.y - 60 && y <= labelState.y + labelState.height + 20) {
      isDragging = true;
      dragTarget = 'labels';
      return true;
    }

    // Default: Drag Background Image
    if (userImage) {
      isDragging = true;
      dragTarget = 'image';
      return true;
    }
    
    return false;
  }
  
  function updateDraggingPosition(x: number, y: number) {
    if (!isDragging || !canvas || !dragTarget) return;

    if (dragTarget === 'avatar') {
      const currentSize = AVATAR_SIZE * avatarState.scale;
      avatarState.x = x - currentSize / 2;
      avatarState.y = y - currentSize / 2;
    } else if (dragTarget === 'labels') {
      labelState.x = x - 50; // Offset for better feel
      labelState.y = y - 50;
    } else if (dragTarget === 'image') {
      const dx = x - lastX;
      const dy = y - lastY;
      imageState.x += dx;
      imageState.y += dy;
    }
    
    lastX = x;
    lastY = y;
    triggerRender(true); // Dragging mode
  }

  // Drag handlers
  function handleMouseDown(e: MouseEvent) {
    if (!canvas) return;
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    startDragging(x, y);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    updateDraggingPosition(x, y);
  }

  function handleMouseUp() {
    isDragging = false;
    dragTarget = null;
    triggerRender(false); // Full quality refresh
  }

  // Touch handlers
  function handleTouchStart(e: TouchEvent) {
    if (!canvas) return;
    const touch = e.touches[0];
    const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY);
    
    if (startDragging(x, y)) {
      e.preventDefault(); // Prevent scrolling while dragging
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    const touch = e.touches[0];
    const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY);
    
    updateDraggingPosition(x, y);
    e.preventDefault();
  }

  // Initial position logic
  $effect(() => {
    resetAvatarPosition();
  });

  $effect(() => {
    // Explicitly track props to avoid unnecessary runs
    const _tags = flavors.join(',');
    const _deps = [mode, selectedRatio, _tags, mood, drinkType, mouthfeel, itemName, locationName, avatarState.scale, imageState.scale];
    
    // Draw only when open
    if (isOpen) {
        triggerRender();
    }
  });
</script>

{#if isOpen}
<div use:portal class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
  <div class="bg-[#F5F2EA] border-4 border-[--color-border] shadow-brutalist w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative mt-10">
    <button 
      class="absolute top-4 right-4 brutalist-badge badge-white p-2 hover:bg-error hover:text-white transition-colors cursor-pointer"
      onclick={onClose}
      aria-label="Close"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left: Editor & Controls -->
      <div class="space-y-6">
        <div>
          <h2 class="text-3xl font-black italic title-outline mb-2">分享圖合成器</h2>
          <p class="font-bold opacity-70 text-sm">本地合成技術，照片絕不上傳伺服器。</p>
        </div>

        <div class="space-y-4">
          <label class="block">
            <span class="font-black text-xs uppercase tracking-widest block mb-2">Step 1: 選擇照片</span>
            <div class="brutalist-card bg-white p-4 border-dashed border-4 cursor-pointer hover:bg-accent/10 transition-colors">
                <input type="file" accept="image/*" class="w-full text-xs font-bold" onchange={handleImageUpload} />
            </div>
          </label>

          <div class="flex flex-col gap-4">
            <label class="flex flex-col gap-2">
              <span class="font-black text-sm uppercase">Avatar Size</span>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.05" 
                bind:value={avatarState.scale}
                oninput={() => triggerRender(true)}
                onchange={() => triggerRender(false)}
                class="range range-xs range-accent"
              />
            </label>

            {#if mode === 'full'}
              <label class="flex flex-col gap-2">
                <span class="font-black text-sm uppercase">Labels Size</span>
                <input 
                  type="range" 
                  min="0.4" 
                  max="1.5" 
                  step="0.05" 
                  bind:value={labelState.scale}
                  oninput={() => triggerRender()}
                  class="range range-xs range-accent"
                />
              </label>
            {/if}

            <label class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="font-black text-sm uppercase">Photo Zoom</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="3.0" 
                step="0.05" 
                bind:value={imageState.scale}
                oninput={() => triggerRender()}
                class="range range-xs range-accent"
              />
            </label>

            <!-- Snippet applied above for Scale Controls -->

            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-4">
                <span class="font-black text-sm uppercase">Ratio:</span>
                <div class="join border-2 border-[--color-border] grow">
                  {#each ASPECT_RATIOS as ratio}
                    <button 
                      class="join-item grow px-2 py-2 text-[10px] font-bold transition-colors {selectedRatio.id === ratio.id ? 'bg-accent text-black font-black' : 'bg-white text-black hover:bg-bg'}"
                      onclick={() => {
                        selectedRatio = ratio;
                        // Reposition labels according to ratio
                        labelState.y = ratio.id === 'story' ? 1200 : 850;
                        resetAvatarPosition();
                      }}
                    >
                      {ratio.label}
                    </button>
                  {/each}
                </div>
              </div>

              <div class="flex items-center gap-4">
                <span class="font-black text-sm uppercase">Mode:</span>
                <div class="join border-2 border-[--color-border]">
                  {#each [{ id: 'graphics', label: 'GFX ONLY' }, { id: 'full', label: 'FULL INFO' }] as m}
                    <button 
                      class="join-item px-4 py-2 text-xs font-bold transition-colors {mode === m.id ? 'bg-accent text-black font-black' : 'bg-white text-black hover:bg-bg'}"
                      onclick={() => mode = m.id as 'graphics' | 'full'}
                    >
                      {m.label}
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t-2 border-[--color-border]/20 flex flex-col gap-3">
            <div class="grid grid-cols-2 gap-3">
                <button 
                  class="brutalist-btn-accent py-4 text-sm font-black" 
                  onclick={downloadImage}
                  disabled={isProcessing}
                >
                  DOWNLOAD PNG
                </button>
                <button 
                  class="py-4 text-sm font-black bg-[#FFFFFF] text-[#2D2D2D] border-4 border-[#2D2D2D] shadow-brutalist hover:bg-accent/5 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50" 
                  onclick={shareImage}
                  disabled={isProcessing}
                >
                  SHARE TO SOCIAL
                </button>
            </div>
            <p class="text-[10px] font-bold opacity-40 text-center uppercase tracking-tighter">
                * 高畫質 {canvasWidth}x{canvasHeight}px PNG，適合分享至 Instagram/Threads
            </p>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="flex flex-col items-center justify-center gap-4 bg-bg p-4 border-4 border-[--color-border] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1)]">
        <div class="relative w-full bg-white shadow-brutalist overflow-hidden border-2 border-[--color-border]" style="aspect-ratio: {canvasWidth} / {canvasHeight}">
            <canvas 
                use:setupCanvas
                bind:this={canvas} 
                width={canvasWidth} 
                height={canvasHeight}
                class="w-full h-full object-contain cursor-move touch-none"
                onmousedown={handleMouseDown}
                onmousemove={handleMouseMove}
                onmouseup={handleMouseUp}
                onmouseleave={handleMouseUp}
                ontouchstart={handleTouchStart}
                ontouchmove={handleTouchMove}
                ontouchend={handleMouseUp}
            ></canvas>
            
            {#if !userImage}
                <div class="absolute inset-0 flex items-center justify-center text-center p-8 pointer-events-none">
                    <p class="font-black italic opacity-20 text-2xl uppercase">Please Upload a Photo</p>
                </div>
            {/if}
        </div>
        <p class="font-black text-xs opacity-50 uppercase tracking-widest">Live Preview (可拖動 Avatar & 標籤)</p>
        <button 
          class="bg-white py-2 px-6 text-[10px] font-black border-2 border-[--color-border] shadow-brutalist hover:bg-error hover:text-white transition-all flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          onclick={resetAll}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          RESET ALL POSITIONS
        </button>
      </div>
    </div>
  </div>
</div>

<!-- 隱藏的 Avatar 容器，用於產生 SVG -->
<div bind:this={avatarContainer} class="hidden">
    <AvatarGenerator 
        {drinkType} 
        {flavors} 
        {mood} 
        {mouthfeel} 
        {mouthfeelTypes}
        {flavorIntensity}
        {acidityIntensity}
        {acidityType}
        {sweetnessIntensity}
        size={300}
    />
</div>
{/if}

<style>
    /* Ensure Inter font is bold enough for Canvas */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&display=swap');
</style>
