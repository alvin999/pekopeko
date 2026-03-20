import { c as createComponent } from './astro-component_CykpJgO-.mjs';
import 'piccolore';
import { z as spread_props, l as derived, p as escape_html, y as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_Cbh-_4TN.mjs';
import { s as supabase, $ as $$Layout } from './Layout_9zGyi0wn.mjs';
import { A as AvatarGenerator } from './dateUtils_wYJ5apcD.mjs';
import { B as BowButton } from './BowButton_Bo1cE67E.mjs';
import { I as ImageShareCompositor, p as postForm } from './maplibre-gl_Dz0eX4_h.mjs';
import 'clsx';
import 'maplibre-gl';

function ShareActions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			drinkName = "PekoPeko Drink",
			$$slots,
			$$events,
			...drinkProps
		} = $$props;

		const drinkData = derived(() => ({
			drinkType: drinkProps.drinkType ?? postForm.drinkType,
			flavors: drinkProps.flavors ?? postForm.flavors,
			mood: drinkProps.mood ?? postForm.mood,
			mouthfeel: drinkProps.mouthfeel ?? postForm.mouthfeel,
			mouthfeelTypes: drinkProps.mouthfeelTypes ?? postForm.mouthfeelTypes,
			flavorIntensity: drinkProps.flavorIntensity ?? postForm.flavorIntensity,
			acidityIntensity: drinkProps.acidityIntensity ?? postForm.acidityIntensity,
			acidityType: drinkProps.acidityType ?? postForm.acidityType,
			sweetnessIntensity: drinkProps.sweetnessIntensity ?? postForm.sweetnessIntensity,
			itemName: drinkProps.itemName ?? postForm.itemName,
			locationName: drinkProps.locationName ?? postForm.shopSearchName
		}));

		let showCompositor = false;

		$$renderer.push(`<div class="flex flex-col sm:flex-row gap-4 p-1"><button class="brutalist-btn bg-white hover:bg-[--color-accent] flex-1 flex items-center justify-center gap-3 group transition-all p-6! text-base!"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-12 transition-transform overflow-visible"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> <span class="font-black uppercase italic">Create Share Image</span></button> <button class="brutalist-btn-primary flex-1 flex items-center justify-center gap-3 group transition-all relative p-6! text-base!">`);

		{
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform overflow-visible"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> <span class="font-black uppercase italic">Share Post</span></button></div> `);

		ImageShareCompositor($$renderer, spread_props([
			{
				isOpen: showCompositor,
				onClose: () => showCompositor = false
			},
			drinkData()
		]));

		$$renderer.push(`<!---->`);
	});
}

