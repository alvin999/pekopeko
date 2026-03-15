<script lang="ts">
  import { supabase } from '../lib/supabase';
  
  export let postId: string;
  export let initialCount = 0;
  
  let count = initialCount;
  let isBowing = false;
  let isLoading = false;

  async function handleBow() {
    if (isLoading) return;
    isLoading = true;
    isBowing = true;
    
    const { data, error } = await supabase
      .from('posts')
      .update({ bow_count: count + 1 })
      .eq('id', postId)
      .select('bow_count')
      .single();

    if (!error && data) {
      count = data.bow_count;
    }
    
    // Minimal animation delay
    setTimeout(() => { 
      isBowing = false; 
      isLoading = false;
    }, 300);
  }
</script>

<button 
  on:click={handleBow}
  disabled={isLoading}
  class="brutalist-btn-accent group min-w-[100px] gap-2 px-4! {isBowing ? 'translate-x-1 translate-y-1 shadow-none' : ''}"
>
  <span class="text-xl inline-block transition-transform duration-300 {isBowing ? 'rotate-12 translate-y-1' : 'group-hover:-rotate-12'}">
    🙇
  </span>
  <span class="font-black text-sm">{count}</span>
</button>

<style>
  button {
    position: relative;
  }
</style>
