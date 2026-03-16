<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../lib/supabase';
  import AvatarGenerator from './AvatarGenerator.svelte';

  let user: any = null;
  let latestPost: any = null;
  let authListener: any = null;

  async function fetchUserStatus(authUser: any) {
    user = authUser;
    if (user) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase.from('posts')
        .select('*')
        .eq('user_id', user.id)
        .gt('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1);
      
      latestPost = data && data.length > 0 ? data[0] : null;
    } else {
      latestPost = null;
    }
  }

  onMount(async () => {
    const { data: { user: initialUser } } = await supabase.auth.getUser();
    await fetchUserStatus(initialUser);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await fetchUserStatus(session?.user || null);
    });
    authListener = subscription;
  });

  onDestroy(() => {
    if (authListener) authListener.unsubscribe();
  });

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }
</script>

<div class="flex items-center gap-4">
  {#if user}
    <a href="/create" class="brutalist-btn-primary scale-90 md:scale-100 italic! font-black! border-4! shadow-[6px_6px_0px_0px_var(--color-border)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_var(--color-border)] transition-all">
      + 紀錄今日
    </a>
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="border-4 border-[--color-border] bg-white p-0.5 hover:bg-[--color-accent] transition-all shadow-[4px_4px_0px_0px_var(--color-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none overflow-hidden group">
        <div class="w-10 h-10 flex items-center justify-center relative">
          <AvatarGenerator 
            drinkType={latestPost?.drink_type || 'coffee'}
            flavors={latestPost?.flavors || []}
            body={latestPost?.body || 'round'}
            mood={latestPost?.mood || '😊'}
            size={40}
            isEmpty={!latestPost}
            noShadow={true}
          />
        </div>
      </div>
      <ul tabindex="0" class="menu menu-sm dropdown-content mt-4 z-[1] p-2 bg-white border-4 border-[--color-border] shadow-[8px_8px_0px_0px_var(--color-border)] w-52">
        <li class="px-2 py-1 mb-2 border-b-2 border-dashed border-[--color-border]">
          <span class="font-black text-[10px] uppercase opacity-40">Account</span>
          <span class="font-bold truncate">{user.user_metadata?.full_name || 'Anonymous'}</span>
        </li>
        <li><a href="/profile" class="font-bold hover:bg-[--color-accent]! transition-colors">個人檔案</a></li>
        <li><button on:click={handleLogout} class="font-bold text-error hover:bg-red-50! transition-colors">登出</button></li>
      </ul>
    </div>
  {:else}
    <button on:click={handleLogin} class="brutalist-btn-primary scale-90 md:scale-100">使用 GOOGLE 登入</button>
  {/if}
</div>
