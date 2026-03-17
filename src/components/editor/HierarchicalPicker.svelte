<script lang="ts">
  import { fade } from "svelte/transition";

  interface Option {
    name: string;
    label: string;
    children?: Option[];
  }

  let {
    title,
    options,
    selectedItems = $bindable([]),
    onToggle,
    onClick,
    showIntensity = false,
    intensityValue = $bindable()
  } = $props<{
    title: string;
    options: any[];
    selectedItems: string[];
    onToggle?: (id: string, isParent: boolean, childrenNames: string[], parentName?: string) => void;
    onClick?: (id: string) => void;
    showIntensity?: boolean;
    intensityValue?: any;
  }>();

  let expandedNodes = $state(new Set<string>());

  function toggleExpand(nodeName: string) {
    if (expandedNodes.has(nodeName)) {
      expandedNodes.delete(nodeName);
    } else {
      expandedNodes.add(nodeName);
    }
    expandedNodes = new Set(expandedNodes); // Trigger reactivity
  }
</script>

<section class="space-y-6">
  <header class="flex justify-between items-end border-b-2 border-[--color-border] pb-2">
    <span class="font-black text-xs uppercase tracking-[0.2em] opacity-50">{title}</span>
    {#if showIntensity}
      <div class="flex gap-2">
        {#each ["low", "medium", "high"] as level}
          <button
            type="button"
            class="text-[10px] font-black px-2 py-0.5 border-2 border-[--color-border] transition-all {intensityValue === level
              ? 'bg-accent -translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-border)]'
              : 'bg-white opacity-40'}"
            onclick={() => (intensityValue = level)}
          >
            {level.toUpperCase()}
          </button>
        {/each}
      </div>
    {/if}
  </header>

  <div class="space-y-4">
    {#each options as opt}
      {@const isSelected = typeof opt === 'string' ? selectedItems.includes(opt) : selectedItems.includes(opt.name)}
      <div class="item-group">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="brutalist-badge text-xs! px-4! transition-all {isSelected
              ? 'badge-accent -translate-y-1 shadow-[2px_2px_0px_0px_var(--color-border)]'
              : 'badge-white opacity-60'}"
            onclick={() => {
              const id = typeof opt === 'string' ? opt : opt.name;
              if (opt.children) {
                // 父類別點擊：展開 + 選取
                toggleExpand(id);
                if (onToggle) {
                  const childrenNames = opt.children.map((c: any) => c.name);
                  onToggle(id, true, childrenNames);
                }
              } else {
                if (onClick) onClick(id);
                else if (onToggle) onToggle(id, false, []);
              }
            }}
          >
            {(opt.label || (typeof opt === 'string' ? opt : opt.name)).toUpperCase()}
            {#if opt.children}
              <span class="text-[8px] ml-1 transition-transform {expandedNodes.has(opt.name) ? 'rotate-90' : ''}">▶</span>
            {/if}
          </button>
        </div>

        {#if opt.children && expandedNodes.has(opt.name)}
          <div class="ml-6 mt-3 pl-4 border-l-2 border-[--color-border] flex flex-wrap gap-3" transition:fade={{ duration: 150 }}>
            {#each opt.children as child}
              {@const isChildSelected = selectedItems.includes(child.name)}
              <button
                type="button"
                class="brutalist-badge text-xs! px-4! transition-all {isChildSelected
                  ? 'badge-accent -translate-y-1 shadow-[2px_2px_0px_0px_var(--color-border)]'
                  : 'badge-white opacity-60'}"
                onclick={() => {
                  if (onClick) onClick(child.name);
                  else if (onToggle) onToggle(child.name, false, [], opt.name);
                }}
              >
                {child.label.toUpperCase()}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
