import { c as createComponent } from './astro-component_CykpJgO-.mjs';
import 'piccolore';
import { J as createRenderInstruction, K as ssr_context, h as addAttribute, O as renderHead, y as renderComponent, P as renderSlot, r as renderTemplate } from './entrypoint_Cbh-_4TN.mjs';
import 'clsx';
import { createClient } from '@supabase/supabase-js';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

/** @import { SSRContext } from '#server' */
/** @import { Renderer } from './internal/server/renderer.js' */

/** @param {() => void} fn */
function onDestroy(fn) {
	/** @type {Renderer} */ (/** @type {SSRContext} */ (ssr_context).r).on_destroy(fn);
}

const supabaseUrl = "https://htrfykhubnnoucpyrvyt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cmZ5a2h1Ym5ub3VjcHlydnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NzcxODksImV4cCI6MjA4OTE1MzE4OX0.2ittY13AwqSY4z4TWxCtco8mFKuArLst52WPGW2NdKQ";
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

function UserMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {

		onDestroy(() => {
		});

		$$renderer.push(`<div class="flex items-center gap-2 md:gap-4 flex-wrap justify-end"><a href="/create" class="bg-white hover:bg-[--color-accent] text-[--color-text] title-outline px-2! py-1! md:px-6! md:py-2! border-2! md:border-4! border-[--color-border] shadow-brutalist-sm md:shadow-brutalist hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutalist md:hover:shadow-[8px_8px_0px_0px_var(--color-border)] transition-all uppercase tracking-tighter text-xs! md:text-lg! flex items-center justify-center whitespace-nowrap">+ 新增品飲</a> `);

		{
			$$renderer.push('<!--[-1-->');
			$$renderer.push(`<button class="bg-white hover:bg-[--color-accent] text-[--color-text] title-outline px-2! py-1! md:px-6! md:py-2! border-2! md:border-4! border-[--color-border] shadow-brutalist-sm md:shadow-brutalist hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutalist md:hover:shadow-[8px_8px_0px_0px_var(--color-border)] transition-all uppercase tracking-tighter text-xs! md:text-lg! flex items-center justify-center whitespace-nowrap">使用 <span class="google-text-gradient mx-1">GOOGLE</span> 登入</button>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}

const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const isDev = false;
  const { title = "杯口杯口 PekoPeko" } = Astro2.props;
  return renderTemplate`<html lang="zh-Hant"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lexend:wght@800&display=swap" rel="stylesheet">${renderHead()}</head> <body class="min-h-screen flex flex-col pt-24"> <nav class="fixed top-4 left-4 right-4 z-50 px-4 md:px-8 bg-white border-4 border-[--color-border] shadow-[--brutalist-shadow-sm] min-h-16 flex items-center flex-wrap gap-y-2 py-2"> <div class="flex-1"> <a href="/" class="text-xl md:text-2xl font-black tracking-tighter uppercase italic title-outline">杯口杯口 PekoPeko</a> </div> <div class="flex-none" id="auth-nav"> ${renderComponent($$result, "UserMenu", UserMenu, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/alvin/Dropbox/VSCode/pekopeko/src/components/UserMenu.svelte", "client:component-export": "default" })} </div> </nav> ${renderScript($$result, "/home/alvin/Dropbox/VSCode/pekopeko/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")} <main class="flex-1"> ${renderSlot($$result, $$slots["default"])} </main> <footer class="footer footer-center p-10 bg-white border-t-4 border-[--color-border] text-[--color-text] mt-20"> <nav class="flex flex-col gap-6 items-center"> <div class="flex flex-wrap justify-center gap-8 font-black uppercase tracking-tighter text-sm italic"> <a href="/privacy" class="hover:underline decoration-4 decoration-[--color-accent] underline-offset-4">隱私權政策 Privacy</a> <a href="/terms" class="hover:underline decoration-4 decoration-[--color-accent] underline-offset-4">服務條款 Terms</a> </div> <div class="grid grid-flow-col gap-4"> <p class="font-bold uppercase tracking-widest text-sm opacity-50">
© 2026 杯口杯口 PekoPeko
</p> </div> </nav> </footer> ${isDev} </body></html>`;
}, "/home/alvin/Dropbox/VSCode/pekopeko/src/layouts/Layout.astro", void 0);

export { $$Layout as $, supabase as s };
