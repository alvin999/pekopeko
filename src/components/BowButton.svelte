<script lang="ts">
  import { supabase } from "../lib/supabase";

  export let postId: string;
  export let initialCount = 0;

  let count = initialCount;
  let isBowing = false;
  let isLoading = false;

  interface Particle {
    id: number;
    x: number;
    y: number;
    rotate: number;
    scale: number;
  }
  let particles: Particle[] = [];
  let particleId = 0;

  function createParticles() {
    const newParticles: Particle[] = [];
    const count = 1 + Math.floor(Math.random()); // 產生 1-2 個

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleId++,
        x: (Math.random() - 0.5) * 150, // 擴大水平範圍
        y: -(Math.random() * 100 + 100), // 擴大垂直範圍 (-100px 到 -200px)
        rotate: (Math.random() - 0.5) * 80, // 增加旋轉隨機性
        scale: 0.8 + Math.random() * 0.4, // 0.8 到 1.2
      });
    }

    particles = [...particles, ...newParticles];

    // 1秒後移除這些粒子
    setTimeout(() => {
      const idsToRemove = newParticles.map((p) => p.id);
      particles = particles.filter((p) => !idsToRemove.includes(p.id));
    }, 1000);
  }

  async function handleBow() {
    createParticles(); // 立即觸發視覺特效

    if (isLoading) return;
    isLoading = true;
    isBowing = true;

    // 改用 RPC 呼叫以確保安全性
    const { error } = await supabase.rpc("increment_bow", {
      post_id: postId,
    });

    if (!error) {
      count++;
    }

    // Minimal animation delay
    setTimeout(() => {
      isBowing = false;
      isLoading = false;
    }, 300);
  }
</script>

<div class="bow-container">
  {#each particles as p (p.id)}
    <span
      class="peko-particle font-black italic uppercase"
      style="--tx: {p.x}px; --ty: {p.y}px; --tr: {p.rotate}deg; --ts: {p.scale};"
    >
      Peko!
    </span>
  {/each}

  <button
    on:click={handleBow}
    disabled={isLoading}
    class="brutalist-btn-accent group min-w-[100px] gap-2 px-4! {isBowing
      ? 'translate-x-1 translate-y-1 shadow-none'
      : ''}"
  >
    <span
      class="text-xl inline-block transition-transform duration-300 {isBowing
        ? 'rotate-12 translate-y-1'
        : 'group-hover:-rotate-12'}"
    >
      🙇
    </span>
    <span class="font-black text-sm">{count}</span>
  </button>
</div>

<style>
  .bow-container {
    position: relative;
    display: inline-block;
  }

  .peko-particle {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 10;
    color: #ffd700; /* 鮮豔黃色 */
    -webkit-text-stroke: 5px black; /* 大幅加厚黑邊 */
    text-shadow:
      6px 6px 0px black,
      -2px -2px 0px black; /* 大幅增加硬陰影，適配超大字體 */
    font-size: 5rem; /* 大幅增加 5 倍左右 (原 1.1rem) */
    white-space: nowrap;
    animation: peko-float 1s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }

  @keyframes peko-float {
    0% {
      opacity: 0;
      transform: translate(-50%, 0) scale(0.5) rotate(0deg);
    }
    20% {
      opacity: 1;
      transform: translate(calc(-50% + var(--tx) * 0.2), calc(var(--ty) * 0.2))
        scale(var(--ts)) rotate(calc(var(--tr) * 0.5));
    }
    100% {
      opacity: 0;
      transform: translate(calc(-50% + var(--tx)), var(--ty)) scale(0.3)
        rotate(var(--tr));
    }
  }
</style>
