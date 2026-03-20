import { H as fallback, n as attr_class, o as stringify, v as ensure_array_like, q as attr_style, x as attr, p as escape_html, w as bind_props } from './entrypoint_Cbh-_4TN.mjs';
import './Layout_9zGyi0wn.mjs';

function BowButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let postId = $$props['postId'];
		let initialCount = fallback($$props['initialCount'], 0);
		let variant = fallback($$props['variant'], "standard");
		let count = initialCount;
		let isLoading = false;
		let particles = [];

		$$renderer.push(`<div${attr_class(`bow-container ${stringify(variant === 'large' ? 'w-full' : '')}`, 'svelte-ps712s')}><!--[-->`);

		const each_array = ensure_array_like(particles);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let p = each_array[$$index];

			$$renderer.push(`<span class="peko-particle font-black italic uppercase svelte-ps712s"${attr_style(`--tx: ${stringify(p.x)}px; --ty: ${stringify(p.y)}px; --tr: ${stringify(p.rotate)}deg; --ts: ${stringify(p.scale)};`)}>Peko!</span>`);
		}

		$$renderer.push(`<!--]--> <button${attr('disabled', isLoading, true)}${attr_class(
			`group transition-all ${stringify(variant === 'large'
				? 'w-full text-right p-0 border-none bg-transparent hover:scale-105 active:scale-95'
				: 'brutalist-btn-accent min-w-[100px] gap-2 px-4!')} ${stringify('')}`,
			'svelte-ps712s'
		)}>`);

		if (variant === 'standard') {
			$$renderer.push('<!--[0-->');
			$$renderer.push(`<span${attr_class(`text-xl inline-block transition-transform duration-300 ${stringify('group-hover:-rotate-12')}`, 'svelte-ps712s')}>🙇</span> <span class="font-black text-sm svelte-ps712s">${escape_html(count)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');

			$$renderer.push(`<div class="flex items-center justify-end gap-4 svelte-ps712s"><span${attr_class(
				`text-4xl sm:text-5xl inline-block transition-transform duration-300 ${stringify('group-hover:-rotate-12 scale-100')}`,
				'svelte-ps712s'
			)}>🙇</span> <span${attr_class(
				`font-black text-7xl sm:text-8xl italic block transition-all ${stringify('')}`,
				'svelte-ps712s'
			)}>${escape_html(count)}</span></div>`);
		}

		$$renderer.push(`<!--]--></button></div>`);
		bind_props($$props, { postId, initialCount, variant });
	});
}

export { BowButton as B };
