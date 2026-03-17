<script lang="ts">
  import { postForm } from "../../lib/postForm.svelte";
</script>

<section>
  <span class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50">
    Select Beverage Type
  </span>
  <div class="flex gap-4">
    <button
      type="button"
      class="brutalist-btn flex-1 transition-all {postForm.drinkType === 'coffee'
        ? 'bg-[--color-coffee] text-white -translate-y-1 shadow-brutalist-sm'
        : 'bg-white opacity-60'}"
      onclick={() => (postForm.drinkType = "coffee")}
    >
      ☕ COFFEE
    </button>
    <button
      type="button"
      class="brutalist-btn flex-1 transition-all {postForm.drinkType === 'tea'
        ? 'bg-[--color-tea] text-white -translate-y-1 shadow-brutalist-sm'
        : 'bg-white opacity-60'}"
      onclick={() => (postForm.drinkType = "tea")}
    >
      🍵 TEA
    </button>
  </div>
</section>
