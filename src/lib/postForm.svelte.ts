import { supabase } from "./supabase";
import { toast } from "./toastStore.svelte";
import { getLocalDateString, isValidPostDate } from "./dateUtils";

export class PostForm {
  drinkType = $state<"coffee" | "tea">("coffee");
  itemName = $state("");
  flavors = $state<string[]>([]);
  flavorIntensity = $state<"low" | "medium" | "high">("medium");
  mainTastes = $state<string[]>([]);
  acidityIntensity = $state<"low" | "medium" | "high">("medium");
  acidityType = $state<"dry" | "sweet">("sweet");
  sweetnessIntensity = $state<"low" | "medium" | "high">("medium");
  mouthfeel = $state<"low" | "medium" | "high">("medium");
  mouthfeelTypes = $state<string[]>([]);
  mood = $state("🙂");
  shopSearchName = $state("");
  lat = $state<number | null>(null);
  lng = $state<number | null>(null);
  shopId = $state<string | null>(null);
  isLocationSelected = $state(false); // 標記是否為透過建議選取的權威地點
  isLoading = $state(false);
  errorMsg = $state("");
  hasPostedToday = $state(false);
  private STORAGE_KEY = 'pekopeko_post_draft';

  async checkAlreadyPosted() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const today = getLocalDateString();
      
      const { data } = await supabase
        .from("posts")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_date", today)
        .limit(1);

