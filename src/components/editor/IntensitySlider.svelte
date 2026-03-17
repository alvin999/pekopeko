<script lang="ts">
  let { label, value = $bindable() } = $props<{
    label: string,
    value: "low" | "medium" | "high"
  }>();

  const levels: ("low" | "medium" | "high")[] = ["low", "medium", "high"];
</script>

<header class="flex justify-between items-end border-b-2 border-[--color-border] pb-2">
  <span class="font-black text-xs uppercase tracking-[0.2em] opacity-50">{label}</span>
  <div class="flex gap-2">
    {#each levels as level}
      <button
        type="button"
        class="text-[10px] font-black px-2 py-0.5 border-2 border-[--color-border] transition-all {value === level
          ? 'bg-accent -translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-border)]'
          : 'bg-white opacity-40'}"
        onclick={() => (value = level)}
      >
        {level.toUpperCase()}
      </button>
    {/each}
  </div>
</header>
