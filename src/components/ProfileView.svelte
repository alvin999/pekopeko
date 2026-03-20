<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase';
  import AvatarGenerator from './AvatarGenerator.svelte';
  import { getLocalDateString } from '../lib/dateUtils';
  import BowButton from './BowButton.svelte';
  import ShareActions from './ShareActions.svelte';

  let user: any = null;
  let profile: any = null;
  let latestPost: any = null;
  let loading = true;

  onMount(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      const today = getLocalDateString();
      
      const [profileRes, postsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('posts')
          .select('*')
          .eq('user_id', user.id)
          .eq('post_date', today)
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

  let isEditing = false;
  let newUsername = '';
  let saving = false;
  let error = '';

  function toggleEdit() {
    isEditing = !isEditing;
    if (isEditing) {
      newUsername = profile?.username || user.user_metadata?.full_name || '';
      error = '';
    }
  }

  async function saveUsername() {
    if (!newUsername.trim()) {
      error = '使用者名稱不可為空';
      return;
    }
    
    saving = true;
    error = '';
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // 更新本地狀態
      profile = { ...profile, username: newUsername.trim() };
      isEditing = false;
    } catch (err: any) {
      console.error('Error updating username:', err);
      error = err.message || '更新失敗，請稍後再試';
    } finally {
      saving = false;
    }
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
          <div class="flex items-center gap-4 group/title mb-4">
            {#if isEditing}
              <div class="flex-1 flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    bind:value={newUsername}
                    placeholder="輸入新的使用者名稱..."
                    class="flex-1 bg-white border-4 border-[--color-border] p-3 font-black text-2xl italic shadow-brutalist-sm focus:outline-none focus:ring-4 focus:ring-accent/30"
                    disabled={saving}
                    on:keydown={(e) => e.key === 'Enter' && saveUsername()}
                  />
                  <div class="flex gap-2">
                    <button 
                      class="bg-white border-4 border-[--color-border] p-3! font-bold shadow-brutalist-sm hover:bg-gray-100 transition-colors grid place-items-center" 
                      on:click={saveUsername}
                      disabled={saving}
                      title="儲存"
                    >
                      {#if saving}
                        <span class="loading loading-spinner loading-xs"></span>
                      {:else}
                        <span class="text-xl">✅</span>
                      {/if}
                    </button>
                    <button 
                      class="bg-white border-4 border-[--color-border] p-3! font-bold shadow-brutalist-sm hover:bg-gray-100 transition-colors" 
                      on:click={toggleEdit}
                      disabled={saving}
                      title="取消"
                    >
                      <span class="text-xl">❌</span>
                    </button>
                  </div>
                </div>
                {#if error}
                  <p class="text-xs font-bold text-red-500 italic">{error}</p>
                {/if}
              </div>
            {:else}
              <h1 class="text-6xl md:text-7xl font-black italic title-outline uppercase tracking-tighter">
                {profile?.username || user.user_metadata?.full_name || 'ANONYMOUS'}
              </h1>
              <button 
                on:click={toggleEdit}
                class="opacity-0 group-hover/title:opacity-100 transition-opacity bg-white border-2 border-[--color-border] p-2 shadow-brutalist-sm hover:scale-110 active:scale-95"
                title="修改名稱"
              >
                <span class="text-xl">✏️</span>
              </button>
            {/if}
          </div>
          
          <div class="flex flex-col gap-4">
            <p class="font-bold opacity-60 text-lg">
              ACCUMULATED <span class="bg-accent px-2 border-2 border-[--color-border]">{profile?.total_bows_received || 0}</span> BOWS RECEIVED 🙏
            </p>
            
            <div class="mt-4 pt-6 border-t-2 border-[--color-border] border-dashed">
              {#if latestPost}
                <div class="space-y-6">
                  <div class="flex flex-wrap items-center gap-3">
                    <span class="text-xs font-bold opacity-60 italic">
                      {new Intl.DateTimeFormat('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(latestPost.created_at))} POSTED
                    </span>
                  </div>

                  <div class="bg-[#F5F2EA] p-6 border-2 border-[--color-border] space-y-4">
                    <div class="flex flex-wrap gap-2">
                      <h3 class="text-4xl font-black italic uppercase text-[--color-accent] mb-2 w-full tracking-tighter title-outline-sm">
                        {latestPost.item_name || "TODAY'S BREW"}
                      </h3>
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
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 py-6 border-y-2 border-[--color-border] border-dashed items-start">
                      <!-- 標題列 -->
                      <span class="text-xs font-black opacity-40 uppercase">Main Taste</span>
                      <span class="text-xs font-black opacity-40 uppercase">Acidity</span>
                      <span class="text-xs font-black opacity-40 uppercase">Sweetness</span>
                      <span class="text-xs font-black opacity-40 uppercase">Mouthfeel</span>
                      <!-- 內容列 -->
                      <div class="flex flex-wrap items-center gap-1.5 self-center">
                        {#if latestPost.main_tastes && latestPost.main_tastes.length > 0}
                          {#each latestPost.main_tastes as t}
                            <span class="bg-black text-white text-[10px] px-2 py-0.5 font-bold uppercase leading-none flex items-center">{t}</span>
                          {/each}
                        {:else}
                          <span class="text-xs font-bold opacity-20 italic">NONE</span>
                        {/if}
                      </div>
                      <div class="flex flex-col gap-1.5 self-center">
                        <span class="text-lg font-black uppercase underline decoration-4 decoration-accent underline-offset-4 block w-fit leading-none">
                          {latestPost.acidity_intensity || '-'}
                        </span>
                        {#if latestPost.acidity_type}
                          <span class="border-2 border-[--color-border] text-[9px] px-1.5 py-0.5 font-bold uppercase leading-none inline-flex items-center w-fit">
                            {latestPost.acidity_type}
                          </span>
                        {/if}
                      </div>
                      <div class="flex items-center self-center">
                        <span class="text-lg font-black uppercase leading-none">{latestPost.sweetness_intensity || '-'}</span>
                      </div>
                      <div class="flex flex-col gap-1.5 self-center">
                        <span class="text-lg font-black uppercase leading-none underline decoration-2 decoration-accent underline-offset-4">{latestPost.mouthfeel || '-'}</span>
                        {#if latestPost.mouthfeel_types && latestPost.mouthfeel_types.length > 0}
                          <div class="flex flex-wrap items-center gap-1">
                            {#each latestPost.mouthfeel_types as t}
                              <span class="border-2 border-[--color-border] text-[9px] px-1.5 py-0.5 font-bold uppercase leading-none flex items-center">{t}</span>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl" title="Mood">{latestPost.mood}</span>
                        {#if latestPost.location_name || latestPost.location_url}
                          <div class="flex items-center gap-2">
                            <span class="text-xl">📍</span>
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
                      <div class="flex items-center gap-4">
                        <BowButton postId={latestPost.id} initialCount={latestPost.bow_count} />
                      </div>
                    </div>

                    <div class="pt-4 border-t-2 border-[--color-border] border-dashed">
                      <ShareActions 
                        {...latestPost} 
                        drinkName={latestPost.item_name}
                        drinkType={latestPost.drink_type}
                        flavorIntensity={latestPost.flavor_intensity}
                        acidityIntensity={latestPost.acidity_intensity}
                        acidityType={latestPost.acidity_type}
                        sweetnessIntensity={latestPost.sweetness_intensity}
                        itemName={latestPost.item_name}
                        locationName={latestPost.location_name}
                      />
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
