export class ViewportTracker {
  // 使用 $state 時，盡量在構造函數或方法中處理
  scrollY = $state(0);
  innerWidth = $state(typeof window !== "undefined" ? window.innerWidth : 1024);

  // $derived 是安全的
  // $derived 是安全的
  isMobile = $derived(this.innerWidth < 768);
  
  // 縮放進度：當捲動超過特定位移後才開始計算
  // 手機版 NavBar 底部位於約 117px，PreviewSection 頂部位於約 440px
  // 設定從 200px 左右開始準備縮放，350px 之後加速完成
  scrollProgress = $derived.by(() => {
    const startY = 250; // 開始明顯縮放的門檻
    const endY = 550;   // 完整縮小完成的捲動位置
    if (this.scrollY < startY) return 0;
    return Math.min(Math.max((this.scrollY - startY) / (endY - startY), 0), 1);
  });

  // 絕對不要在頂層使用 $effect
  init() {
    if (typeof window === "undefined") return;
    
    const handleScroll = () => {
      this.scrollY = window.scrollY;
    };
    const handleResize = () => {
      this.innerWidth = window.innerWidth;
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Initial values
    this.scrollY = window.scrollY;
    this.innerWidth = window.innerWidth;

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }
}

export const viewport = new ViewportTracker();
