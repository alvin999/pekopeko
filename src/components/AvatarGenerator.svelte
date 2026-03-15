<script lang="ts">
  export let drinkType: 'coffee' | 'tea' = 'coffee';
  export let flavors: string[] = [];
  export let body: 'light' | 'round' | 'heavy' = 'round';
  export let size = 300;
  export let mood: string = '😊';

  // Color Mapping for Flavors (HSL based for better blending)
  // Color Mapping for Flavors (HSL based for better blending)
  const flavorColors: Record<string, { h: number, s: number, l: number }> = {
    floral: { h: 330, s: 70, l: 70 },    // Pinkish
    white_flower: { h: 60, s: 30, l: 95 }, // Creamy white
    red_flower: { h: 350, s: 80, l: 50 },  // Vibrant red
    ginger_flower: { h: 40, s: 60, l: 90 }, // Pale yellow/white
    jasmine: { h: 80, s: 40, l: 90 },      // Light Greenish white
    
    citrus: { h: 45, s: 90, l: 60 },     // Yellowish
    lemon: { h: 60, s: 100, l: 50 },     // Bright Yellow
    orange: { h: 30, s: 100, l: 50 },    // Orange
    grapefruit: { h: 0, s: 70, l: 60 },  // Pinkish Red
    
    berry: { h: 0, s: 80, l: 50 },       // Reddish
    strawberry: { h: 350, s: 90, l: 50 },
    blueberry: { h: 240, s: 60, l: 40 },
    raspberry: { h: 330, s: 90, l: 45 },
    
    nutty: { h: 30, s: 50, l: 40 },      // Brownish
    almond: { h: 30, s: 40, l: 70 },
    hazelnut: { h: 25, s: 50, l: 35 },
    walnut: { h: 20, s: 40, l: 30 },

    honey: { h: 40, s: 95, l: 50 },      // Golden
    chocolate: { h: 20, s: 60, l: 25 }   // Dark Brown
  };

  // Hierarchy mapping for color fallback
  const flavorParents: Record<string, string> = {
    white_flower: "floral",
    red_flower: "floral",
    ginger_flower: "white_flower",
    jasmine: "white_flower",
    lemon: "citrus",
    orange: "citrus",
    grapefruit: "citrus",
    strawberry: "berry",
    blueberry: "berry",
    raspberry: "berry",
    almond: "nutty",
    hazelnut: "nutty",
    walnut: "nutty"
  };

  // Base colors for Coffee and Tea (Morandi depth)
  const baseColors = {
    coffee: { h: 25, s: 30, l: 30 },
    tea: { h: 90, s: 20, l: 40 }
  };

  $: liquidColor = calculateLiquidColor(drinkType, flavors);
  
  function getFlavorColor(flavor: string): { h: number, s: number, l: number } | null {
    const f = flavor.toLowerCase();
    if (flavorColors[f]) return flavorColors[f];
    
    const parent = flavorParents[f];
    if (parent) return getFlavorColor(parent);
    
    return null;
  }

  function calculateLiquidColor(type: 'coffee' | 'tea', activeFlavors: string[]) {
    const base = baseColors[type];
    if (activeFlavors.length === 0) return `hsl(${base.h}, ${base.s}%, ${base.l}%)`;

    let totalH = base.h;
    let totalS = base.s;
    let totalL = base.l;

    activeFlavors.forEach(f => {
      const fc = getFlavorColor(f);
      if (fc) {
        totalH = (totalH + fc.h) / 2;
        totalS = (totalS + fc.s) / 2;
        totalL = (totalL + fc.l) / 2;
      }
    });

    return `hsl(${totalH}, ${totalS}%, ${totalL}%)`;
  }

  // Mood Expressions (Brutalist Style - Bold lines, simple shapes)
  const moodExpressions: Record<string, { eyes: string, mouth: string }> = {
    '🙂': { // Simple Smile
      eyes: "M 110 160 Q 120 155 130 160 M 170 160 Q 180 155 190 160",
      mouth: "M 130 200 Q 150 215 170 200"
    },
    '😌': { // Relieved / Peaceful
      eyes: "M 110 165 Q 125 155 140 165 M 160 165 Q 175 155 190 165",
      mouth: "M 140 205 Q 150 200 160 205"
    },
    '🤯': { // Mind Blown
      eyes: "M 115 150 L 115 170 M 135 150 L 135 170 M 165 150 L 165 170 M 185 150 L 185 170",
      mouth: "M 120 200 Q 150 230 180 200 Z"
    },
    '🥱': { // Yawning / Bored
      eyes: "M 110 160 L 135 160 M 165 160 L 190 160",
      mouth: "M 140 195 A 10 10 0 1 0 160 195 A 10 10 0 1 0 140 195" // Circle O
    },
    '⚡️': { // High Energy
      eyes: "M 110 150 L 130 170 M 130 150 L 110 170 M 170 150 L 190 170 M 190 150 L 170 170",
      mouth: "M 110 210 L 130 190 L 150 210 L 170 190 L 190 210" // Zigzag
    },
    '🌈': { // Joyful / Magic
      eyes: "M 110 150 L 125 135 L 140 150 L 125 165 Z M 160 150 L 175 135 L 190 150 L 175 165 Z", // Star eyes
      mouth: "M 120 190 Q 150 220 180 190"
    }
  };

  $: expression = moodExpressions[mood] || moodExpressions['😊'];

  // Cup Paths based on body
  const cupPaths = {
    light: "M 80 80 Q 150 70 220 80 L 200 240 Q 150 250 100 240 Z", // Tall & Slender
    round: "M 70 90 Q 150 70 230 90 Q 240 180 210 240 Q 150 260 90 240 Q 60 180 70 90 Z", // Round Bowl
    heavy: "M 60 80 L 240 80 L 230 250 L 70 250 Z" // Solid Mug
  };

  $: cupPath = cupPaths[body];
