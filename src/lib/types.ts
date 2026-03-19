export type Intensity = "low" | "medium" | "high";

export interface DrinkData {
  drinkType: "coffee" | "tea";
  flavors: string[];
  mood: string;
  mouthfeel: Intensity;
  mouthfeelTypes: string[];
  flavorIntensity: Intensity;
  mainTastes: string[];
  acidityIntensity: Intensity;
  acidityType: "dry" | "sweet";
  sweetnessIntensity: Intensity;
  itemName: string;
  locationName: string;
}
