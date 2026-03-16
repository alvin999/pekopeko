<script lang="ts">
  export let drinkType: "coffee" | "tea" = "coffee";
  export let flavors: string[] = [];
  export let mouthfeel: "low" | "medium" | "high" = "medium";
  export let size = 300;
  export let mood: string = "😊";
  export let isEmpty: boolean = false;

  // New CVA Props
  export let flavorIntensity: "low" | "medium" | "high" = "medium";
  export let acidityIntensity: "low" | "medium" | "high" = "medium";
  export let acidityType: "dry" | "sweet" = "sweet";
  export let sweetnessIntensity: "low" | "medium" | "high" = "medium";
  export let mouthfeelTypes: string[] = [];

  // Intensity multiplier
  const intensityMap = { low: 0.6, medium: 1, high: 1.4 };

  const flavorColors: Record<string, { h: number; s: number; l: number }> = {
    // ... (保持不變)
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
    papery: { h: 40, s: 10, l: 75 },
  };

  const baseColors = {
    coffee: { h: 25, s: 30, l: 30 },
    tea: { h: 90, s: 20, l: 40 },
  };

  $: liquidColor = calculateLiquidColor(
    drinkType,
    flavors,
    flavorIntensity,
    acidityType,
    mouthfeel,
  );

  function calculateLiquidColor(
    type: "coffee" | "tea",
    activeFlavors: string[],
    fIntensity: string,
    acidType: string,
    mIntensity: string,
  ) {
    const base = baseColors[type];
    const fMult = intensityMap[fIntensity as keyof typeof intensityMap] || 1;
    const mMult = intensityMap[mIntensity as keyof typeof intensityMap] || 1;

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
  $: sparkleCount =
    sweetnessIntensity === "high" ? 8 : sweetnessIntensity === "medium" ? 4 : 0;
  $: accentCount =
    acidityIntensity === "high" ? 6 : acidityIntensity === "medium" ? 3 : 0;

  // Expression logic
  const moodExpressions: Record<string, { eyes: string; mouth: string }> = {
    "🙂": {
      eyes: "M 110 160 Q 120 155 130 160 M 170 160 Q 180 155 190 160",
      mouth: "M 130 200 Q 150 215 170 200",
    },
    "😌": {
      eyes: "M 110 165 Q 125 155 140 165 M 160 165 Q 175 155 190 165",
      mouth: "M 140 205 Q 150 200 160 205",
    },
    "🤯": {
      eyes: "M 115 150 L 115 170 M 135 150 L 135 170 M 165 150 L 165 170 M 185 150 L 185 170",
      mouth: "M 120 200 Q 150 230 180 200 Z",
    },
    "🥱": {
      eyes: "M 110 160 L 135 160 M 165 160 L 190 160",
      mouth: "M 140 195 A 10 10 0 1 0 160 195 A 10 10 0 1 0 140 195",
    },
    "⚡️": {
      eyes: "M 110 150 L 130 170 M 130 150 L 110 170 M 170 150 L 190 170 M 190 150 L 170 170",
      mouth: "M 110 210 L 130 190 L 150 210 L 170 190 L 190 210",
    },
    "🌈": {
      eyes: "M 110 150 L 125 135 L 140 150 L 125 165 Z M 160 150 L 175 135 L 190 150 L 175 165 Z",
      mouth: "M 120 190 Q 150 220 180 190",
    },
  };
  $: expression = moodExpressions[mood] || moodExpressions["🙂"];

  export let noShadow: boolean = false;
  const cupPaths = {
    low: "M 80 80 Q 150 70 220 80 L 200 240 Q 150 250 100 240 Z",
    medium:
      "M 70 90 Q 150 70 230 90 Q 240 180 210 240 Q 150 260 90 240 Q 60 180 70 90 Z",
    high: "M 60 80 L 240 80 L 230 250 L 70 250 Z",
  };
  
  // 使用 reactive statement 確保路徑隨 mouthfeel 改變而更新
  $: cupPath = cupPaths[mouthfeel as keyof typeof cupPaths] || cupPaths.medium;

  // Dynamic stroke based on mouthfeel
  $: strokeWidth = mouthfeel === "high" ? 12 : mouthfeel === "medium" ? 8 : 4;
</script>

<div
  class="avatar-container relative inline-block overflow-hidden"
  style="width: {size}px; height: {size}px; {noShadow
    ? ''
    : 'filter: drop-shadow(4px 4px 0px #2D2D2D);'}"