</script>

<div class="avatar-container relative inline-block overflow-hidden" style="width: {size}px; height: {size}px;">
  <svg viewBox="0 0 300 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Solid Colors instead of Gradients for Brutalist -->
      <mask id="waveMask">
        <path d={cupPath} fill="white" />
      </mask>
    </defs>

    <!-- Liquid Area -->
    <g mask="url(#waveMask)">
      <rect x="0" y="0" width="300" height="300" fill={liquidColor} />
      
      <!-- Top Ripple Ripple -->
      <path d="M 0 120 Q 75 110 150 120 T 300 120 V 0 H 0 Z" fill="#DED6C1" opacity="0.3" />
    </g>

    <!-- Cup Body (Brutalist Stroke) -->
    <path d={cupPath} fill="none" stroke="#2D2D2D" stroke-width="8" stroke-linejoin="round" />

    <!-- Expression Layer -->
    <g stroke="#2D2D2D" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d={expression.eyes} />
      <path d={expression.mouth} />
    </g>

    <!-- Handle (If heavy body) -->
    {#if body === 'heavy'}
      <path d="M 240 120 Q 280 120 280 160 Q 280 200 240 200" fill="none" stroke="#2D2D2D" stroke-width="8" stroke-linecap="round" />
    {/if}

    <!-- Steam (Brutalist Style) -->
    <g opacity="0.8">
      <path d="M 120 60 Q 130 40 120 20" fill="none" stroke="#2D2D2D" stroke-width="4" stroke-dasharray="8 4" />
      <path d="M 150 55 Q 160 35 150 15" fill="none" stroke="#2D2D2D" stroke-width="4" stroke-dasharray="8 4" />
      <path d="M 180 60 Q 190 40 180 20" fill="none" stroke="#2D2D2D" stroke-width="4" stroke-dasharray="8 4" />
    </g>
  </svg>
</div>

<style>
  .avatar-container {
    filter: drop-shadow(4px 4px 0px #2D2D2D);
  }
</style>