      if (data && data.length > 0) {
        this.hasPostedToday = true;
      }
    }
  }

  persist() {
    if (typeof localStorage === 'undefined') return;
    const data = {
      drinkType: this.drinkType,
      itemName: this.itemName,
      flavors: $state.snapshot(this.flavors),
      flavorIntensity: this.flavorIntensity,
      mainTastes: $state.snapshot(this.mainTastes),
      acidityIntensity: this.acidityIntensity,
      acidityType: this.acidityType,
      sweetnessIntensity: this.sweetnessIntensity,
      mouthfeel: this.mouthfeel,
      mouthfeelTypes: $state.snapshot(this.mouthfeelTypes),
      mood: this.mood,
      shopSearchName: this.shopSearchName,
      lat: this.lat,
      lng: this.lng,
      shopId: this.shopId,
      isLocationSelected: this.isLocationSelected
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  load() {
    if (typeof localStorage === 'undefined') return;
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.drinkType) this.drinkType = data.drinkType;
        if (data.itemName) this.itemName = data.itemName;
        if (data.flavors) this.flavors = data.flavors;
        if (data.flavorIntensity) this.flavorIntensity = data.flavorIntensity;
        if (data.mainTastes) this.mainTastes = data.mainTastes;
        if (data.acidityIntensity) this.acidityIntensity = data.acidityIntensity;
        if (data.acidityType) this.acidityType = data.acidityType;
        if (data.sweetnessIntensity) this.sweetnessIntensity = data.sweetnessIntensity;
        if (data.mouthfeel) this.mouthfeel = data.mouthfeel;
        if (data.mouthfeelTypes) this.mouthfeelTypes = data.mouthfeelTypes;
        if (data.mood) this.mood = data.mood;
        if (data.shopSearchName) this.shopSearchName = data.shopSearchName;
        if (data.lat) this.lat = data.lat;
        if (data.lng) this.lng = data.lng;
        if (data.shopId) this.shopId = data.shopId;
        if (data.isLocationSelected !== undefined) this.isLocationSelected = data.isLocationSelected;
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }

  clear() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  toggleFlavor(flavor: string, isParent: boolean, childrenNames: string[], parentName?: string) {
    const isAlreadySelected = this.flavors.includes(flavor);

    if (isAlreadySelected) {
      // 若已選取，則直接移除
      this.flavors = this.flavors.filter((f) => f !== flavor);
      return;
    }

    // 處理互斥邏輯 (切換)
    let pendingFlavors = [...this.flavors];

    if (isParent) {
      // 點擊父類別：移除所有已選子類別，準備加入父類別
      pendingFlavors = pendingFlavors.filter(f => !childrenNames.includes(f));
    } else if (parentName && pendingFlavors.includes(parentName)) {
      // 點擊子類別且父類別已選：移除父類別，準備加入子類別
      pendingFlavors = pendingFlavors.filter(f => f !== parentName);
    }

    // 檢查上限
    if (pendingFlavors.length >= 5) {
      toast.show("最多只能選擇 5 種風味喲！🥤", "warning");
      return;
    }

    // 執行更新
    this.flavors = [...pendingFlavors, flavor];
  }

  toggleMainTaste(taste: string) {
    if (this.mainTastes.includes(taste)) {
      this.mainTastes = this.mainTastes.filter((t) => t !== taste);
    } else if (this.mainTastes.length < 2) {
      this.mainTastes = [...this.mainTastes, taste];
    } else {
      toast.show("味覺主調選 2 個最精準！😋", "warning");
    }
  }

  toggleMouthfeel(type: string) {
    if (this.mouthfeelTypes.includes(type)) {
      this.mouthfeelTypes = this.mouthfeelTypes.filter((t) => t !== type);
    } else if (this.mouthfeelTypes.length < 2) {
      this.mouthfeelTypes = [...this.mouthfeelTypes, type];
    } else {
      toast.show("口感選 2 個能描述得更棒！👅", "warning");
    }
  }

  submit = async () => {
    if (this.hasPostedToday) return;
    this.isLoading = true;
    this.errorMsg = "";

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      this.persist();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/create'
        }
      });
      this.isLoading = false;
      return;
    }

    const today = getLocalDateString();

    if (!isValidPostDate(today)) {
      this.errorMsg = "系統偵測到您的裝置日期異常，請校準後再試！";
      this.isLoading = false;
      return;
    }

    let finalShopId = this.shopId;

    // 方案 B：只有在使用者「明確從建議選取」或「在地圖上點擊標記地標」的情況下，才建立或關聯商店
    if (!finalShopId && this.isLocationSelected && this.lat && this.lng) {
      const sKey = this.shopSearchName.toLowerCase().trim().replace(/\s+/g, '');
      
      // 搜尋附近 50 公尺內 (約 0.0005 度) 且 search_key 相同的店家 (去重檢查)
      const { data: existingShop } = await supabase
        .from("shops")
        .select("id")
        .eq("search_key", sKey)
        .gte("latitude", this.lat - 0.0005)
        .lte("latitude", this.lat + 0.0005)
        .gte("longitude", this.lng - 0.0005)
        .lte("longitude", this.lng + 0.0005)
        .maybeSingle();

      if (existingShop) {
        finalShopId = existingShop.id;
      } else {
        // 確定是新地點且有權威來源 (如：選自 Nominatim)，才建立一筆未驗證店家
        const { data: newShop } = await supabase.from("shops").insert({
          name: this.shopSearchName,
          latitude: this.lat,
          longitude: this.lng,
          search_key: sKey
        }).select().single();
        
        if (newShop) {
          finalShopId = newShop.id;
        }
      }
    } else if (!this.isLocationSelected) {
      // 如果使用者只是手動輸入文字而未選取權威建議，則不關聯商店與座標 (回歸純文字模式)
      finalShopId = null;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      post_date: today,
      drink_type: this.drinkType,
      item_name: this.itemName,
      flavors: this.flavors,
      mood: this.mood,
      location_name: this.shopSearchName,
      shop_id: finalShopId,
      flavor_intensity: this.flavorIntensity,
      main_tastes: this.mainTastes,
      acidity_intensity: this.acidityIntensity,
      acidity_type: this.acidityType,
      sweetness_intensity: this.sweetnessIntensity,
      mouthfeel: this.mouthfeel,
      mouthfeel_types: this.mouthfeelTypes,
    });

    if (error) {
      if (error.code === '23505') {
        this.hasPostedToday = true;
        this.errorMsg = "今天已經發送過貼文囉，明天 0 點再見！✨";
      } else {
        this.errorMsg = error.message;
      }
    } else {
      this.clear();
      window.location.href = "/";
    }
    this.isLoading = false;
  };
}

// 導出實例
export const postForm = new PostForm();
