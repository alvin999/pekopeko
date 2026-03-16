<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase';
  import AvatarGenerator from './AvatarGenerator.svelte';

  let user: any = null;
  let profile: any = null;
  let latestPost: any = null;
  let loading = true;

  onMount(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const [profileRes, postsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('posts')
          .select('*')
          .eq('user_id', user.id)
          .gt('created_at', twentyFourHoursAgo)
          .order('created_at', { ascending: false })
          .limit(1)
      ]);
      
      profile = profileRes.data;
      latestPost = postsRes.data && postsRes.data.length > 0 ? postsRes.data[0] : null;
    }
    loading = false;
  });

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/profile' }
    });
  }
</script>

<div class="container mx-auto px-4 py-20 max-w-5xl">
  {#if loading}
    <div class="flex flex-col items-center justify-center min-h-[50vh]">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4 font-bold opacity-50 text-xl italic uppercase">Loading Session...</p>
    </div>
  {:else if !user}
    <div class="brutalist-card bg-white p-20 text-center max-w-2xl mx-auto shadow-[12px_12px_0px_0px_var(--color-border)] border-6 border-[--color-border]">
      <h1 class="text-4xl font-black italic title-outline mb-8 uppercase">Authentication Required</h1>
      <p class="font-bold opacity-60 mb-12 text-lg">請先登入以查看您的個人飲品統計與日誌。</p>
      <button class="brutalist-btn-primary px-12! py-4! scale-110" on:click={handleLogin}>SIGN IN WITH GOOGLE</button>
    </div>
  {:else}
    <div class="space-y-16">
      <header class="brutalist-card bg-white p-12 flex flex-col md:flex-row items-center text-center md:text-left gap-8 border-6 border-[--color-border] shadow-[12px_12px_0px_0px_var(--color-border)] relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-[--color-accent] -mr-16 -mt-16 rotate-45 opacity-20"></div>
        
        <div class="relative group">
          <div class="w-48 h-48 border-6 border-[--color-border] bg-white flex items-center justify-center shadow-[8px_8px_0px_0px_var(--color-border)] overflow-hidden transition-transform group-hover:scale-105">
            <AvatarGenerator 
              drinkType={latestPost?.drink_type || 'coffee'}
              flavors={latestPost?.flavors || []}
              body={latestPost?.body || 'round'}
              mood={latestPost?.mood || '😊'}
              size={192}
              isEmpty={!latestPost}
            />
          </div>
          {#if !latestPost}
            <div class="absolute -bottom-4 -right-4 bg-white border-4 border-[--color-border] px-3 py-1 font-black text-[10px] italic shadow-[4px_4px_0px_0px_var(--color-border)] animate-bounce">
              EMPTY CUP ☕️
            </div>
          {/if}
        </div>

        <div class="flex-1">
          <div class="brutalist-badge badge-coffee text-sm! px-4! italic mb-4">USER PROFILE</div>
          <h1 class="text-6xl md:text-7xl font-black italic title-outline mb-4 uppercase tracking-tighter">
            {profile?.username || user.user_metadata?.full_name || 'ANONYMOUS'}
          </h1>
          
          <div class="flex flex-col gap-4">
            <p class="font-bold opacity-60 text-lg">
              ACCUMULATED <span class="bg-[--color-accent] px-2 border-2 border-[--color-border]">{profile?.total_bows_received || 0}</span> BOWS RECEIVED 🙏
            </p>
            
            <div class="mt-4 pt-6 border-t-2 border-[--color-border] border-dashed">
              {#if latestPost}
                <div class="flex flex-col gap-2">
                  <span class="text-xs font-black uppercase tracking-widest opacity-40">Status</span>
                  <div class="flex items-center gap-3">
                    <span class="brutalist-badge badge-tea text-white!">ACTIVE TODAY</span>
                    <span class="font-bold text-sm italic">已記錄今日的飲品瞬間。</span>
                  </div>
                </div>
              {:else}
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-3">
                    <span class="brutalist-badge bg-gray-400 text-white!">NO POST TODAY</span>
                    <span class="font-bold text-sm italic opacity-60">今天還沒留下足跡呢？</span>
                  </div>
                  <a href="/create" class="brutalist-btn-primary py-3! text-sm! max-w-xs text-center">立刻分享今日飲品 →</a>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </header>
    </div>
  {/if}
</div>
