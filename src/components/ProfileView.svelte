<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase';
  import AvatarGenerator from './AvatarGenerator.svelte';
  import BowButton from './BowButton.svelte';

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
          .gt('expires_at', new Date().toISOString())
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

  function getRemainingTime(expiresAt: string) {
    if (!expiresAt) return '';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'EXPIRED';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}H ${minutes}M LEFT`;
  }
</script>

<div class="container mx-auto px-4 py-20 max-w-5xl">
  {#if loading}
    <div class="flex flex-col items-center justify-center min-h-[50vh]">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4 font-bold opacity-50 text-xl italic uppercase">Loading Session...</p>
    </div>
  {:else if !user}
    <div class="brutalist-card bg-white p-20 text-center max-w-2xl mx-auto shadow-brutalist border-6 border-[--color-border]">
      <h1 class="text-4xl font-black italic title-outline mb-8 uppercase">Authentication Required</h1>
      <p class="font-bold opacity-60 mb-12 text-lg">請先登入以查看您的個人飲品統計與日誌。</p>
      <button class="brutalist-btn-primary px-12! py-4! scale-110" on:click={handleLogin}>SIGN IN WITH GOOGLE</button>
    </div>
  {:else}
    <div class="space-y-16">
      <header class="brutalist-card bg-white p-12 flex flex-col md:flex-row items-center text-center md:text-left gap-8 border-6 border-[--color-border] shadow-brutalist relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-accent -mr-16 -mt-16 rotate-45 opacity-20"></div>
        
        <div class="relative group">
          <div class="w-48 h-48 border-6 border-[--color-border] bg-white flex items-center justify-center shadow-brutalist-sm overflow-hidden transition-transform group-hover:scale-105">
            <AvatarGenerator 
              drinkType={latestPost?.drink_type || 'coffee'}
              flavors={latestPost?.flavors || []}
              mouthfeel={latestPost?.mouthfeel || 'medium'}
              mood={latestPost?.mood || '😊'}
              size={192}
              isEmpty={!latestPost}
            />
          </div>
          {#if !latestPost}
            <div class="absolute -bottom-4 -right-4 bg-white border-4 border-[--color-border] px-3 py-1 font-black text-[10px] italic shadow-brutalist-sm animate-bounce">
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
              ACCUMULATED <span class="bg-accent px-2 border-2 border-[--color-border]">{profile?.total_bows_received || 0}</span> BOWS RECEIVED 🙏
            </p>
            
            <div class="mt-4 pt-6 border-t-2 border-[--color-border] border-dashed">
              {#if latestPost}
                <div class="space-y-6">
                  <div class="flex flex-wrap items-center gap-3">
                    <span class="brutalist-badge badge-tea text-white!">
                      {getRemainingTime(latestPost.expires_at)}
                    </span>
                    <span class="text-xs font-bold opacity-60 italic">
                      {new Intl.DateTimeFormat('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(latestPost.created_at))} POSTED
                    </span>
                  </div>

                  <div class="bg-[#F5F2EA] p-6 border-2 border-[--color-border] space-y-4">
                    <div class="flex flex-wrap gap-2">
                      {#if latestPost.flavors && latestPost.flavors.length > 0}
                        {#each latestPost.flavors as f}
                          <span class="brutalist-badge badge-white text-[10px]!">{f}</span>
                        {/each}
                        <span class="brutalist-badge bg-accent text-[9px]! px-2!">{latestPost.flavor_intensity?.toUpperCase()} INTENSITY</span>
                      {:else}
                        <span class="text-[10px] font-bold opacity-30 italic">NO FLAVOR TAGS PROVIDED</span>
                      {/if}
                    </div>

                    <!-- CVA Details -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y-2 border-[--color-border] border-dashed">
                      <div class="space-y-1">
                        <span class="text-[9px] font-black opacity-40 uppercase block">Main Taste</span>
                        <div class="flex flex-wrap gap-1">
                          {#each latestPost.main_tastes || [] as t}
                            <span class="bg-black text-white text-[9px] px-1.5 font-bold uppercase">{t}</span>
                          {/each}
                        </div>
                      </div>
                      <div class="space-y-1">
                        <span class="text-[9px] font-black opacity-40 uppercase block">Acidity</span>
                        <div class="flex items-center gap-2">
                          <span class="text-[10px] font-black uppercase">{latestPost.acidity_type || '-'}</span>
                          <span class="text-[9px] font-bold opacity-60">({latestPost.acidity_intensity || '-'})</span>
                        </div>
                      </div>
                      <div class="space-y-1">
                        <span class="text-[9px] font-black opacity-40 uppercase block">Sweetness</span>
                        <span class="text-[10px] font-black uppercase">{latestPost.sweetness_intensity || '-'}</span>
                      </div>
                      <div class="space-y-1">
                        <span class="text-[9px] font-black opacity-40 uppercase block">Mouthfeel</span>
                        <div class="flex flex-col gap-1">
                          <span class="text-[10px] font-black uppercase line-height-none">{latestPost.mouthfeel || '-'}</span>
                          <div class="flex flex-wrap gap-1">
                            {#each latestPost.mouthfeel_types || [] as t}
                              <span class="border border-[--color-border] text-[8px] px-1 font-bold uppercase">{t}</span>
                            {/each}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl" title="Mood">{latestPost.mood}</span>
                        {#if latestPost.location_name || latestPost.location_url}
                          <div class="flex items-center gap-2">
                            <span class="w-7 h-7 border-2 border-[--color-border] flex items-center justify-center text-xs bg-white">📍</span>
                            {#if latestPost.location_url && latestPost.location_name}
                              <a href={latestPost.location_url} target="_blank" class="text-[10px] font-black uppercase underline decoration-2 underline-offset-2 hover:text-accent transition-colors">{latestPost.location_name}</a>
                            {:else if latestPost.location_name}
                              <span class="text-[10px] font-black uppercase">{latestPost.location_name}</span>
                            {:else if latestPost.location_url}
                              <a href={latestPost.location_url} target="_blank" class="text-[10px] font-black uppercase underline hover:text-accent">VIEW LOCATION</a>
                            {/if}
                          </div>
                        {:else}
                          <span class="text-[10px] font-bold opacity-30 italic">NO LOCATION SHARED</span>
                        {/if}
                      </div>
                      <BowButton postId={latestPost.id} initialCount={latestPost.bow_count} />
                    </div>
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
