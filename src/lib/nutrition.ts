export interface MifflinParams {
  age: number;
  weightKg: number;
  heightCm: number;
  sex: 'male' | 'female';
  activityMultiplier: number;
}

export function mifflinStJeor(params: MifflinParams): number {
  const { age, weightKg, heightCm, sex, activityMultiplier } = params;
  let bmr: number;
  if (sex === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return Math.round(bmr * activityMultiplier);
}

export interface Macros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface FoodData {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface DiaryEntryData {
  food_id: string;
  food_source: string;
  serving_qty: number;
}

export function sumDiary(
  entries: DiaryEntryData[],
  foods: Record<string, FoodData>
): Macros {
  const totals: Macros = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  for (const entry of entries) {
    const food = foods[entry.food_id];
    if (!food) continue;
    const qty = entry.serving_qty;
    totals.calories += food.calories * qty;
    totals.protein_g += food.protein_g * qty;
    totals.carbs_g += food.carbs_g * qty;
    totals.fat_g += food.fat_g * qty;
  }
  totals.calories = Math.round(totals.calories * 10) / 10;
  totals.protein_g = Math.round(totals.protein_g * 10) / 10;
  totals.carbs_g = Math.round(totals.carbs_g * 10) / 10;
  totals.fat_g = Math.round(totals.fat_g * 10) / 10;
  return totals;
}
