<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { toast } from "../../lib/toastStore.svelte";
</script>

{#if toast.visible}
  <div
    class="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
    in:fly={{ y: 20, duration: 400 }}
    out:fade={{ duration: 200 }}
  >
    <div
      class="brutalist-card {toast.type === 'error'
        ? 'bg-error text-white'
        : 'bg-accent'} p-4 flex items-center gap-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-shake"
    >
      <span class="text-2xl">{toast.type === "error" ? "❌" : "💡"}</span>
      <p class="font-black italic uppercase tracking-tight text-sm">
        {toast.message}
      </p>
    </div>
  </div>
{/if}

<style>
  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-4px);
    }
    75% {
      transform: translateX(4px);
    }
  }
  .animate-shake {
    animation: shake 0.2s ease-in-out 0s 2;
  }
</style>
