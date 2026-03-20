<script lang="ts">
  import { supabase } from '../lib/supabase';
  import { postForm } from '../lib/postForm.svelte';
  import { getLocalDateString } from '../lib/dateUtils';
  import { toast } from '../lib/toastStore.svelte';
  import { onMount } from 'svelte';

  let isOpen = $state(false);
  let user = $state<any>(null);

  const ADMIN_EMAIL = 'bingoppp@gmail.com';
  const testAccounts = [
    { email: 'test1@example.com', label: '測試員 A' },
    { email: 'test2@example.com', label: '測試員 B' },
    { email: 'test3@example.com', label: '測試員 C' },
  ];

  // 判斷當前使用者是否有權限使用工具箱
  const isAuthorized = $derived(
    user && (user.email === ADMIN_EMAIL || testAccounts.some(acc => acc.email === user.email))
  );

  onMount(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;
    
    // 初始化 PostForm 的繞過狀態
    postForm.checkAlreadyPosted();
  });

  async function deleteTodaysPost() {
    if (!user) {
      toast.show('請先登入', 'warning');
      return;
    }

    const today = getLocalDateString();
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', user.id)
      .eq('post_date', today);

    if (error) {
      toast.show('刪除失敗：' + error.message, 'error');
    } else {
      toast.show('今日貼文已從資料庫清除！✨', 'warning');
      postForm.hasPostedToday = false;
    }
  }

  async function loginAs(email: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'testpassword123'
    });

    if (error) {
       toast.show('登入失敗。請確保 Supabase 已開啟 Email 登入且測試帳號密碼為 testpassword123', 'error');
       console.error(error);
    } else {
       toast.show(`已切換至 ${email}`, 'warning');
       window.location.reload();
    }
  }

  async function loginAsOwner() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      toast.show('切換失敗：' + error.message, 'error');
    }
  }
</script>

{#if isAuthorized}
  <div class="fixed bottom-4 right-4 z-9999 font-sans">
    {#if isOpen}
      <div class="bg-white border-4 border-[--color-border] shadow-[8px_8px_0px_0px_var(--color-border)] p-4 w-64 mb-4 flex flex-col gap-3">
        <div class="flex justify-between items-center border-b-4 border-[--color-border] pb-2 mb-1">
          <h3 class="font-black italic text-lg uppercase tracking-tighter">🛠️ Dev Toolbox</h3>
          <button onclick={() => isOpen = false} class="font-bold hover:text-red-500">✕</button>
        </div>

        <!-- 發文控制 -->
        <div class="flex flex-col gap-2">
          <span class="text-[10px] font-black uppercase opacity-50 tracking-widest">Posting Controls</span>
          
          <button 
            onclick={deleteTodaysPost}
            class="w-full text-left px-3 py-2 border-2 border-[--color-border] bg-red-50 hover:bg-red-100 font-bold text-sm transition-all"
          >
            🗑️ 清除今日實體紀錄
          </button>
        </div>

        <!-- 帳號切換 -->
        <div class="flex flex-col gap-2 mt-2">
          <span class="text-[10px] font-black uppercase opacity-50 tracking-widest">Account Switcher</span>
          
          {#if user.email !== ADMIN_EMAIL}
            <button 
              onclick={loginAsOwner}
              class="w-full text-left px-3 py-2 border-2 border-[--color-border] bg-blue-50 hover:bg-blue-100 transition-all font-bold text-xs"
            >
              🔄 切回我的帳號 (Alvin)
            </button>
          {/if}

          <div class="flex flex-col gap-1.5 pt-1 border-t border-[--color-border]/20">
            <span class="text-[9px] font-bold opacity-40 uppercase tracking-tighter">Test Accounts (Email)</span>
            {#each testAccounts as acc}
              <button 
                onclick={() => loginAs(acc.email)}
                class="w-full text-left px-3 py-1.5 border-2 border-[--color-border] hover:bg-[--color-accent] transition-all font-bold text-xs {user.email === acc.email ? 'bg-[--color-accent]' : ''}"
              >
                👤 {acc.label} ({acc.email.split('@')[0]})
              </button>
            {/each}
          </div>
          
          <p class="text-[10px] opacity-40 italic mt-1 leading-tight">
            *測試帳號密碼均為 testpassword123
          </p>
        </div>

        <div class="text-[10px] mt-2 border-t border-dashed border-[--color-border] pt-2 font-mono">
          Current: {user?.email}
        </div>
      </div>
    {/if}

    <button 
      onclick={() => isOpen = !isOpen}
      class="w-12 h-12 bg-white border-4 border-[--color-border] shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-border)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center text-xl"
      title="Developer Tools"
    >
      🛠️
    </button>
  </div>
{/if}

<style>
  /* 確保不受外部通用樣式干擾太嚴重 */
  .font-black { font-weight: 900; }
</style>
