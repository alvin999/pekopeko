<script lang="ts">
  import { postForm } from "../../lib/postForm.svelte";
</script>

{#if postForm.hasPostedToday}
  <div
    class="brutalist-card bg-accent p-6 text-center max-w-2xl mx-auto shadow-[8px_8px_0px_0px_var(--color-border)] animate-in fade-in slide-in-from-top-4"
  >
    <div class="flex items-center justify-center gap-4">
      <span class="text-3xl">⚠️</span>
      <div>
        <p class="text-xl font-black italic uppercase">Already Shared.</p>
        <p class="font-bold opacity-80 text-sm">
          您今天已經有發文紀錄了，目前僅開放預覽操作。
        </p>
      </div>
    </div>
  </div>
{/if}
