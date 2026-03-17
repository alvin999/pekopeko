export class ViewportTracker {
  // 使用 $state 時，盡量在構造函數或方法中處理
  scrollY = $state(0);
  innerWidth = $state(typeof window !== "undefined" ? window.innerWidth : 1024);

  // $derived 是安全的
  isMobile = $derived(this.innerWidth < 768);
  scrollProgress = $derived(Math.min(Math.max(this.scrollY / 300, 0), 1));

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
