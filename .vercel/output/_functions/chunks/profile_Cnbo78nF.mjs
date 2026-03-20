import { c as createComponent } from './astro-component_CykpJgO-.mjs';
import 'piccolore';
import { y as renderComponent, r as renderTemplate } from './entrypoint_Cbh-_4TN.mjs';
import { $ as $$Layout } from './Layout_9zGyi0wn.mjs';

const $$Profile = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "個人檔案 | 杯口杯口" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ProfileView", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "/home/alvin/Dropbox/VSCode/pekopeko/src/components/ProfileView.svelte", "client:component-export": "default" })} ` })}`;
}, "/home/alvin/Dropbox/VSCode/pekopeko/src/pages/profile.astro", void 0);

const $$file = "/home/alvin/Dropbox/VSCode/pekopeko/src/pages/profile.astro";
const $$url = "/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Profile,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
