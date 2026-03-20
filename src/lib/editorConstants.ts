export const flavorOptions = [
  { name: "floral", label: "花香 Floral" },
  {
    name: "fruity",
    label: "果香 Fruity",
    children: [
      { name: "berry", label: "莓果 Berry" },
      { name: "dried_fruit", label: "乾果 Dried Fruit" },
      { name: "citrus_fruit", label: "柑橘 Citrus Fruit" },
    ],
  },
  {
    name: "sour_fermented",
    label: "酸/發酵 Sour/Fermented",
    children: [
      { name: "sour", label: "酸味 Sour" },
      { name: "fermented", label: "發酵 Fermented" },
    ],
  },
  { name: "green_vegetative", label: "草本/植物 Green/Vegetative" },
  {
    name: "other",
    label: "其他 Other",
    children: [
      { name: "chemical", label: "化學 Chemical" },
      { name: "musty_earthy", label: "霉味/大地 Musty/Earthy" },
      { name: "papery", label: "紙味 Papery" },
    ],
  },
  { name: "roasted", label: "烘焙 Roasted" },
  {
    name: "nutty_cocoa",
    label: "堅果/可可 Nutty/Cocoa",
    children: [
      { name: "nutty", label: "堅果 Nutty" },
      { name: "cocoa", label: "可可 Cocoa" },
    ],
  },
  { name: "spicy", label: "香料 Spicy" },
  {
    name: "sweet",
    label: "甜感 Sweet",
    children: [
      { name: "vanilla", label: "香草 Vanilla" },
      { name: "brown_sugar", label: "紅糖 Brown Sugar" },
    ],
  },
];

export const originData = {
  coffee: [
    {
      name: "Africa 非洲",
      label: "Africa 非洲",
      children: [
        "衣索比亞", "肯亞", "盧安達", "布隆地", "坦尚尼亞", "烏干達", 
        "剛果民主", "象牙海岸", "喀麥隆", "馬拉威", "贊比亞", "辛巴威"
      ].map(n => ({ name: n, label: n })),
    },
    {
      name: "Americas 美洲",
      label: "Americas 美洲",
      children: [
        "巴西", "哥倫比亞", "墨西哥", "瓜地馬拉", "宏都拉斯", "薩爾瓦多", 
        "尼加拉瓜", "哥斯大黎加", "巴拿馬", "秘魯", "厄瓜多", "玻利維亞", 
        "牙買加", "多明尼加"
      ].map(n => ({ name: n, label: n })),
    },
    {
      name: "Asia/Pacific 亞太",
      label: "Asia/Pacific 亞太",
      children: [
        "台灣", "越南", "印尼", "印度", "葉門", "泰國", "寮國", "緬甸", 
        "菲律賓", "雲南", "東帝汶", "巴布亞紐幾內亞", "夏威夷", "澳洲"
      ].map(n => ({ name: n, label: n })),
    },
  ],
  tea: [
    {
      name: "Asia 亞洲",
      label: "Asia 亞洲",
      children: ["台灣", "中國", "日本", "印度", "斯里蘭卡"].map(n => ({
        name: n,
        label: n,
      })),
    },
    {
      name: "Africa/Others 其他",
      label: "Africa/Others 其他",
      children: [
        { name: "肯亞 Kenya (Tea)", label: "肯亞 Kenya (Tea)" },
        {
          name: "南非 South Africa (Rooibos)",
          label: "南非 South Africa (Rooibos)",
        },
      ],
    },
  ],
};

export const mainTasteOptions = [
  { name: "salty", label: "鹹 SALTY" },
  { name: "sour", label: "酸 SOUR" },
  { name: "sweet", label: "甜 SWEET" },
  { name: "bitter", label: "苦 BITTER" },
  { name: "umami", label: "鮮 UMAMI" },
];

export const mouthfeelOptions = [
  { name: "rough", label: "粗糙 ROUGH" },
  { name: "oily", label: "油脂 OILY" },
  { name: "smooth", label: "滑順 SMOOTH" },
  { name: "mouth_drying", label: "乾澀 MOUTH-DRYING" },
  { name: "metallic", label: "金屬 METALLIC" },
];

export const acidityOptions = [
  { name: "dry", label: "DRY\n(HERBY, GRASSY, TART)" },
  { name: "sweet", label: "SWEET\n(JUICY, BRIGHT)" },
];