>
  <svg
    viewBox="0 0 300 300"
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <!-- Solid Colors instead of Gradients for Brutalist -->
      <clipPath id="cupClip-{mouthfeel}">
        <path d={cupPath} />
      </clipPath>
    </defs>

    <!-- Liquid Area with Effects -->
    {#if !isEmpty}
      <g clip-path="url(#cupClip-{mouthfeel})">
        <!-- 使用 path 而非 rect 填充底色，確保基礎形狀完全吻合 -->
        <path d={cupPath} fill={liquidColor} />

        <!-- 裝飾元素區域 -->
        <g>
          <!-- Texture/Mouthfeel Particles (Subtle dots) -->
          {#if mouthfeel !== "low"}
            {#key [mouthfeel, mouthfeelTypes]}
              {#each Array(10) as _, i}
                <circle
                  cx={100 + ((i * 17) % 100)}
                  cy={120 + ((i * 23) % 100)}
                  r={mouthfeelTypes.includes("rough") ? 2 : 1}
                  fill="#2D2D2D"
                  opacity={mouthfeel === "high" ? 0.2 : 0.1}
                />
              {/each}
            {/key}
          {/if}

          <!-- Sweetness Sparkles -->
          {#each Array(sparkleCount) as _, i}
            <path
              d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z"
              fill="white"
              transform="translate({80 + ((i * 37) % 140)}, {100 +
                ((i * 53) % 120)}) scale(0.8)"
              opacity="0.6"
            />
          {/each}

          <!-- Acidity Accents -->
          {#each Array(accentCount) as _, i}
            {#if acidityType === "dry"}
              <!-- Sharp Diamond -->
              <rect
                x="0"
                y="0"
                width="4"
                height="4"
                fill="white"
                transform="translate({90 + ((i * 41) % 120)}, {110 +
                  ((i * 47) % 100)}) rotate(45)"
                opacity="0.4"
              />
            {:else}
              <!-- Soft Bubble -->
              <circle
                cx={90 + ((i * 41) % 120)}
                cy={110 + ((i * 47) % 100)}
                r="3"
                fill="white"
                opacity="0.3"
              />
            {/if}
          {/each}
        </g>
      </g>
    {/if}

    <!-- Expression Layer -->
    {#if !isEmpty}
      <g
        stroke="#2D2D2D"
        stroke-width="6"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d={expression.eyes} />
        <path d={expression.mouth} />
      </g>
    {/if}

    <!-- Handle (If high mouthfeel) -->
    {#if mouthfeel === "high"}
      <path
        d="M 240 120 Q 280 120 280 160 Q 280 200 240 200"
        fill="none"
        stroke="#2D2D2D"
        stroke-width={strokeWidth}
        stroke-linecap="round"
      />
    {/if}

    <!-- Cup Body (Brutalist Stroke) -->
    <path
      d={cupPath}
      fill="none"
      stroke="#2D2D2D"
      stroke-width={strokeWidth}
      stroke-linejoin="round"
    />

    <!-- Steam (Brutalist Style) -->
    {#if !isEmpty}
      <g opacity="0.8">
        <path
          d="M 120 60 Q 130 40 120 20"
          fill="none"
          stroke="#2D2D2D"
          stroke-width="4"
          stroke-dasharray="8 4"
        />
        <path
          d="M 150 55 Q 160 35 150 15"
          fill="none"
          stroke="#2D2D2D"
          stroke-width="4"
          stroke-dasharray="8 4"
        />
        <path
          d="M 180 60 Q 190 40 180 20"
          fill="none"
          stroke="#2D2D2D"
          stroke-width="4"
          stroke-dasharray="8 4"
        />
      </g>
    {/if}
  </svg>
</div>
