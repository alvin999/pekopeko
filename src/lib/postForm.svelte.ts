import { supabase } from "./supabase";
import { toast } from "./toastStore.svelte";

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
  isLoading = $state(false);
  errorMsg = $state("");
  hasPostedToday = $state(false);

  async checkAlreadyPosted() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("posts")
        .select("id")
        .eq("user_id", user.id)
        .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (data && data.length > 0) {
        this.hasPostedToday = true;
      }
    }
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
      this.errorMsg = "請先登入後再建立貼文";
      this.isLoading = false;
      return;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      drink_type: this.drinkType,
      item_name: this.itemName,
      flavors: this.flavors,
      mood: this.mood,
      location_name: this.shopSearchName,
      flavor_intensity: this.flavorIntensity,
      main_tastes: this.mainTastes,
      acidity_intensity: this.acidityIntensity,
      acidity_type: this.acidityType,
      sweetness_intensity: this.sweetnessIntensity,
      mouthfeel: this.mouthfeel,
      mouthfeel_types: this.mouthfeelTypes,
    });

    if (error) {
      this.errorMsg = error.message;
    } else {
      window.location.href = "/";
    }
    this.isLoading = false;
  };
}

// 導出實例
export const postForm = new PostForm();
