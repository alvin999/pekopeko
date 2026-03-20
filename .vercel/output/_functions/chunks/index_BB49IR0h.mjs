import { c as createComponent } from './astro-component_CykpJgO-.mjs';
import 'piccolore';
import { y as renderComponent, r as renderTemplate, G as defineScriptVars, h as addAttribute, m as maybeRenderHead } from './entrypoint_Cbh-_4TN.mjs';
import { s as supabase, $ as $$Layout } from './Layout_9zGyi0wn.mjs';
import { g as getLocalDateString, A as AvatarGenerator } from './dateUtils_wYJ5apcD.mjs';
import { B as BowButton } from './BowButton_Bo1cE67E.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const cookieDate = Astro2.cookies.get("user_today")?.value;
  const serverToday = getLocalDateString();
  const today = cookieDate || serverToday;
  const { data: posts, error } = await supabase.from("posts").select(
    `
    *,
    profiles (username),
    shops (name),
    item_name,
    location_name
  `
  ).eq("post_date", today).order("bow_count", { ascending: false });
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "杯口杯口 PekoPeko | 今日熱門飲品" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="container mx-auto px-4 py-20"> <div class="flex flex-col items-center mb-20 text-center"> <h1 class="text-6xl md:text-8xl font-black uppercase tracking-tighter italic title-outline mb-6">\n今日熱門\n</h1> <p class="text-lg font-bold opacity-70 max-w-lg border-[--color-border] pb-2">\n今日限定，每日 0 點準時重設。\n</p> <p class="text-lg font-bold opacity-70 max-w-lg border-b-2 border-[--color-border] pb-2">\n一日一次的感動足跡。\n</p> </div> ', ' <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-start"> ', " </div> ", " <script>(function(){", `
      (function() {
        const now = new Date();
        const clientDate = now.getFullYear() + '-' + 
                           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(now.getDate()).padStart(2, '0');
        
        if (serverToday !== clientDate) {
          document.cookie = "user_today=" + clientDate + "; path=/; max-age=86400; SameSite=Lax";
          window.location.reload();
        }
      })();
    })();<\/script> </div> `])), maybeRenderHead(), error && renderTemplate`<div class="alert brutalist-card bg-error text-error-content max-w-md mx-auto mb-8"> ${error.message} </div>`, posts?.map((post) => renderTemplate`<div class="brutalist-card flex flex-col group"> <div class="p-6 flex flex-col gap-4 border-b-4 border-[--color-border] bg-white relative overflow-hidden"> <div class="absolute right-6 top-6 text-3xl opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 rotate-12 z-10"> ${post.drink_type === "coffee" ? "☕" : "🍵"} </div> <div class="flex flex-col relative z-20"> <div class="flex items-center gap-2 mb-2"> <span class="text-4xl leading-none"> ${post.mood} </span> <span class="font-black italic uppercase text-3xl tracking-tighter title-outline-sm leading-none pt-1"> ${post.item_name || (post.drink_type === "coffee" ? "咖啡" : "茶")} </span> </div> <div class="flex items-center gap-3"> <div class="text-[10px] font-bold opacity-60 bg-black/5 px-2 py-0.5 flex gap-1"> <span>POSTED AT:</span> <span${addAttribute(post.created_at, "data-time")} data-format="short"> ${new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(post.created_at))} </span> </div> </div> </div> </div> <div class="p-8 flex flex-col items-center gap-8 bg-[#F5F2EA]"> <a${addAttribute(`/post/${post.id}`, "href")} class="hover:scale-105 transition-transform"> ${renderComponent($$result2, "AvatarGenerator", AvatarGenerator, { "client:visible": true, "drinkType": post.drink_type, "flavors": post.flavors, "mouthfeel": post.mouthfeel, "mood": post.mood, "size": 240, "client:component-hydration": "visible", "client:component-path": "/home/alvin/Dropbox/VSCode/pekopeko/src/components/AvatarGenerator.svelte", "client:component-export": "default" })} </a> ${post.flavors?.length > 0 && renderTemplate`<div class="flex flex-wrap justify-center gap-2"> ${post.flavors.map((f) => renderTemplate`<span class="brutalist-badge badge-white">${f}</span>`)} </div>`} <div class="flex items-center justify-between w-full mt-4 border-t-2 border-[--color-border] pt-6"> <div class="flex gap-4 items-center"> <div class="flex items-center gap-2"> <span class="text-2xl">
📍
</span> ${(post.shops?.name || post.shops?.[0]?.name || post.location_name) && renderTemplate`<span class="text-[10px] font-black uppercase"> ${post.shops?.name || post.shops?.[0]?.name || post.location_name} </span>`} </div> </div> ${renderComponent($$result2, "BowButton", BowButton, { "client:load": true, "postId": post.id, "initialCount": post.bow_count, "client:component-hydration": "load", "client:component-path": "/home/alvin/Dropbox/VSCode/pekopeko/src/components/BowButton.svelte", "client:component-export": "default" })} </div> </div> </div>`), (!posts || posts.length === 0) && renderTemplate`<div class="flex flex-col items-center text-center py-20 brutalist-card bg-white max-w-2xl mx-auto"> <p class="text-3xl font-black uppercase italic">目前還沒有貼文</p> <p class="mt-2 font-bold opacity-60">成為今天第一個分享的人吧！</p> <a href="/create" class="bg-white hover:bg-[--color-accent] text-[--color-text] title-outline px-6 py-2 border-4 border-[--color-border] shadow-brutalist hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_var(--color-border)] transition-all uppercase tracking-tighter text-lg flex items-center justify-center mt-8 w-fit">
立刻去發文 →
</a> </div>`, defineScriptVars({ serverToday: today })) })}`;
}, "/home/alvin/Dropbox/VSCode/pekopeko/src/pages/index.astro", void 0);

const $$file = "/home/alvin/Dropbox/VSCode/pekopeko/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
