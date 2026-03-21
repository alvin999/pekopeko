<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { postForm } from "../../lib/postForm.svelte";
  import { supabase } from "../../lib/supabase";
  import MapPicker from "../map/MapPicker.svelte";

  let showMap = $state(false);
  // ... (其餘 state 不變)

  const handleMapMove = (e: any) => {
    const { lat, lng, name } = e.detail;
    postForm.lat = lat;
    postForm.lng = lng;
    if (name) {
      postForm.shopSearchName = name;
      postForm.isLocationSelected = true;
    }
  };

  onMount(() => {
    window.addEventListener('pekopeko:map-move', handleMapMove);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pekopeko:map-move', handleMapMove);
    }
  });
  let searchSuggestions = $state<
    { name: string; lat: number; lng: number; id?: string; source: string }[]
  >([]);
  let isSearching = $state(false);
  let searchTimeout: any;

  async function handleSearch(query: string) {
    postForm.isLocationSelected = false; // 開始輸入即視為未選取權威地點
    if (!query || query.length < 2) {
      searchSuggestions = [];
      return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      isSearching = true;
      try {
        // 1. 搜尋 Supabase 本地商店
        const { data: localShops } = await supabase
          .from("shops")
          .select("id, name, latitude, longitude")
          .ilike("name", `%${query}%`)
          .limit(3);

        // 2. 搜尋 Nominatim 全球地標
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        );
        const globalShops = await nominatimResponse.json();

        // 整合結果 (優先顯示本地)
        const suggestions = [
          ...(localShops?.map((s) => ({
            id: s.id,
            name: s.name,
            lat: s.latitude,
            lng: s.longitude,
            source: "本地商店",
          })) || []),
          ...globalShops.map((g: any) => ({
            name: g.display_name.split(",")[0], // 取得主要名稱
            lat: parseFloat(g.lat),
            lng: parseFloat(g.lon),
            source: "全球地標",
          })),
        ];

        // 簡單去重
        searchSuggestions = suggestions.filter(
          (v, i, a) => a.findIndex((t) => t.name === v.name) === i,
        );
      } catch (e) {
        console.error("搜尋地點失敗:", e);
      } finally {
        isSearching = false;
      }
    }, 400);
  }

  function selectSuggestion(s: any) {
    postForm.shopSearchName = s.name;
    postForm.lat = s.lat;
    postForm.lng = s.lng;
    postForm.shopId = s.id || null;
    postForm.isLocationSelected = true; // 明確點選建議
    searchSuggestions = [];
    showMap = true; // 選取後展示地圖確認
  }
</script>

<section>
  <div class="flex justify-between items-end mb-4">
    <span class="font-black text-xs uppercase tracking-[0.2em] opacity-50">
      Discovery Location
    </span>
    <button
      type="button"
      class="text-[10px] font-bold underline decoration-2 underline-offset-4 hover:text-accent"
      onclick={() => (showMap = !showMap)}
    >
      {showMap ? "[- Close Map]" : "[+ Add Map Location]"}
    </button>
  </div>

  <div class="bg-[#F5F2EA] border-2 border-[--color-border] p-4 space-y-4">
    <div class="relative">
      <input
        type="text"
        placeholder="輸入地點名稱 (如：西門町、某某咖啡店)..."
        class="w-full bg-white border-2 border-[--color-border] px-3 py-2 text-xs font-bold focus:bg-accent outline-none"
        bind:value={postForm.shopSearchName}
        oninput={(e) => handleSearch(e.currentTarget.value)}
      />

      {#if isSearching || searchSuggestions.length > 0}
        <div
          class="absolute z-50 left-0 right-0 top-full mt-1 bg-white border-2 border-[--color-border] shadow-[4px_4px_0_var(--color-border)] max-h-60 overflow-y-auto"
        >
          {#if isSearching}
            <div class="p-3 text-[10px] font-bold opacity-50 italic">
              搜尋中...
            </div>
          {/if}

          {#each searchSuggestions as s}
            <button
              type="button"
              class="w-full text-left p-3 border-b last:border-b-0 border-[--color-border] hover:bg-accent group transition-colors"
              onclick={() => selectSuggestion(s)}
            >
              <div class="flex justify-between items-start gap-2">
                <span class="text-xs font-black truncate">{s.name}</span>
                <span
                  class="text-[9px] font-bold px-1 bg-[--color-border] text-white group-hover:bg-black uppercase shrink-0"
                >
                  {s.source}
                </span>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class={showMap ? "animate-in fade-in zoom-in-95 duration-200" : "hidden"}>
      <MapPicker
        location={{
          lat: postForm.lat || 25.0339,
          lng: postForm.lng || 121.5645,
        }}
        placeholder="拖動圖釘以標記精確位置"
      />
    </div>
  </div>
</section>
