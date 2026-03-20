<script lang="ts">
  import { postForm } from "../../lib/postForm.svelte";

  let { showDraftPrompt = $bindable() } = $props<{ showDraftPrompt: boolean }>();
</script>

{#if showDraftPrompt}
  <div
    class="brutalist-card bg-primary p-6 text-center max-w-2xl mx-auto shadow-[8px_8px_0px_0px_var(--color-border)] animate-in fade-in slide-in-from-top-4 mb-8"
  >
    <div class="flex flex-col md:flex-row items-center justify-center gap-6">
      <div class="flex items-center gap-3">
        <span class="text-3xl">📝</span>
        <div class="text-left">
          <p class="text-lg font-black italic uppercase leading-none">
            Draft Detected.
          </p>
          <p class="font-bold opacity-80 text-xs">
            偵測到一份未完成的草稿，要繼續嗎？
          </p>
        </div>
      </div>
      <div class="flex gap-3 w-full md:w-auto">
        <button
          class="flex-1 md:flex-none brutalist-badge bg-black text-white px-6! py-2! hover:bg-accent hover:text-black transition-colors"
          onclick={() => (showDraftPrompt = false)}
        >
          繼續編輯
        </button>
        <button
          class="flex-1 md:flex-none brutalist-badge bg-white px-6! py-2! hover:bg-error hover:text-white transition-colors"
          onclick={() => {
            postForm.clear();
            postForm.reset();
            showDraftPrompt = false;
          }}
        >
          刪除並重新開始
        </button>
      </div>
    </div>
  </div>
{/if}
