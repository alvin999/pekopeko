import { H as fallback, q as attr_style, x as attr, o as stringify, v as ensure_array_like, w as bind_props } from './entrypoint_Cbh-_4TN.mjs';

function AvatarGenerator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let // New CVA Props
			// Intensity multiplier
			// ... (保持不變)
			liquidColor,
			// Mouthfeel affects Lightness
			// Acidity hue shift
			// Generate Sparkles (Sweetness) and Acidity Accents
			// Calculate flavor-based gradient colors
			liquidColors,
			// Adjust flavor color based on intensity and mouthfeel
			// Expression logic
			expression,
			// 使用 reactive statement 確保路徑隨 mouthfeel 改變而更新
			cupPath,
			// Dynamic stroke based on mouthfeel
			strokeWidth;

		let drinkType = fallback($$props['drinkType'], "coffee");
		let flavors = fallback($$props['flavors'], () => [], true);
		let mouthfeel = fallback($$props['mouthfeel'], "medium");
		let size = fallback($$props['size'], 300);
		let mood = fallback($$props['mood'], "😊");
		let isEmpty = fallback($$props['isEmpty'], false);
		let flavorIntensity = fallback($$props['flavorIntensity'], "medium");
		let acidityIntensity = fallback($$props['acidityIntensity'], "medium");
		let acidityType = fallback($$props['acidityType'], "sweet");
		let sweetnessIntensity = fallback($$props['sweetnessIntensity'], "medium");
		let mouthfeelTypes = fallback($$props['mouthfeelTypes'], () => [], true);
		const intensityMap = { low: 0.6, medium: 1, high: 1.4 };

		const flavorColors = {
			floral: { h: 330, s: 70, l: 70 },
			fruity: { h: 10, s: 80, l: 60 },
			berry: { h: 0, s: 80, l: 50 },
			dried_fruit: { h: 15, s: 60, l: 40 },
			citrus_fruit: { h: 45, s: 90, l: 60 },
			sour_fermented: { h: 80, s: 50, l: 50 },
			sour: { h: 70, s: 60, l: 60 },
			fermented: { h: 90, s: 40, l: 40 },
			green_vegetative: { h: 120, s: 40, l: 40 },
			roasted: { h: 30, s: 60, l: 30 },
			nutty_cocoa: { h: 25, s: 50, l: 35 },
			nutty: { h: 30, s: 50, l: 40 },
			cocoa: { h: 20, s: 60, l: 25 },
			spicy: { h: 15, s: 70, l: 45 },
			sweet: { h: 45, s: 90, l: 60 },
			vanilla: { h: 50, s: 40, l: 85 },
			brown_sugar: { h: 25, s: 70, l: 40 },
			other: { h: 200, s: 20, l: 50 },
			chemical: { h: 280, s: 30, l: 60 },
			musty_earthy: { h: 40, s: 30, l: 30 },
			papery: { h: 40, s: 10, l: 75 }
		};

		const baseColors = {
			coffee: { h: 25, s: 30, l: 30 },
			tea: { h: 90, s: 20, l: 40 }
		};

		function calculateLiquidColor(type, activeFlavors, fIntensity, acidType, mIntensity) {
			const base = baseColors[type];
			const fMult = intensityMap[fIntensity] || 1;
			const mMult = intensityMap[mIntensity] || 1;
			let h = base.h;
			let s = base.s * fMult;
			let l = base.l / (mMult > 1 ? 1.2 : mMult < 1 ? 0.8 : 1); // Mouthfeel affects Lightness

			if (activeFlavors.length > 0) {
				activeFlavors.forEach((f) => {
					const fc = flavorColors[f.toLowerCase()];

					if (fc) {
						h = (h + fc.h) / 2;
						s = (s + fc.s * fMult) / 2;
						l = (l + fc.l) / 2;
					}
				});
			}

			// Acidity hue shift
			if (acidType === "dry") h -= 5;

			if (acidType === "sweet") h += 5;

			return `hsl(${h}, ${Math.min(100, s)}%, ${Math.min(100, l)}%)`;
		}

		// Generate Sparkles (Sweetness) and Acidity Accents
		// Calculate flavor-based gradient colors
		// Adjust flavor color based on intensity and mouthfeel
		// Expression logic
		const moodExpressions = {
			"🙂": {
				eyes: "M 110 160 Q 120 155 130 160 M 170 160 Q 180 155 190 160",
				mouth: "M 130 200 Q 150 215 170 200"
			},
			"😌": {
				eyes: "M 110 155 Q 125 165 140 155 M 160 155 Q 175 165 190 155",
				mouth: "M 140 200 Q 150 210 160 200"
			},
			"🤯": {
				eyes: "M 105 160 A 15 15 0 1 0 135 160 A 15 15 0 1 0 105 160 M 118 160 A 2 2 0 1 0 122 160 A 2 2 0 1 0 118 160 M 165 160 A 15 15 0 1 0 195 160 A 15 15 0 1 0 165 160 M 178 160 A 2 2 0 1 0 182 160 A 2 2 0 1 0 178 160",
				mouth: "M 135 210 A 15 15 0 1 0 165 210 A 15 15 0 1 0 135 210"
			},
			"🥱": {
				eyes: "M 110 160 L 135 160 M 165 160 L 190 160",
				mouth: "M 140 195 A 10 10 0 1 0 160 195 A 10 10 0 1 0 140 195"
			},
			"⚡️": {
				eyes: "M 140 125 L 115 142.5 L 140 142.5 L 115 160 M 190 125 L 165 142.5 L 190 142.5 L 165 160",
				mouth: "M 110 190 L 130 210 L 150 190 L 170 210 L 190 190"
			},
			"🌈": {
				eyes: "M 110 150 L 125 135 L 140 150 L 125 165 Z M 160 150 L 175 135 L 190 150 L 175 165 Z",
				mouth: "M 120 190 Q 150 220 180 190"
			}
		};

		let noShadow = fallback($$props['noShadow'], false);

		const cupPaths = {
			low: "M 80 80 Q 150 70 220 80 L 200 240 Q 150 250 100 240 Z",
			medium: "M 70 90 Q 150 70 230 90 Q 240 180 210 240 Q 150 260 90 240 Q 60 180 70 90 Z",
			high: "M 60 80 L 240 80 L 230 250 L 70 250 Z"
		};

		liquidColor = calculateLiquidColor(drinkType, flavors, flavorIntensity, acidityType, mouthfeel);

		liquidColors = flavors.length > 0
			? flavors.slice(0, 5).map((f) => {
				const fc = flavorColors[f.toLowerCase()];

				if (!fc) return liquidColor;

				// Adjust flavor color based on intensity and mouthfeel
				const fMult = intensityMap[flavorIntensity] || 1;

				const mMult = intensityMap[mouthfeel] || 1;
				const h = fc.h;
				const s = fc.s * fMult;
				const l = fc.l / (mMult > 1 ? 1.2 : mMult < 1 ? 0.8 : 1);

				return `hsl(${h}, ${Math.min(100, s)}%, ${Math.min(100, l)}%)`;
			})
			: [liquidColor];

		// Expression logic
		expression = moodExpressions[mood] || moodExpressions["🙂"];

		// 使用 reactive statement 確保路徑隨 mouthfeel 改變而更新
		cupPath = cupPaths[mouthfeel] || cupPaths.medium;

		// Dynamic stroke based on mouthfeel
		strokeWidth = mouthfeel === "high" ? 12 : mouthfeel === "medium" ? 8 : 4;

		$$renderer.push(`<div class="avatar-container relative inline-block overflow-hidden"${attr_style(`width: ${stringify(size)}px; height: ${stringify(size)}px; ${stringify(noShadow ? '' : 'filter: drop-shadow(4px 4px 0px #2D2D2D);')}`)}><svg viewBox="0 0 300 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><clipPath${attr('id', `cupClip-${stringify(mouthfeel)}`)}><path${attr('d', cupPath)}></path></clipPath><linearGradient${attr('id', `flavorGradient-${stringify(mouthfeel)}-${stringify(flavors.join('-'))}`)} x1="0%" y1="0%" x2="0%" y2="100%"><!--[-->`);

		const each_array = ensure_array_like(liquidColors);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let color = each_array[i];

			$$renderer.push(`<stop${attr('offset', `${stringify(i / (liquidColors.length - 1 || 1) * 100)}%`)}${attr('stop-color', color)}></stop>`);
		}

		$$renderer.push(`<!--]--></linearGradient></defs>`);

		if (!isEmpty) {
			$$renderer.push('<!--[0-->');
			$$renderer.push(`<g${attr('clip-path', `url(#cupClip-${stringify(mouthfeel)})`)}><path${attr('d', cupPath)}${attr('fill', `url(#flavorGradient-${stringify(mouthfeel)}-${stringify(flavors.join('-'))})`)}></path><g>`);

			if (mouthfeel !== "low") {
				$$renderer.push('<!--[0-->');
				$$renderer.push(`<!---->`);

				{
					$$renderer.push(`<!--[-->`);

					const each_array_1 = ensure_array_like(Array(10));

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						each_array_1[i];

						$$renderer.push(`<circle${attr('cx', 100 + i * 17 % 100)}${attr('cy', 120 + i * 23 % 100)}${attr('r', mouthfeelTypes.includes("rough") ? 2 : 1)} fill="#2D2D2D"${attr('opacity', mouthfeel === "high" ? 0.2 : 0.1)}></circle>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></g></g>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if (!isEmpty) {
			$$renderer.push('<!--[0-->');
			$$renderer.push(`<g stroke="#2D2D2D" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"><path${attr('d', expression.eyes)}></path><path${attr('d', expression.mouth)}></path></g>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if (mouthfeel === "high") {
			$$renderer.push('<!--[0-->');
			$$renderer.push(`<path d="M 240 120 Q 280 120 280 160 Q 280 200 240 200" fill="none" stroke="#2D2D2D"${attr('stroke-width', strokeWidth)} stroke-linecap="round"></path>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--><path${attr('d', cupPath)} fill="none" stroke="#2D2D2D"${attr('stroke-width', strokeWidth)} stroke-linejoin="round"></path>`);

		if (!isEmpty) {
			$$renderer.push('<!--[0-->');
			$$renderer.push(`<g opacity="0.8"><path d="M 120 60 Q 130 40 120 20" fill="none" stroke="#2D2D2D" stroke-width="4" stroke-dasharray="8 4"></path><path d="M 150 55 Q 160 35 150 15" fill="none" stroke="#2D2D2D" stroke-width="4" stroke-dasharray="8 4"></path><path d="M 180 60 Q 190 40 180 20" fill="none" stroke="#2D2D2D" stroke-width="4" stroke-dasharray="8 4"></path></g>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></svg></div>`);

		bind_props($$props, {
			drinkType,
			flavors,
			mouthfeel,
			size,
			mood,
			isEmpty,
			flavorIntensity,
			acidityIntensity,
			acidityType,
			sweetnessIntensity,
			mouthfeelTypes,
			noShadow
		});
	});
}

function getLocalDateString(date = /* @__PURE__ */ new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function isValidPostDate(postDate, serverDate = getLocalDateString()) {
  const post = new Date(postDate).getTime();
  const server = new Date(serverDate).getTime();
  const ONE_DAY_MS = 24 * 60 * 60 * 1e3;
  return Math.abs(post - server) <= ONE_DAY_MS;
}

export { AvatarGenerator as A, getLocalDateString as g, isValidPostDate as i };
