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
  let avatarX = $state(800);
  let avatarY = $state(100);
  let avatarScale = $state(1.0);
  
  // Label position state
  let labelX = $state(60);
  let labelY = $state(850);
  let labelScale = $state(1.0);  // New: label scaling
  let labelWidth = $state(800);   // Store rendered width for hit detection
  let labelHeight = $state(300);  // Store rendered height for hit detection

  // Background image state
  let imageX = $state(0);
  let imageY = $state(0);
  let imageScale = $state(1.0);
  
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

  const CANVAS_SIZE = 1200;

  // Handle image upload
  function handleImageUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          userImage = img;
          renderCanvas();
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function renderCanvas(dragging: boolean = false) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Only set processing if we are doing a full refresh (not dragging)
    if (!dragging) isProcessing = true;

    // 1. Clear Canvas
    ctx.fillStyle = "#F5F2EA"; // Cream background
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 2. Draw User Image
    if (userImage) {
      const baseScale = Math.max(CANVAS_SIZE / userImage.width, CANVAS_SIZE / userImage.height);
      const finalScale = baseScale * imageScale;
      const w = userImage.width * finalScale;
      const h = userImage.height * finalScale;
      
      const startX = (CANVAS_SIZE - w) / 2 + imageX;
      const startY = (CANVAS_SIZE - h) / 2 + imageY;
      
      ctx.drawImage(userImage, startX, startY, w, h);
    }

    // 3. Render Avatar to Canvas
    const currentSize = AVATAR_SIZE * avatarScale;
    const avatarImg = dragging ? cachedAvatarImg : await getAvatarAsImage();
    if (avatarImg) {
      if (!dragging) cachedAvatarImg = avatarImg; // Cache it for dragging
      ctx.drawImage(avatarImg, avatarX, avatarY, currentSize, currentSize);
      
      // Draw a subtle border if dragging to show boundary
      if (dragging && dragTarget === 'avatar') {
        ctx.strokeStyle = "#ffd43b";
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(avatarX, avatarY, currentSize, currentSize);
        ctx.setLineDash([]);
      }
    }

    // 4. Draw Info (Full mode only)
    if (mode === 'full') {
      const bounds = drawFullInfo(ctx);
      labelWidth = bounds.width;
      labelHeight = bounds.height;
    }

    if (!dragging) isProcessing = false;
  }

  function drawFullInfo(ctx: CanvasRenderingContext2D) {
    const scale = labelScale;
    let currentY = labelY;
    let maxWidth = 0;

    // Labels Area drag indicator (only if dragging labels)
    if (isDragging && dragTarget === 'labels') {
      ctx.strokeStyle = "#ffd43b";
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(labelX - 20, labelY - 50, labelWidth + 40, labelHeight + 60);
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
      ctx.fillRect(labelX, currentY, metrics.width + padding * 2, h);
      
      // Text
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(text, labelX + padding, currentY + Math.floor(55 * scale));
      
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
      ctx.fillRect(labelX, currentY, metrics.width + padding * 2, h);
      ctx.strokeStyle = "#2D2D2D";
      ctx.lineWidth = Math.max(2, 6 * scale);
      ctx.strokeRect(labelX, currentY, metrics.width + padding * 2, h);

      ctx.fillStyle = "#2D2D2D";
      ctx.fillText(text, labelX + padding, currentY + Math.floor(42 * scale));
      
      maxWidth = Math.max(maxWidth, metrics.width + padding * 2);
      currentY += Math.floor(80 * scale);
    }

    // Flavors Row
    if (flavors.length > 0) {
      let currentX = labelX;
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
        maxWidth = Math.max(maxWidth, currentX - labelX);
      });
      currentY += h;
    }

    return {
      width: maxWidth,
      height: currentY - labelY
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
    const currentSize = AVATAR_SIZE * avatarScale;
    if (mode === 'graphics') {
        avatarX = CANVAS_SIZE - currentSize - 40;
        avatarY = CANVAS_SIZE - currentSize - 40;
    } else {
        avatarX = CANVAS_SIZE - currentSize - 40;
        avatarY = 60;
    }
  }

  function resetAll() {
    imageX = 0;
    imageY = 0;
    imageScale = 1.0;
    labelX = 60;
    labelY = 850;
    labelScale = 1.0;
    avatarScale = 1.0;
    resetAvatarPosition();
    renderCanvas();
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
      setTimeout(renderCanvas, 100);
    }
  });

  // Drag handlers
  function handleMouseDown(e: MouseEvent) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_SIZE / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_SIZE / rect.height);
    lastX = x;
    lastY = y;

    // Hit test Avatar
    const currentSize = AVATAR_SIZE * avatarScale;
    if (x >= avatarX && x <= avatarX + currentSize && y >= avatarY && y <= avatarY + currentSize) {
      isDragging = true;
      dragTarget = 'avatar';
      return;
    }

    // Hit test Labels Area (dynamic box)
    if (mode === 'full' && x >= labelX - 20 && x <= labelX + labelWidth + 20 && y >= labelY - 60 && y <= labelY + labelHeight + 20) {
      isDragging = true;
      dragTarget = 'labels';
      return;
    }

    // Default: Drag Background Image
    if (userImage) {
      isDragging = true;
      dragTarget = 'image';
      return;
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging || !canvas || !dragTarget) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_SIZE / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_SIZE / rect.height);
    
    if (dragTarget === 'avatar') {
      const currentSize = AVATAR_SIZE * avatarScale;
      avatarX = x - currentSize / 2;
      avatarY = y - currentSize / 2;
    } else if (dragTarget === 'labels') {
      labelX = x - 50; // Offset for better feel
      labelY = y - 50;
    } else if (dragTarget === 'image') {
      const dx = x - lastX;
      const dy = y - lastY;
      imageX += dx;
      imageY += dy;
    }
    
    lastX = x;
    lastY = y;
    renderCanvas(true); // Dragging mode
  }

  function handleMouseUp() {
    isDragging = false;
    dragTarget = null;
    renderCanvas(false); // Full quality refresh
  }

  // Touch handlers
  function handleTouchStart(e: TouchEvent) {
    if (!canvas) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (CANVAS_SIZE / rect.width);
    const y = (touch.clientY - rect.top) * (CANVAS_SIZE / rect.height);
    lastX = x;
    lastY = y;

    // Hit test Avatar
    const currentSize = AVATAR_SIZE * avatarScale;
    if (x >= avatarX && x <= avatarX + currentSize && y >= avatarY && y <= avatarY + currentSize) {
      isDragging = true;
      dragTarget = 'avatar';
      e.preventDefault(); // Prevent scrolling while dragging
      return;
    }

    // Hit test Labels (dynamic box)
    if (mode === 'full' && x >= labelX - 20 && x <= labelX + labelWidth + 20 && y >= labelY - 60 && y <= labelY + labelHeight + 20) {
      isDragging = true;
      dragTarget = 'labels';
      e.preventDefault();
      return;
    }

    // Drag Image
    if (userImage) {
      isDragging = true;
      dragTarget = 'image';
      e.preventDefault();
      return;
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || !canvas || !dragTarget) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (CANVAS_SIZE / rect.width);
    const y = (touch.clientY - rect.top) * (CANVAS_SIZE / rect.height);
    
    if (dragTarget === 'avatar') {
      const currentSize = AVATAR_SIZE * avatarScale;
      avatarX = x - currentSize / 2;
      avatarY = y - currentSize / 2;
    } else if (dragTarget === 'labels') {
      labelX = x - 50;
      labelY = y - 50;
    } else if (dragTarget === 'image') {
      const dx = x - lastX;
      const dy = y - lastY;
      imageX += dx;
      imageY += dy;
    }
    
    lastX = x;
    lastY = y;
    renderCanvas(true);
    e.preventDefault();
  }

  // Initial position logic
  $effect(() => {
    resetAvatarPosition();
  });

  $effect(() => {
    // Explicitly track props to avoid unnecessary runs
    const _tags = flavors.join(',');
    const _deps = [mode, _tags, mood, drinkType, mouthfeel, itemName, locationName, avatarScale, imageScale];
    
    // Draw only when open
    if (isOpen) {
        renderCanvas();
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
                bind:value={avatarScale}
                oninput={() => renderCanvas(true)}
                onchange={() => renderCanvas(false)}
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
                  bind:value={labelScale}
                  oninput={() => renderCanvas()}
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
                bind:value={imageScale}
                oninput={() => renderCanvas()}
                class="range range-xs range-accent"
              />
            </label>

            <div class="flex items-center gap-4">
              <span class="font-black text-sm uppercase">Mode:</span>
              <div class="join border-2 border-[--color-border]">
                <button 
                  class="join-item px-4 py-2 text-xs font-bold transition-colors {mode === 'graphics' ? 'bg-accent text-black font-black' : 'bg-white text-black hover:bg-bg'}"
                  onclick={() => mode = 'graphics'}
                >
                  GFX ONLY
                </button>
                <button 
                  class="join-item px-4 py-2 text-xs font-bold transition-colors {mode === 'full' ? 'bg-accent text-black font-black' : 'bg-white text-black hover:bg-bg'}"
                  onclick={() => mode = 'full'}
                >
                  FULL INFO
                </button>
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
                * 高畫質 1200x1200px PNG，適合分享至 Instagram/Threads
            </p>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="flex flex-col items-center justify-center gap-4 bg-bg p-4 border-4 border-[--color-border] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1)]">
        <div class="relative w-full aspect-square bg-white shadow-brutalist overflow-hidden border-2 border-[--color-border]">
            <canvas 
                bind:this={canvas} 
                width={CANVAS_SIZE} 
                height={CANVAS_SIZE}
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
