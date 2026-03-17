<script lang="ts">
  import { postForm } from "../../lib/postForm.svelte";

  const moods = ["🙂", "😌", "🤯", "🥱", "⚡️", "🌈"];
</script>

<section>
  <span class="font-black text-xs uppercase tracking-[0.2em] mb-4 block opacity-50">
    Current Mood
  </span>
  <div class="flex justify-between p-4 bg-[#F5F2EA] border-2 border-[--color-border]">
    {#each moods as m}
      <button
        type="button"
        class="text-3xl transition-all {postForm.mood === m
          ? 'scale-125 grayscale-0'
          : 'opacity-30 grayscale hover:opacity-60'}"
        onclick={() => (postForm.mood = m)}
      >
        {m}
      </button>
    {/each}
  </div>
</section>
