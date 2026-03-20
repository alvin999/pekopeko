import { c as createComponent } from './astro-component_CykpJgO-.mjs';
import 'piccolore';
import { y as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_Cbh-_4TN.mjs';
import { $ as $$Layout } from './Layout_9zGyi0wn.mjs';

const $$Privacy = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "隱私權政策 | 杯口杯口 PekoPeko" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-20 max-w-4xl"> <div class="brutalist-card bg-white p-8 md:p-12"> <h1 class="text-4xl md:text-6xl font-black uppercase tracking-tighter italic title-outline mb-10">
隱私權政策
</h1> <div class="prose prose-lg max-w-none space-y-8 font-bold text-[--color-text]"> <section> <h2 class="text-2xl font-black border-b-4 border-[--color-border] pb-2 mb-4 uppercase">1. 我們收集的資料</h2> <p>當您使用「杯口杯口 PekoPeko」時，我們可能會收集以下資料：</p> <ul class="list-disc list-inside space-y-2"> <li><span class="bg-[--color-accent] px-1">帳戶資訊：</span>如果您使用 Google 登入，我們會收集您的 Email、名稱與大頭貼。</li> <li><span class="bg-[--color-accent] px-1">貼文內容：</span>您分享的飲品名稱、心情、口味、地點以及生成的 Peko 角色。</li> <li><span class="bg-[--color-accent] px-1">技術資料：</span>為了確保每日重設功能正常，我們會使用 Cookie 紀錄您當地的日期。</li> </ul> </section> <section> <h2 class="text-2xl font-black border-b-4 border-[--color-border] pb-2 mb-4 uppercase">2. 資料的使用方式</h2> <p>我們收集資料的主要目的在於：</p> <ul class="list-disc list-inside space-y-2"> <li>提供與維護我們的服務。</li> <li>讓您能與社群分享飲品心得。</li> <li>改善使用者體驗並優化 Peko 生成演算法。</li> </ul> </section> <section> <h2 class="text-2xl font-black border-b-4 border-[--color-border] pb-2 mb-4 uppercase">3. 資料的儲存與安全</h2> <p>我們使用 <span class="underline decoration-4 decoration-[--color-accent]">Supabase</span> 作為雲端資料庫。您的資料將受到工業標準的安全保護。只要您的帳戶存在，我們就會保留您的貼文資料，除非您主動要求刪除。</p> </section> <section> <h2 class="text-2xl font-black border-b-4 border-[--color-border] pb-2 mb-4 uppercase">4. 您的權利</h2> <p>您隨時擁有以下權利：</p> <ul class="list-disc list-inside space-y-2"> <li>存取與更新您的個人檔案內容。</li> <li>要求刪除您的帳戶及所有相關貼文。</li> <li>拒絕提供非必要的資料收集（這可能會影響部分功能使用）。</li> </ul> </section> <section> <h2 class="text-2xl font-black border-b-4 border-[--color-border] pb-2 mb-4 uppercase">5. 條款更新</h2> <p>我們可能會不定期更新本隱私權政策。建議您定期查看以瞭解最新內容。繼續使用本服務即代表您同意更新後的條款。</p> </section> <div class="mt-12 pt-8 border-t-4 border-[--color-border] opacity-60 italic">
最後更新日期：2026-03-20
</div> </div> <div class="mt-12"> <a href="/" class="bg-white hover:bg-[--color-accent] text-[--color-text] title-outline px-6 py-2 border-4 border-[--color-border] shadow-brutalist hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_var(--color-border)] transition-all uppercase tracking-tighter text-lg inline-block">
← 回到首頁
</a> </div> </div> </div> ` })}`;
}, "/home/alvin/Dropbox/VSCode/pekopeko/src/pages/privacy.astro", void 0);

const $$file = "/home/alvin/Dropbox/VSCode/pekopeko/src/pages/privacy.astro";
const $$url = "/privacy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Privacy,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