function MapView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Svelte 5 Props
		let { lat, lng, name = "" } = $$props;

		$$renderer.push(`<div class="map-view-container svelte-1kx6tqu"><div class="map-canvas svelte-1kx6tqu"></div> `);

		if (name) {
			$$renderer.push('<!--[0-->');
			$$renderer.push(`<div class="location-name svelte-1kx6tqu">${escape_html(name)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const { data: post, error } = await supabase.from("posts").select(
    `
    *,
    profiles (username),
    shops (name, latitude, longitude)
  `
  ).eq("id", id).single();
  if (!post) {
    return Astro2.redirect("/404");
  }
  const drinkName = post.item_name || (post.drink_type === "coffee" ? "咖啡" : "茶");
  const drinkTitle = `${post.profiles?.username || ""}今日的${drinkName}`;
  const userLang = Astro2.request.headers.get("accept-language")?.split(",")[0] || "zh-TW";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${drinkTitle} | 杯口杯口` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-20 max-w-5xl"> <div class="brutalist-card bg-white p-8 md:p-12"> <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-start"> <div id="avatar-target" class="flex justify-center p-12 bg-[#F5F2EA] border-6 border-[--color-border] shadow-[12px_12px_0px_0px_var(--color-border)]"> ${renderComponent($$result2, "AvatarGenerator", AvatarGenerator, { "client:load": true, "drinkType": post.drink_type, "flavors": post.flavors, "mouthfeel": post.mouthfeel, "mood": post.mood, "size": 400, "client:component-hydration": "load", "client:component-path": "/home/alvin/Dropbox/VSCode/pekopeko/src/components/AvatarGenerator.svelte", "client:component-export": "default" })} </div> <div class="space-y-12"> <div> <div class="brutalist-badge badge-coffee text-sm! px-4! mb-4">
SPECIFICATIONS
</div> <h1 class="text-5xl font-black italic title-outline mb-4"> ${post.profiles?.username || ""} 今日的<br>${drinkName} </h1> <p class="font-bold opacity-60 uppercase tracking-widest text-xs border-b-2 border-[--color-border] pb-4">
TIMESTAMP: ${renderComponent($$result2, "time-formatter", "time-formatter", { "data-time": post.created_at, "data-format": "full" }, { "default": () => renderTemplate` ${new Intl.DateTimeFormat(userLang, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(post.created_at))} ` })} </p> </div> <!-- Sensory Profile --> <div class="space-y-8"> <!-- Flavors --> <div class="space-y-4"> <p class="font-black text-xs uppercase tracking-tighter opacity-40">
Flavor Profile
</p> <div class="flex flex-wrap gap-3"> ${post.flavors.map((f) => renderTemplate`<span class="brutalist-badge badge-white text-sm! px-4!"> ${f} </span>`)} <span class="brutalist-badge bg-accent text-white! text-[10px]! px-3! uppercase">${post.flavor_intensity} Intensity</span> </div> </div> <!-- CVA Details Grid --> <div class="grid grid-cols-2 gap-8 py-6 border-y-4 border-[--color-border] border-dashed"> <div class="space-y-2"> <p class="font-black text-[10px] uppercase tracking-tighter opacity-40">
Main Taste
</p> <div class="flex flex-wrap gap-2"> ${post.main_tastes && post.main_tastes.length > 0 ? post.main_tastes.map((t) => renderTemplate`<span class="bg-black text-white text-[10px] px-2 py-0.5 font-bold uppercase"> ${t} </span>`) : renderTemplate`<span class="text-xs font-bold opacity-30 italic">
NONE
</span>`} </div> </div> <div class="space-y-2"> <p class="font-black text-[10px] uppercase tracking-tighter opacity-40">Acidity</p> <div class="space-y-2"> <span class="text-lg font-black uppercase underline decoration-4 decoration-accent underline-offset-4">${post.acidity_intensity || "-"}</span> <div class="flex flex-wrap gap-1"> <span class="border-2 border-[--color-border] text-[9px] px-1.5 py-0.5 font-bold uppercase"> ${post.acidity_type} </span> </div> </div> </div> <div class="space-y-2"> <p class="font-black text-[10px] uppercase tracking-tighter opacity-40">
Sweetness
</p> <div class="flex items-baseline gap-2"> <span class="text-lg font-black uppercase">${post.sweetness_intensity || "-"}</span> </div> </div> <div class="space-y-2"> <p class="font-black text-[10px] uppercase tracking-tighter opacity-40">
Mouthfeel
</p> <div class="space-y-2"> <span class="text-lg font-black uppercase underline decoration-4 decoration-accent underline-offset-4">${post.mouthfeel || "-"}</span> <div class="flex flex-wrap gap-1"> ${post.mouthfeel_types && post.mouthfeel_types.map((t) => renderTemplate`<span class="border-2 border-[--color-border] text-[9px] px-1.5 py-0.5 font-bold uppercase"> ${t} </span>`)} </div> </div> </div> </div> </div> <div class="brutalist-card bg-[--color-accent] p-8 flex items-center justify-between shadow-[--brutalist-shadow-sm]"> <div class="text-7xl">${post.mood}</div> <div class="text-right space-y-4 w-full"> <div class="text-xs font-black uppercase tracking-[0.2em] opacity-70">Accumulated Bows</div> <div class="flex justify-end w-full"> ${renderComponent($$result2, "BowButton", BowButton, { "client:load": true, "postId": post.id, "initialCount": post.bow_count, "variant": "large", "client:component-hydration": "load", "client:component-path": "/home/alvin/Dropbox/VSCode/pekopeko/src/components/BowButton.svelte", "client:component-export": "default" })} </div> </div> </div> ${(post.shops?.latitude && post.shops?.longitude || post.location_name) && renderTemplate`<div class="space-y-4"> <div class="flex justify-between items-center"> <p class="font-black text-xs uppercase tracking-tighter opacity-40">Location</p> <!-- Claiming functionality hidden for now -->  </div> ${post.shops?.latitude && post.shops?.longitude ? renderTemplate`${renderComponent($$result2, "MapView", MapView, { "client:load": true, "lat": post.shops.latitude, "lng": post.shops.longitude, "name": post.shops.name || post.location_name, "client:component-hydration": "load", "client:component-path": "/home/alvin/Dropbox/VSCode/pekopeko/src/components/map/MapView.svelte", "client:component-export": "default" })}` : renderTemplate`<div class="brutalist-card bg-white p-4 font-bold text-sm">
📍 ${post.location_name} </div>`} </div>`} <div class="pt-8 border-t-4 border-[--color-border] flex flex-col sm:flex-row gap-6"> <div class="flex-1"> ${renderComponent($$result2, "ShareActions", ShareActions, { "client:load": true, "drinkName": drinkTitle, "drinkType": post.drink_type, "flavors": post.flavors, "mood": post.mood, "mouthfeel": post.mouthfeel, "mouthfeelTypes": post.mouthfeel_types, "flavorIntensity": post.flavor_intensity, "acidityIntensity": post.acidity_intensity, "acidityType": post.acidity_type, "sweetnessIntensity": post.sweetness_intensity, "itemName": post.item_name, "locationName": post.shops?.name || post.location_name, "client:component-hydration": "load", "client:component-path": "/home/alvin/Dropbox/VSCode/pekopeko/src/components/ShareActions.svelte", "client:component-export": "default" })} </div> </div> </div> </div> </div> </div> ` })}`;
}, "/home/alvin/Dropbox/VSCode/pekopeko/src/pages/post/[id].astro", void 0);

const $$file = "/home/alvin/Dropbox/VSCode/pekopeko/src/pages/post/[id].astro";
const $$url = "/post/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
