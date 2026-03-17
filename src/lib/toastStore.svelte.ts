type ToastType = "warning" | "error";

export class ToastStore {
  message = $state("");
  type = $state<ToastType>("warning");
  visible = $state(false);
  timer: any = null;

  show(msg: string, t: ToastType = "warning") {
    if (this.timer) clearTimeout(this.timer);
    this.message = msg;
    this.type = t;
    this.visible = true;
    
    this.timer = setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
}

export const toast = new ToastStore();
