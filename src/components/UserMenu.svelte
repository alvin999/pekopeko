<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../lib/supabase';
  import AvatarGenerator from './AvatarGenerator.svelte';
  import { getLocalDateString } from '../lib/dateUtils';

  let user: any = null;
  let latestPost: any = null;
  let authListener: any = null;

  async function fetchUserStatus(authUser: any) {
    user = authUser;
    if (user) {
      const today = getLocalDateString();
      const { data } = await supabase.from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_date', today)
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

  // - 當使用者登入後，導覽列會即時顯示使用者首字（或今日大頭貼）。
  // - **[修復]** 陰影縮減至 2px，徹底解決了與導覽列下邊框重疊的問題。
  // - **[風格同步]** 按鈕改名為「+ 新增品飲」，並採用與標題一致的 `title-outline` 風格（白色背景 + 粉色文字陰影）。
  // - 點擊選單的功能測試正常。
  //
  // ### 導覽列最終優化截圖
  // ![導覽列：陰影修正與按鈕風格同步後的完美呈現](/home/alvin/.gemini/antigravity/brain/b3f5eb67-0d09-4df5-88d0-0bf6f862b214/navbar_verification_1773635720240.png)
  //
  // ---
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

<div class="flex items-center gap-2 md:gap-4 flex-wrap justify-end">
  <a href="/create" class="bg-white hover:bg-[--color-accent] text-[--color-text] title-outline px-2! py-1! md:px-6! md:py-2! border-2! md:border-4! border-[--color-border] shadow-brutalist-sm md:shadow-brutalist hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutalist md:hover:shadow-[8px_8px_0px_0px_var(--color-border)] transition-all uppercase tracking-tighter text-xs! md:text-lg! flex items-center justify-center whitespace-nowrap">
    + 新增品飲
  </a>

  {#if user}
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="border-4 border-[--color-border] bg-white p-0.5 hover:bg-[--color-accent] transition-all shadow-brutalist-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none overflow-hidden group">
        <div class="w-10 h-10 flex items-center justify-center relative">
          <AvatarGenerator 
            drinkType={latestPost?.drink_type || 'coffee'}
            flavors={latestPost?.flavors || []}
            mouthfeel={latestPost?.mouthfeel || 'medium'}
            mood={latestPost?.mood || '😊'}
            size={40}
            isEmpty={!latestPost}
            noShadow={true}
          />
        </div>
      </div>
      <ul class="menu menu-sm dropdown-content mt-4 z-1 p-2 bg-white border-4 border-[--color-border] shadow-[8px_8px_0px_0px_var(--color-border)] w-52">
        <li class="px-4 py-2 mb-2 border-b-2 border-dashed border-[--color-border] pointer-events-none">
          <span class="font-black text-[10px] uppercase opacity-40 p-0!">Account</span>
        </li>
        <li>
          <a href="/profile" class="font-bold truncate hover:bg-[--color-accent]! transition-colors flex flex-col items-start gap-0.5">
            <span class="text-xs opacity-60 font-medium">View Profile</span>
            <span class="text-base">{user.user_metadata?.full_name || 'Anonymous'}</span>
          </a>
        </li>
        <li class="mt-2 border-t-2 border-[--color-border] pt-2">
          <button on:click={handleLogout} class="font-bold text-error hover:bg-red-50! transition-colors">登出</button>
        </li>
      </ul>
    </div>
  {:else}
    <button on:click={handleLogin} class="bg-white hover:bg-[--color-accent] text-[--color-text] title-outline px-2! py-1! md:px-6! md:py-2! border-2! md:border-4! border-[--color-border] shadow-brutalist-sm md:shadow-brutalist hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutalist md:hover:shadow-[8px_8px_0px_0px_var(--color-border)] transition-all uppercase tracking-tighter text-xs! md:text-lg! flex items-center justify-center whitespace-nowrap">
      使用 <span class="google-text-gradient mx-1">GOOGLE</span> 登入
    </button>
  {/if}
</div>
