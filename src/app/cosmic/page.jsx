"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthStore } from "@/stores/auth";
import { apiFetch } from "@/api/client";

const FOOD_DATABASE = [
  { id: 1, name: "Chicken Breast (grilled)", cals: 165, protein: 31, carbs: 0, fat: 3.6, per: "100g", category: "protein", units: ["g", "oz", "serving"], baseServing: 100, baseUnit: "g" },
  { id: 2, name: "Salmon Fillet", cals: 208, protein: 20, carbs: 0, fat: 13, per: "100g", category: "protein", units: ["g", "oz", "fillet"], baseServing: 100, baseUnit: "g" },
  { id: 3, name: "Egg (large)", cals: 72, protein: 6, carbs: 0.4, fat: 5, per: "1 egg", category: "protein", units: ["egg", "g"], baseServing: 1, baseUnit: "egg" },
  { id: 4, name: "Greek Yogurt (plain)", cals: 100, protein: 17, carbs: 6, fat: 0.7, per: "170g", category: "dairy", units: ["g", "cup", "container"], baseServing: 170, baseUnit: "g" },
  { id: 5, name: "Tuna (canned, drained)", cals: 116, protein: 26, carbs: 0, fat: 0.8, per: "100g", category: "protein", units: ["g", "oz", "can"], baseServing: 100, baseUnit: "g" },
  { id: 6, name: "Turkey Breast (deli)", cals: 104, protein: 18, carbs: 4, fat: 1.5, per: "100g", category: "protein", units: ["g", "oz", "slice"], baseServing: 100, baseUnit: "g" },
  { id: 7, name: "Brown Rice (cooked)", cals: 216, protein: 5, carbs: 45, fat: 1.8, per: "1 cup", category: "grain", units: ["cup", "g"], baseServing: 1, baseUnit: "cup" },
  { id: 8, name: "Oatmeal (dry)", cals: 150, protein: 5, carbs: 27, fat: 2.5, per: "40g", category: "grain", units: ["g", "cup", "packet"], baseServing: 40, baseUnit: "g" },
  { id: 9, name: "Sweet Potato", cals: 103, protein: 2.3, carbs: 24, fat: 0.1, per: "1 medium", category: "vegetable", units: ["medium", "g", "cup"], baseServing: 1, baseUnit: "medium" },
  { id: 10, name: "White Bread", cals: 79, protein: 2.7, carbs: 15, fat: 1, per: "1 slice", category: "grain", units: ["slice", "g"], baseServing: 1, baseUnit: "slice" },
  { id: 11, name: "Pasta (cooked)", cals: 196, protein: 7, carbs: 38, fat: 1.2, per: "1 cup", category: "grain", units: ["cup", "g", "oz"], baseServing: 1, baseUnit: "cup" },
  { id: 12, name: "Quinoa (cooked)", cals: 222, protein: 8, carbs: 39, fat: 3.6, per: "1 cup", category: "grain", units: ["cup", "g"], baseServing: 1, baseUnit: "cup" },
  { id: 13, name: "Banana", cals: 105, protein: 1.3, carbs: 27, fat: 0.4, per: "1 medium", category: "fruit", units: ["medium", "g", "cup"], baseServing: 1, baseUnit: "medium" },
  { id: 14, name: "Apple", cals: 95, protein: 0.5, carbs: 25, fat: 0.3, per: "1 medium", category: "fruit", units: ["medium", "g", "cup"], baseServing: 1, baseUnit: "medium" },
  { id: 15, name: "Blueberries", cals: 84, protein: 1.1, carbs: 21, fat: 0.5, per: "1 cup", category: "fruit", units: ["cup", "g", "oz"], baseServing: 1, baseUnit: "cup" },
  { id: 16, name: "Strawberries", cals: 49, protein: 1, carbs: 12, fat: 0.5, per: "1 cup", category: "fruit", units: ["cup", "g", "oz"], baseServing: 1, baseUnit: "cup" },
  { id: 17, name: "Broccoli", cals: 55, protein: 3.7, carbs: 11, fat: 0.6, per: "1 cup", category: "vegetable", units: ["cup", "g", "oz"], baseServing: 1, baseUnit: "cup" },
  { id: 18, name: "Spinach (raw)", cals: 7, protein: 0.9, carbs: 1.1, fat: 0.1, per: "1 cup", category: "vegetable", units: ["cup", "g", "oz"], baseServing: 1, baseUnit: "cup" },
  { id: 19, name: "Avocado", cals: 234, protein: 2.9, carbs: 12, fat: 21, per: "1 whole", category: "vegetable", units: ["whole", "half", "g"], baseServing: 1, baseUnit: "whole" },
  { id: 20, name: "Almonds", cals: 164, protein: 6, carbs: 6, fat: 14, per: "28g", category: "nut", units: ["g", "oz", "handful"], baseServing: 28, baseUnit: "g" },
  { id: 21, name: "Peanut Butter", cals: 188, protein: 8, carbs: 6, fat: 16, per: "2 tbsp", category: "nut", units: ["tbsp", "g"], baseServing: 2, baseUnit: "tbsp" },
  { id: 22, name: "Olive Oil", cals: 119, protein: 0, carbs: 0, fat: 14, per: "1 tbsp", category: "fat", units: ["tbsp", "tsp", "ml"], baseServing: 1, baseUnit: "tbsp" },
  { id: 23, name: "Whole Milk", cals: 149, protein: 8, carbs: 12, fat: 8, per: "1 cup", category: "dairy", units: ["cup", "ml", "oz"], baseServing: 1, baseUnit: "cup" },
  { id: 24, name: "Cheddar Cheese", cals: 113, protein: 7, carbs: 0.4, fat: 9, per: "28g", category: "dairy", units: ["g", "oz", "slice"], baseServing: 28, baseUnit: "g" },
  { id: 25, name: "Espresso", cals: 5, protein: 0, carbs: 1, fat: 0, per: "1 shot", category: "beverage", units: ["shot", "ml"], baseServing: 1, baseUnit: "shot" },
  { id: 26, name: "Protein Shake (whey)", cals: 120, protein: 24, carbs: 3, fat: 1.5, per: "1 scoop", category: "supplement", units: ["scoop", "g"], baseServing: 1, baseUnit: "scoop" },
  { id: 27, name: "Honey", cals: 64, protein: 0.1, carbs: 17, fat: 0, per: "1 tbsp", category: "condiment", units: ["tbsp", "tsp", "g"], baseServing: 1, baseUnit: "tbsp" },
  { id: 28, name: "White Rice (cooked)", cals: 206, protein: 4.3, carbs: 45, fat: 0.4, per: "1 cup", category: "grain", units: ["cup", "g"], baseServing: 1, baseUnit: "cup" },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "◫" },
  { id: "diary", label: "Diary", icon: "☰" },
  { id: "search", label: "Search", icon: "⌕" },
  { id: "progress", label: "Progress", icon: "◔" },
  { id: "goals", label: "Goals", icon: "◎" },
  { id: "body", label: "Body", icon: "⚖" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const MEAL_META = [
  { id: "breakfast", icon: "☀️", fallbackName: "Breakfast" },
  { id: "lunch", icon: "🌤", fallbackName: "Lunch" },
  { id: "dinner", icon: "🌙", fallbackName: "Dinner" },
  { id: "snacks", icon: "✦", fallbackName: "Snacks" },
];

const ACTIVITY_OPTIONS = [
  { label: "Sedentary", description: "Desk job, little exercise", value: 1.2 },
  { label: "Lightly Active", description: "Light exercise 1-3 days/week", value: 1.375 },
  { label: "Moderately Active", description: "Moderate exercise 3-5 days/week", value: 1.55 },
  { label: "Very Active", description: "Hard exercise 6-7 days/week", value: 1.725 },
  { label: "Extremely Active", description: "Athlete or physical job", value: 1.9 },
];

const ACHIEVEMENTS = [
  { id: "first-bite", name: "First Bite", icon: "🍽" },
  { id: "streak-3", name: "Streak 3", icon: "🔥" },
  { id: "streak-7", name: "Streak 7", icon: "🔥🔥" },
  { id: "streak-30", name: "Streak 30", icon: "🌟" },
  { id: "hydrated", name: "Hydrated", icon: "💧" },
  { id: "perfect-day", name: "Perfect Day", icon: "🎯" },
  { id: "meal-prep-pro", name: "Meal Prep Pro", icon: "📋" },
  { id: "custom-chef", name: "Custom Chef", icon: "👨‍🍳" },
  { id: "centurion", name: "Centurion", icon: "💯" },
  { id: "explorer", name: "Explorer", icon: "🌍" },
  { id: "goal-setter", name: "Goal Setter", icon: "🚀" },
  { id: "body-tracker", name: "Body Tracker", icon: "⚖" },
];

const UNIT_TO_GRAMS = {
  g: 1,
  oz: 28.35,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  ml: 1,
  shot: 30,
  scoop: 30,
  egg: 50,
  slice: 30,
  medium: 150,
  whole: 200,
  half: 100,
  handful: 28,
  can: 120,
  fillet: 170,
  packet: 40,
  container: 170,
  serving: 100,
};

const EMPTY_MEAL_NAMES = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

const INITIAL_STATE = {
  onboardingComplete: false,
  tdee: null,
  goalModifier: 0,
  goals: { calories: null, protein: null, carbs: null, fat: null },
  selectedDate: "",
  diaryByDate: {},
  customFoods: [],
  favorites: [],
  recents: [],
  bodyLog: [],
  achievements: [],
  settings: {
    theme: "cosmic",
    units: "imperial",
    waterGoal: 8,
    mealNames: EMPTY_MEAL_NAMES,
    displayName: "GM",
    email: "g***@***.com",
    notificationsEnabled: false,
    notificationTime: "20:00",
    mealWindows: {
      breakfast: { start: "06:00", end: "10:30" },
      lunch: { start: "11:00", end: "14:00" },
      snacks: { start: "14:00", end: "17:00" },
      dinner: { start: "17:00", end: "23:30" },
    },
  },
  onboardingProfile: null,
  autoBalanceMacros: true,
};

const SETTINGS_STORAGE_KEYS = {
  theme: "dashboard.theme",
  units: "dashboard.units",
  waterGoal: "dashboard.waterGoal",
  mealNames: "dashboard.mealNames",
  displayName: "dashboard.displayName",
  notificationsEnabled: "dashboard.notificationsEnabled",
  notificationTime: "dashboard.notificationTime",
  mealWindows: "dashboard.mealWindows",
};

const SETTINGS_THEME_VALUES = new Set(["cosmic", "solar"]);
const SETTINGS_UNIT_VALUES = new Set(["imperial", "metric"]);
const TIME_VALUE_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseJsonObject(rawValue) {
  if (typeof rawValue !== "string") return null;
  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalizeSettings(settings, fallback = INITIAL_STATE.settings) {
  const source = settings && typeof settings === "object" ? settings : {};
  const mealNamesSource = source.mealNames && typeof source.mealNames === "object" ? source.mealNames : {};
  const mealWindowsSource = source.mealWindows && typeof source.mealWindows === "object" ? source.mealWindows : {};

  const mealNames = {};
  const mealWindows = {};

  MEAL_META.forEach((meal) => {
    const fallbackMealName = fallback.mealNames?.[meal.id] ?? meal.fallbackName;
    const rawMealName = mealNamesSource[meal.id];
    const normalizedMealName =
      typeof rawMealName === "string" && rawMealName.trim()
        ? rawMealName.trim().slice(0, 32)
        : fallbackMealName;
    mealNames[meal.id] = normalizedMealName;

    const fallbackWindow = fallback.mealWindows?.[meal.id] ?? { start: "08:00", end: "20:00" };
    const sourceWindow = mealWindowsSource[meal.id];
    const rawStart =
      sourceWindow && typeof sourceWindow === "object" ? sourceWindow.start : null;
    const rawEnd =
      sourceWindow && typeof sourceWindow === "object" ? sourceWindow.end : null;
    mealWindows[meal.id] = {
      start: typeof rawStart === "string" && TIME_VALUE_REGEX.test(rawStart) ? rawStart : fallbackWindow.start,
      end: typeof rawEnd === "string" && TIME_VALUE_REGEX.test(rawEnd) ? rawEnd : fallbackWindow.end,
    };
  });

  const rawTheme = source.theme;
  const rawUnits = source.units;
  const rawWaterGoal = Number(source.waterGoal);
  const rawDisplayName = typeof source.displayName === "string" ? source.displayName.trim() : "";
  const rawNotificationTime = source.notificationTime;

  return {
    ...fallback,
    theme: SETTINGS_THEME_VALUES.has(rawTheme) ? rawTheme : fallback.theme,
    units: SETTINGS_UNIT_VALUES.has(rawUnits) ? rawUnits : fallback.units,
    waterGoal: Number.isFinite(rawWaterGoal) ? clamp(Math.round(rawWaterGoal), 1, 20) : fallback.waterGoal,
    mealNames,
    displayName: rawDisplayName ? rawDisplayName.slice(0, 40) : fallback.displayName,
    notificationsEnabled:
      typeof source.notificationsEnabled === "boolean"
        ? source.notificationsEnabled
        : fallback.notificationsEnabled,
    notificationTime:
      typeof rawNotificationTime === "string" && TIME_VALUE_REGEX.test(rawNotificationTime)
        ? rawNotificationTime
        : fallback.notificationTime,
    mealWindows,
    email: fallback.email,
  };
}

function serializeSettings(settings) {
  const normalized = normalizeSettings(settings);
  return {
    [SETTINGS_STORAGE_KEYS.theme]: normalized.theme,
    [SETTINGS_STORAGE_KEYS.units]: normalized.units,
    [SETTINGS_STORAGE_KEYS.waterGoal]: String(normalized.waterGoal),
    [SETTINGS_STORAGE_KEYS.mealNames]: JSON.stringify(normalized.mealNames),
    [SETTINGS_STORAGE_KEYS.displayName]: normalized.displayName,
    [SETTINGS_STORAGE_KEYS.notificationsEnabled]: normalized.notificationsEnabled ? "true" : "false",
    [SETTINGS_STORAGE_KEYS.notificationTime]: normalized.notificationTime,
    [SETTINGS_STORAGE_KEYS.mealWindows]: JSON.stringify(normalized.mealWindows),
  };
}

function settingsFromStorage(rawSettings, fallbackSettings) {
  const base = { ...fallbackSettings };
  const next = { ...base };

  if (typeof rawSettings?.[SETTINGS_STORAGE_KEYS.theme] === "string") {
    next.theme = rawSettings[SETTINGS_STORAGE_KEYS.theme];
  }
  if (typeof rawSettings?.[SETTINGS_STORAGE_KEYS.units] === "string") {
    next.units = rawSettings[SETTINGS_STORAGE_KEYS.units];
  }
  if (typeof rawSettings?.[SETTINGS_STORAGE_KEYS.waterGoal] === "string") {
    next.waterGoal = Number(rawSettings[SETTINGS_STORAGE_KEYS.waterGoal]);
  }
  if (typeof rawSettings?.[SETTINGS_STORAGE_KEYS.displayName] === "string") {
    next.displayName = rawSettings[SETTINGS_STORAGE_KEYS.displayName];
  }
  if (typeof rawSettings?.[SETTINGS_STORAGE_KEYS.notificationsEnabled] === "string") {
    next.notificationsEnabled = rawSettings[SETTINGS_STORAGE_KEYS.notificationsEnabled] === "true";
  }
  if (typeof rawSettings?.[SETTINGS_STORAGE_KEYS.notificationTime] === "string") {
    next.notificationTime = rawSettings[SETTINGS_STORAGE_KEYS.notificationTime];
  }

  const parsedMealNames = parseJsonObject(rawSettings?.[SETTINGS_STORAGE_KEYS.mealNames]);
  if (parsedMealNames) next.mealNames = parsedMealNames;

  const parsedMealWindows = parseJsonObject(rawSettings?.[SETTINGS_STORAGE_KEYS.mealWindows]);
  if (parsedMealWindows) next.mealWindows = parsedMealWindows;

  return normalizeSettings(next, fallbackSettings);
}

function dateToKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return dateToKey(date);
}

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDisplayDate(dateKey) {
  if (!dateKey) return "Loading date...";
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatGoal(value, suffix = "") {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value)}${suffix}`;
}

function createEmptyMeals() {
  return MEAL_META.map((meal) => ({ id: meal.id, items: [] }));
}

function createEmptyDay() {
  return { meals: createEmptyMeals(), water: 0 };
}

function ensureDay(diaryByDate, dateKey) {
  return diaryByDate[dateKey] ?? createEmptyDay();
}

function getMealLabel(settings, mealId) {
  const named = settings.mealNames?.[mealId];
  if (named && named.trim()) return named.trim();
  const fallback = MEAL_META.find((meal) => meal.id === mealId)?.fallbackName;
  return fallback ?? mealId;
}

function getAllFoods(customFoods) {
  return [...FOOD_DATABASE, ...customFoods];
}

function foodKey(food) {
  return food.custom ? `custom-${food.id}` : `db-${food.id}`;
}

function getFoodByKey(allFoods, key) {
  return allFoods.find((food) => foodKey(food) === key) ?? null;
}

function convertToBaseAmount(food, amount, unit) {
  if (!food || !Number.isFinite(amount)) return food?.baseServing ?? 1;
  if (unit === food.baseUnit) return amount;
  const from = UNIT_TO_GRAMS[unit];
  const to = UNIT_TO_GRAMS[food.baseUnit];
  if (from && to) return (amount * from) / to;
  return amount;
}

function computeScaledMacros(food, amount, unit) {
  const baseAmount = convertToBaseAmount(food, amount, unit);
  const servings = baseAmount / (food.baseServing || 1);
  return {
    cals: Math.max(0, roundTo(food.cals * servings, 0)),
    protein: Math.max(0, roundTo(food.protein * servings, 1)),
    carbs: Math.max(0, roundTo(food.carbs * servings, 1)),
    fat: Math.max(0, roundTo(food.fat * servings, 1)),
    servings,
  };
}

function sumMealTotals(dayEntry) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, itemCount: 0 };
  dayEntry.meals.forEach((meal) => {
    meal.items.forEach((item) => {
      totals.calories += item.cals;
      totals.protein += item.protein;
      totals.carbs += item.carbs;
      totals.fat += item.fat;
      totals.itemCount += 1;
    });
  });
  totals.calories = Math.round(totals.calories);
  totals.protein = roundTo(totals.protein, 1);
  totals.carbs = roundTo(totals.carbs, 1);
  totals.fat = roundTo(totals.fat, 1);
  return totals;
}

function listHistory(diaryByDate) {
  return Object.entries(diaryByDate)
    .map(([date, day]) => ({ date, ...sumMealTotals(day), water: day.water || 0 }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

function computeStreaks(diaryByDate, selectedDate) {
  const dates = Object.keys(diaryByDate).sort();
  if (!dates.length) return { current: 0, best: 0 };
  let best = 0;
  let running = 0;
  dates.forEach((date) => {
    const count = sumMealTotals(diaryByDate[date]).itemCount;
    if (count > 0) running += 1;
    else running = 0;
    best = Math.max(best, running);
  });
  if (!selectedDate) return { current: running, best };
  let current = 0;
  let cursor = selectedDate;
  while (true) {
    const day = diaryByDate[cursor];
    if (!day || sumMealTotals(day).itemCount === 0) break;
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, best };
}

function computeAchievements(state, totals, streaks) {
  const allFoods = getAllFoods(state.customFoods);
  const uniqueFoodCount = new Set(
    Object.values(state.diaryByDate).flatMap((day) =>
      day.meals.flatMap((meal) => meal.items.map((item) => item.foodKey)),
    ),
  ).size;
  const totalEntries = Object.values(state.diaryByDate).reduce((sum, day) => {
    return sum + day.meals.reduce((mealSum, meal) => mealSum + meal.items.length, 0);
  }, 0);
  const mealPrep = state.selectedDate
    ? ensureDay(state.diaryByDate, state.selectedDate).meals.every((meal) => meal.items.length > 0)
    : false;
  const waterHit = state.selectedDate
    ? (ensureDay(state.diaryByDate, state.selectedDate).water || 0) >= (state.settings.waterGoal || 8)
    : false;
  const goalsSet = Boolean(state.goals.calories && state.goals.protein && state.goals.carbs && state.goals.fat);
  const goalPct = goalsSet
    ? [
        totals.protein / state.goals.protein,
        totals.carbs / state.goals.carbs,
        totals.fat / state.goals.fat,
      ]
    : [];
  const perfectDay = goalsSet && goalPct.every((p) => p >= 0.95 && p <= 1.05);
  const unlocked = new Set(state.achievements);
  if (totalEntries >= 1) unlocked.add("first-bite");
  if (streaks.current >= 3 || streaks.best >= 3) unlocked.add("streak-3");
  if (streaks.current >= 7 || streaks.best >= 7) unlocked.add("streak-7");
  if (streaks.current >= 30 || streaks.best >= 30) unlocked.add("streak-30");
  if (waterHit) unlocked.add("hydrated");
  if (perfectDay) unlocked.add("perfect-day");
  if (mealPrep) unlocked.add("meal-prep-pro");
  if (state.customFoods.length > 0) unlocked.add("custom-chef");
  if (totalEntries >= 100) unlocked.add("centurion");
  if (uniqueFoodCount >= 20 || uniqueFoodCount >= Math.min(20, allFoods.length)) unlocked.add("explorer");
  if (state.onboardingComplete) unlocked.add("goal-setter");
  if (state.bodyLog.length > 0) unlocked.add("body-tracker");
  return [...unlocked];
}

function computeTdeeAndMacros(wizard) {
  const age = Number(wizard.age);
  const male = wizard.sex === "male";
  const weightKg =
    wizard.units === "imperial"
      ? Number(wizard.weight) * 0.45359237
      : Number(wizard.weight);
  const heightCm =
    wizard.units === "imperial"
      ? (Number(wizard.heightFt) * 12 + Number(wizard.heightIn)) * 2.54
      : Number(wizard.heightCm);
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (male ? -5 : -161);
  const tdee = Math.round(bmr * wizard.activity);
  const targetCalories = Math.max(1200, Math.round(tdee + wizard.modifier));
  const bodyweightLbs = wizard.units === "imperial" ? Number(wizard.weight) : Number(wizard.weight) * 2.20462;
  const protein = Math.max(0, Math.round(Math.min(bodyweightLbs, (targetCalories * 0.35) / 4)));
  const fat = Math.max(0, Math.round((targetCalories * 0.25) / 9));
  const carbs = Math.max(0, Math.round((targetCalories - protein * 4 - fat * 9) / 4));
  const macroCals = protein * 4 + carbs * 4 + fat * 9;
  return { tdee, targetCalories, protein, carbs, fat, macroCals, weightKg, heightCm };
}

function useCountUp(target, duration = 800) {
  const [display, setDisplay] = useState(target);
  const previous = useRef(target);
  useEffect(() => {
    const startValue = previous.current;
    const endValue = target;
    if (startValue === endValue) return undefined;
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const value = startValue + (endValue - startValue) * progress;
      setDisplay(value);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else previous.current = endValue;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  useEffect(() => {
    previous.current = target;
    setDisplay(target);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return display;
}

function OrbitRing({ radius, color, progress, delay, replayKey }) {
  const [animProgress, setAnimProgress] = useState(0);
  useEffect(() => {
    setAnimProgress(0);
    const timer = setTimeout(() => {
      setAnimProgress(progress);
    }, delay);
    return () => clearTimeout(timer);
  }, [progress, delay, replayKey]);

  const circumference = 2 * Math.PI * radius;
  const clamped = clamp(animProgress, 0, 1);
  const dashOffset = circumference - circumference * clamped;
  const angle = animProgress * 360 - 90;
  const cx = 140 + radius * Math.cos((angle * Math.PI) / 180);
  const cy = 140 + radius * Math.sin((angle * Math.PI) / 180);
  const isOver = progress > 1;

  return (
    <>
      <circle cx="140" cy="140" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle
        cx="140"
        cy="140"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 140 140)"
        style={{
          transition: "stroke-dashoffset 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
      <circle
        cx={cx}
        cy={cy}
        r="4"
        fill={color}
        opacity={clamped <= 0 ? 0 : 1}
        className={isOver ? "orbit-over-dot" : ""}
        style={{
          transition: "all 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          filter: isOver ? "drop-shadow(0 0 12px #ff6b6b)" : `drop-shadow(0 0 8px ${color})`,
        }}
      />
    </>
  );
}

function makeId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

export default function CosmicNutriTrackPage() {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [appState, setAppState] = useState(INITIAL_STATE);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [clock, setClock] = useState("--:--:--");
  const [todayKey, setTodayKey] = useState("");
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [searchMeal, setSearchMeal] = useState("breakfast");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTab, setSearchTab] = useState("all");
  const [selectedFoodKey, setSelectedFoodKey] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState("serving");
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [selectedMultiplier, setSelectedMultiplier] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [creatingCustomFood, setCreatingCustomFood] = useState(false);
  const [customFoodDraft, setCustomFoodDraft] = useState({
    name: "",
    brand: "",
    per: "1 serving",
    cals: "",
    protein: "",
    carbs: "",
    fat: "",
    unit: "serving",
    baseServing: "1",
  });
  const [toasts, setToasts] = useState([]);
  const [showAchievementsPanel, setShowAchievementsPanel] = useState(false);
  const [confettiSeed, setConfettiSeed] = useState(0);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [expandedMeals, setExpandedMeals] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
    snacks: true,
  });
  const [progressRange, setProgressRange] = useState("1W");
  const [showBodyLogForm, setShowBodyLogForm] = useState(false);
  const [bodyLogDraft, setBodyLogDraft] = useState({ date: "", weight: "", note: "" });
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [wizard, setWizard] = useState({
    name: "",
    sex: "male",
    age: "28",
    units: "imperial",
    heightFt: "5",
    heightIn: "10",
    heightCm: "178",
    weight: "170",
    activity: 1.55,
    goalMode: "lose",
    modifier: -250,
  });
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const lastMidnightCheckRef = useRef("");
  const settingsSaveTimerRef = useRef(null);
  const syncedSettingsRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const key = dateToKey(now);
    setTodayKey(key);
    setClock(formatClock(now));
    lastMidnightCheckRef.current = key;
    setAppState((prev) => {
      if (prev.selectedDate) return prev;
      return {
        ...prev,
        selectedDate: key,
        diaryByDate: {
          ...prev.diaryByDate,
          [key]: prev.diaryByDate[key] ?? createEmptyDay(),
        },
      };
    });
    setBodyLogDraft((prev) => ({ ...prev, date: key }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClock(formatClock(now));
      const key = dateToKey(now);
      setTodayKey(key);
      if (!lastMidnightCheckRef.current) lastMidnightCheckRef.current = key;
      if (key !== lastMidnightCheckRef.current) {
        lastMidnightCheckRef.current = key;
        setAppState((prev) => {
          const nextDate = prev.selectedDate === addDays(key, -1) || prev.selectedDate === todayKey ? key : prev.selectedDate;
          if (!nextDate) return prev;
          return {
            ...prev,
            selectedDate: nextDate,
            diaryByDate: {
              ...prev.diaryByDate,
              [nextDate]: prev.diaryByDate[nextDate] ?? createEmptyDay(),
            },
          };
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [todayKey]);

  useEffect(() => {
    if (!appState.selectedDate) return;
    setAppState((prev) => {
      if (prev.diaryByDate[prev.selectedDate]) return prev;
      return {
        ...prev,
        diaryByDate: {
          ...prev.diaryByDate,
          [prev.selectedDate]: createEmptyDay(),
        },
      };
    });
    setBodyLogDraft((prev) => ({ ...prev, date: appState.selectedDate }));
  }, [appState.selectedDate]);

  useEffect(() => {
    if (!user?.id) {
      setSettingsLoaded(false);
      syncedSettingsRef.current = null;
      if (settingsSaveTimerRef.current) {
        clearTimeout(settingsSaveTimerRef.current);
        settingsSaveTimerRef.current = null;
      }
      return;
    }

    let cancelled = false;
    setSettingsLoaded(false);

    (async () => {
      let remoteSettings = {};
      try {
        remoteSettings = await apiFetch("/api/settings");
      } catch {
        remoteSettings = {};
      }

      if (cancelled) return;

      setAppState((prev) => {
        const mergedSettings = settingsFromStorage(remoteSettings, prev.settings);
        syncedSettingsRef.current = serializeSettings(mergedSettings);
        return {
          ...prev,
          settings: mergedSettings,
        };
      });

      setSettingsLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !settingsLoaded) return undefined;

    const serializedSettings = serializeSettings(appState.settings);
    const previousSynced = syncedSettingsRef.current;

    if (!previousSynced) {
      syncedSettingsRef.current = serializedSettings;
      return undefined;
    }

    const changes = Object.entries(serializedSettings).filter(
      ([key, value]) => previousSynced[key] !== value,
    );
    if (!changes.length) return undefined;

    if (settingsSaveTimerRef.current) {
      clearTimeout(settingsSaveTimerRef.current);
      settingsSaveTimerRef.current = null;
    }

    settingsSaveTimerRef.current = setTimeout(async () => {
      const saveResults = await Promise.allSettled(
        changes.map(([key, value]) =>
          apiFetch("/api/settings", {
            method: "PUT",
            body: JSON.stringify({ key, value }),
          }),
        ),
      );

      if (saveResults.every((result) => result.status === "fulfilled")) {
        syncedSettingsRef.current = serializedSettings;
      }

      settingsSaveTimerRef.current = null;
    }, 500);

    return () => {
      if (settingsSaveTimerRef.current) {
        clearTimeout(settingsSaveTimerRef.current);
        settingsSaveTimerRef.current = null;
      }
    };
  }, [appState.settings, settingsLoaded, user?.id]);

  useEffect(
    () => () => {
      if (settingsSaveTimerRef.current) {
        clearTimeout(settingsSaveTimerRef.current);
        settingsSaveTimerRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = [];
    const buildStars = () => {
      const width = parent.offsetWidth;
      const height = parent.offsetHeight;
      canvas.width = width * 2;
      canvas.height = height * 2;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      stars.length = 0;
      for (let i = 0; i < 120; i += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.2 + Math.random() * 1.2,
          a: Math.random(),
          speed: 0.002 + Math.random() * 0.008,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    buildStars();
    const onResize = () => buildStars();
    window.addEventListener("resize", onResize);

    const render = (time) => {
      const width = parent.offsetWidth;
      const height = parent.offsetHeight;
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(time * star.speed + star.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(200,210,255,${alpha * star.a})`;
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [mounted]);

  const selectedDay = useMemo(
    () => ensureDay(appState.diaryByDate, appState.selectedDate),
    [appState.diaryByDate, appState.selectedDate],
  );
  const totals = useMemo(() => sumMealTotals(selectedDay), [selectedDay]);
  const history = useMemo(() => listHistory(appState.diaryByDate), [appState.diaryByDate]);
  const streaks = useMemo(
    () => computeStreaks(appState.diaryByDate, appState.selectedDate),
    [appState.diaryByDate, appState.selectedDate],
  );
  const allFoods = useMemo(() => getAllFoods(appState.customFoods), [appState.customFoods]);
  const weeklyData = useMemo(() => {
    if (!appState.selectedDate) return [];
    return Array.from({ length: 7 }).map((_, idx) => {
      const date = addDays(appState.selectedDate, idx - 6);
      const dayTotals = sumMealTotals(ensureDay(appState.diaryByDate, date));
      const short = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" });
      return { date, day: short, cals: dayTotals.calories };
    });
  }, [appState.diaryByDate, appState.selectedDate]);

  const replayKey = `${appState.selectedDate}:${totals.calories}:${totals.protein}:${totals.carbs}:${totals.fat}`;
  const goalsSet =
    appState.goals.calories !== null &&
    appState.goals.protein !== null &&
    appState.goals.carbs !== null &&
    appState.goals.fat !== null;
  const remainingCalories = goalsSet ? appState.goals.calories - totals.calories : null;
  const weeklyAvg = weeklyData.length
    ? Math.round(weeklyData.reduce((sum, day) => sum + day.cals, 0) / weeklyData.length)
    : 0;
  const weeklyHasData = weeklyData.some((day) => day.cals > 0);
  const barMax = Math.max(
    1,
    ...weeklyData.map((d) => d.cals),
    appState.goals.calories || 0,
  );

  const displayCalories = useCountUp(totals.calories, 800);
  const displayProtein = useCountUp(totals.protein, 800);
  const displayCarbs = useCountUp(totals.carbs, 800);
  const displayFat = useCountUp(totals.fat, 800);

  const pushToast = (toast) => {
    const id = makeId("toast");
    setToasts((prev) => [{ id, ...toast }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Fall through to local logout so users are never stuck in the app UI.
    } finally {
      clearUser();
      router.replace("/");
    }
  };

  const closeSearchOverlay = () => {
    setSearchOverlayOpen(false);
    setSearchTerm("");
    setSelectedFoodKey(null);
    setSelectedAmount(1);
    setSelectedUnit("serving");
    setSelectedMultiplier(1);
    setEditingItem(null);
    setSearchTab("all");
  };

  const openSearchOverlay = (mealId = null) => {
    const targetMeal = mealId || defaultMealForTime(appState.settings.mealWindows);
    setSearchMeal(targetMeal);
    setSearchOverlayOpen(true);
    setSelectedFoodKey(null);
    setSelectedAmount(1);
    setSelectedUnit("serving");
    setSelectedMultiplier(1);
    setEditingItem(null);
  };

  const selectedFood = selectedFoodKey ? getFoodByKey(allFoods, selectedFoodKey) : null;

  const scaledFoodMacros = useMemo(() => {
    if (!selectedFood) return { cals: 0, protein: 0, carbs: 0, fat: 0 };
    return computeScaledMacros(selectedFood, selectedAmount, selectedUnit);
  }, [selectedFood, selectedAmount, selectedUnit]);

  const filteredFoods = useMemo(() => {
    const lower = searchTerm.trim().toLowerCase();
    let pool = allFoods;
    if (searchTab === "my") pool = appState.customFoods;
    if (searchTab === "favorites") {
      pool = allFoods.filter((food) => appState.favorites.includes(foodKey(food)));
    }
    if (!lower) return pool;
    return pool.filter((food) => food.name.toLowerCase().includes(lower));
  }, [allFoods, appState.customFoods, appState.favorites, searchTab, searchTerm]);

  const historyByDate = useMemo(() => {
    const map = {};
    history.forEach((point) => {
      map[point.date] = point;
    });
    return map;
  }, [history]);

  function defaultMealForTime(mealWindows) {
    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const ids = ["breakfast", "lunch", "snacks", "dinner"];
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      const window = mealWindows?.[id];
      if (!window) continue;
      const [startH, startM] = window.start.split(":").map(Number);
      const [endH, endM] = window.end.split(":").map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      if (minutesNow >= start && minutesNow <= end) return id;
    }
    return "dinner";
  }

  const toggleFavorite = (food) => {
    const key = foodKey(food);
    setAppState((prev) => {
      const exists = prev.favorites.includes(key);
      return {
        ...prev,
        favorites: exists ? prev.favorites.filter((id) => id !== key) : [...prev.favorites, key],
      };
    });
  };

  const addFoodToMeal = (mode = "close") => {
    if (!selectedFood || !appState.selectedDate) return;
    const mealId = searchMeal;
    const computed = computeScaledMacros(selectedFood, selectedAmount, selectedUnit);
    const newItem = {
      id: makeId("food"),
      name: selectedFood.name,
      cals: computed.cals,
      protein: computed.protein,
      carbs: computed.carbs,
      fat: computed.fat,
      amount: selectedAmount,
      unit: selectedUnit,
      servingText: `${roundTo(selectedAmount, 2)} ${selectedUnit}`,
      foodKey: foodKey(selectedFood),
    };

    let replacedSnapshot = null;
    setAppState((prev) => {
      const currentDay = ensureDay(prev.diaryByDate, prev.selectedDate);
      const meals = currentDay.meals.map((meal) => {
        if (meal.id !== mealId) return meal;
        if (editingItem && editingItem.mealId === mealId) {
          const idx = meal.items.findIndex((item) => item.id === editingItem.itemId);
          if (idx >= 0) {
            replacedSnapshot = { mealId, index: idx, previous: meal.items[idx] };
            const nextItems = [...meal.items];
            nextItems[idx] = newItem;
            return { ...meal, items: nextItems };
          }
        }
        return { ...meal, items: [...meal.items, newItem] };
      });
      return {
        ...prev,
        diaryByDate: {
          ...prev.diaryByDate,
          [prev.selectedDate]: { ...currentDay, meals },
        },
        recents: [foodKey(selectedFood), ...prev.recents.filter((key) => key !== foodKey(selectedFood))].slice(0, 10),
      };
    });

    if (replacedSnapshot) {
      pushToast({
        type: "success",
        message: `Updated ${selectedFood.name}`,
        undo: () => {
          setAppState((prev) => {
            const day = ensureDay(prev.diaryByDate, prev.selectedDate);
            const meals = day.meals.map((meal) => {
              if (meal.id !== replacedSnapshot.mealId) return meal;
              const nextItems = [...meal.items];
              nextItems[replacedSnapshot.index] = replacedSnapshot.previous;
              return { ...meal, items: nextItems };
            });
            return {
              ...prev,
              diaryByDate: { ...prev.diaryByDate, [prev.selectedDate]: { ...day, meals } },
            };
          });
        },
      });
    } else {
      pushToast({
        type: "success",
        message: `Added ${selectedFood.name} to ${getMealLabel(appState.settings, mealId)}`,
        undo: () => {
          setAppState((prev) => {
            const day = ensureDay(prev.diaryByDate, prev.selectedDate);
            const meals = day.meals.map((meal) => {
              if (meal.id !== mealId) return meal;
              return { ...meal, items: meal.items.filter((item) => item.id !== newItem.id) };
            });
            return {
              ...prev,
              diaryByDate: { ...prev.diaryByDate, [prev.selectedDate]: { ...day, meals } },
            };
          });
        },
      });
    }

    if (mode === "continue") {
      setSelectedFoodKey(null);
      setSelectedAmount(1);
      setSelectedUnit(selectedFood.baseUnit || "serving");
      setSelectedMultiplier(1);
      setEditingItem(null);
    } else {
      closeSearchOverlay();
    }
  };

  const deleteMealItem = (mealId, itemId) => {
    let snapshot = null;
    setAppState((prev) => {
      const day = ensureDay(prev.diaryByDate, prev.selectedDate);
      const meals = day.meals.map((meal) => {
        if (meal.id !== mealId) return meal;
        const idx = meal.items.findIndex((item) => item.id === itemId);
        if (idx >= 0) {
          snapshot = { mealId, index: idx, item: meal.items[idx] };
          return { ...meal, items: meal.items.filter((item) => item.id !== itemId) };
        }
        return meal;
      });
      return {
        ...prev,
        diaryByDate: { ...prev.diaryByDate, [prev.selectedDate]: { ...day, meals } },
      };
    });
    if (snapshot) {
      pushToast({
        type: "warning",
        message: `Removed ${snapshot.item.name}`,
        undo: () => {
          setAppState((prev) => {
            const day = ensureDay(prev.diaryByDate, prev.selectedDate);
            const meals = day.meals.map((meal) => {
              if (meal.id !== snapshot.mealId) return meal;
              const next = [...meal.items];
              next.splice(snapshot.index, 0, snapshot.item);
              return { ...meal, items: next };
            });
            return {
              ...prev,
              diaryByDate: { ...prev.diaryByDate, [prev.selectedDate]: { ...day, meals } },
            };
          });
        },
      });
    }
  };

  const openEditItem = (mealId, item) => {
    const food = getFoodByKey(allFoods, item.foodKey);
    if (!food) return;
    setSearchMeal(mealId);
    setSearchOverlayOpen(true);
    setSelectedFoodKey(item.foodKey);
    setSelectedUnit(item.unit || food.baseUnit || "serving");
    setSelectedAmount(Number(item.amount) || food.baseServing || 1);
    setSelectedMultiplier(1);
    setEditingItem({ mealId, itemId: item.id });
  };

  useEffect(() => {
    if (!selectedFood) return;
    setSelectedUnit(selectedFood.baseUnit || selectedFood.units?.[0] || "serving");
    setSelectedAmount(selectedFood.baseServing || 1);
    setSelectedMultiplier(1);
  }, [selectedFoodKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const weeklyFooterState = useMemo(() => {
    if (!goalsSet || !weeklyHasData) return "none";
    return weeklyAvg <= appState.goals.calories ? "on-track" : "over";
  }, [goalsSet, weeklyHasData, weeklyAvg, appState.goals.calories]);

  useEffect(() => {
    const unlocked = computeAchievements(appState, totals, streaks);
    const incoming = unlocked.filter((id) => !appState.achievements.includes(id));
    if (!incoming.length) return;
    setAppState((prev) => ({ ...prev, achievements: unlocked }));
    const latest = ACHIEVEMENTS.find((item) => item.id === incoming[incoming.length - 1]);
    if (latest) {
      pushToast({ type: "success", message: `Achievement unlocked: ${latest.name}` });
      setConfettiSeed((seed) => seed + 1);
    }
  }, [appState, totals, streaks]); // eslint-disable-line react-hooks/exhaustive-deps

  const recentAchievement = ACHIEVEMENTS.find((item) => appState.achievements.includes(item.id));

  const applyWizard = () => {
    const result = computeTdeeAndMacros(wizard);
    setAppState((prev) => ({
      ...prev,
      onboardingComplete: true,
      tdee: result.tdee,
      goalModifier: wizard.modifier,
      goals: {
        calories: result.targetCalories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
      },
      onboardingProfile: {
        ...wizard,
        name: wizard.name || prev.settings.displayName,
        weightKg: result.weightKg,
        heightCm: result.heightCm,
      },
      settings: {
        ...prev.settings,
        units: wizard.units,
        displayName: wizard.name || prev.settings.displayName,
      },
    }));
    setShowOnboardingWizard(false);
    setOnboardingStep(1);
    pushToast({ type: "success", message: "Goals configured. Mission started." });
  };

  const skipWizard = () => {
    setAppState((prev) => ({
      ...prev,
      onboardingComplete: true,
      tdee: 2000,
      goalModifier: 0,
      goals: { calories: 2000, protein: 150, carbs: 200, fat: 56 },
    }));
    setShowOnboardingWizard(false);
    setOnboardingStep(1);
  };

  const wizardPreview = useMemo(() => computeTdeeAndMacros(wizard), [wizard]);

  const adjustWater = (value) => {
    const capped = clamp(value, 0, appState.settings.waterGoal || 8);
    setAppState((prev) => {
      const day = ensureDay(prev.diaryByDate, prev.selectedDate);
      return {
        ...prev,
        diaryByDate: {
          ...prev.diaryByDate,
          [prev.selectedDate]: { ...day, water: capped },
        },
      };
    });
  };

  const setDate = (dateKey) => {
    setAppState((prev) => ({
      ...prev,
      selectedDate: dateKey,
      diaryByDate: {
        ...prev.diaryByDate,
        [dateKey]: prev.diaryByDate[dateKey] ?? createEmptyDay(),
      },
    }));
  };

  const setMealName = (mealId, name) => {
    setAppState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        mealNames: { ...prev.settings.mealNames, [mealId]: name },
      },
    }));
  };

  const saveCustomFood = () => {
    if (!customFoodDraft.name.trim()) return;
    const newFood = {
      id: makeId("custom"),
      name: customFoodDraft.name.trim(),
      cals: Number(customFoodDraft.cals) || 0,
      protein: Number(customFoodDraft.protein) || 0,
      carbs: Number(customFoodDraft.carbs) || 0,
      fat: Number(customFoodDraft.fat) || 0,
      per: customFoodDraft.per || `1 ${customFoodDraft.unit}`,
      category: "custom",
      units: [customFoodDraft.unit || "serving", "g"],
      baseServing: Number(customFoodDraft.baseServing) || 1,
      baseUnit: customFoodDraft.unit || "serving",
      custom: true,
    };
    setAppState((prev) => ({ ...prev, customFoods: [newFood, ...prev.customFoods] }));
    setCustomFoodDraft({
      name: "",
      brand: "",
      per: "1 serving",
      cals: "",
      protein: "",
      carbs: "",
      fat: "",
      unit: "serving",
      baseServing: "1",
    });
    setCreatingCustomFood(false);
    pushToast({ type: "success", message: `Created ${newFood.name}` });
  };

  const updateGoalField = (field, value) => {
    const numeric = Number(value);
    setAppState((prev) => {
      const nextGoals = { ...prev.goals, [field]: Number.isFinite(numeric) ? numeric : null };
      if (field === "calories" && prev.autoBalanceMacros && numeric > 0) {
        const profile = prev.onboardingProfile;
        const bodyweightLbs = profile
          ? (profile.units === "imperial" ? Number(profile.weight) : Number(profile.weight) * 2.20462)
          : (numeric / 13);
        const protein = Math.round(Math.min(bodyweightLbs, (numeric * 0.35) / 4));
        const fat = Math.round((numeric * 0.25) / 9);
        const carbs = Math.max(0, Math.round((numeric - protein * 4 - fat * 9) / 4));
        nextGoals.protein = protein;
        nextGoals.fat = fat;
        nextGoals.carbs = carbs;
      }
      return { ...prev, goals: nextGoals };
    });
  };

  const convertUnits = (nextUnits) => {
    setAppState((prev) => {
      if (prev.settings.units === nextUnits) return prev;
      const bodyLog = prev.bodyLog.map((entry) => ({
        ...entry,
        weight:
          prev.settings.units === "imperial"
            ? roundTo(entry.weight * 0.45359237, 1)
            : roundTo(entry.weight / 0.45359237, 1),
      }));
      const profile = prev.onboardingProfile
        ? {
            ...prev.onboardingProfile,
            units: nextUnits,
            weight:
              prev.settings.units === "imperial"
                ? roundTo(Number(prev.onboardingProfile.weight) * 0.45359237, 1)
                : roundTo(Number(prev.onboardingProfile.weight) / 0.45359237, 1),
            heightCm:
              prev.settings.units === "imperial"
                ? roundTo((Number(prev.onboardingProfile.heightFt) * 12 + Number(prev.onboardingProfile.heightIn)) * 2.54, 1)
                : prev.onboardingProfile.heightCm,
          }
        : prev.onboardingProfile;
      return {
        ...prev,
        bodyLog,
        onboardingProfile: profile,
        settings: { ...prev.settings, units: nextUnits },
      };
    });
  };

  const copyYesterday = () => {
    const yesterday = addDays(appState.selectedDate, -1);
    const source = appState.diaryByDate[yesterday];
    if (!source) return;
    setAppState((prev) => ({
      ...prev,
      diaryByDate: {
        ...prev.diaryByDate,
        [prev.selectedDate]: {
          meals: source.meals.map((meal) => ({ ...meal, items: meal.items.map((item) => ({ ...item, id: makeId("food") })) })),
          water: source.water,
        },
      },
    }));
    pushToast({ type: "success", message: "Copied meals from yesterday" });
  };

  const saveBodyLog = () => {
    if (!bodyLogDraft.date || !bodyLogDraft.weight) return;
    const entry = {
      id: makeId("body"),
      date: bodyLogDraft.date,
      weight: Number(bodyLogDraft.weight),
      note: bodyLogDraft.note,
    };
    setAppState((prev) => ({
      ...prev,
      bodyLog: [...prev.bodyLog.filter((row) => row.date !== entry.date), entry].sort((a, b) => (a.date < b.date ? -1 : 1)),
    }));
    setShowBodyLogForm(false);
    setBodyLogDraft((prev) => ({ ...prev, weight: "", note: "" }));
    pushToast({ type: "success", message: "Body log saved" });
  };

  const progressData = useMemo(() => {
    let count = 7;
    if (progressRange === "2W") count = 14;
    if (progressRange === "1M") count = 30;
    if (progressRange === "3M") count = 90;
    if (progressRange === "All") count = 3650;
    return history.slice(-count).map((item) => ({
      ...item,
      label: new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));
  }, [history, progressRange]);

  const macroCalorieSum = useMemo(() => {
    const p = Number(appState.goals.protein || 0) * 4;
    const c = Number(appState.goals.carbs || 0) * 4;
    const f = Number(appState.goals.fat || 0) * 9;
    return { p, c, f, sum: p + c + f };
  }, [appState.goals]);

  const isMacroMismatch =
    appState.goals.calories &&
    Math.abs(macroCalorieSum.sum - appState.goals.calories) > 50;

  const renderDateNavigator = () => (
    <div className="date-nav">
      <button type="button" onClick={() => setDate(addDays(appState.selectedDate, -1))}>◁</button>
      <span>{formatDisplayDate(appState.selectedDate)}</span>
      <button type="button" onClick={() => setDate(addDays(appState.selectedDate, 1))}>▷</button>
      {todayKey && appState.selectedDate !== todayKey && (
        <button
          type="button"
          className="today-pill"
          onClick={() => setDate(todayKey)}
        >
          Today
        </button>
      )}
    </div>
  );

  const renderStatCard = (label, value, unit, color, background, border, index) => (
    <div
      className="stat-card fade-slide"
      style={{
        background,
        borderColor: border,
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value-row">
        <span className="stat-value" style={{ color }}>{value}</span>
        <span className="stat-unit">{unit}</span>
      </div>
    </div>
  );

  const renderMealCard = (meal, mealIndex) => {
    const mealLabel = getMealLabel(appState.settings, meal.id);
    const mealIcon = MEAL_META.find((row) => row.id === meal.id)?.icon || "•";
    const mealCalories = Math.round(meal.items.reduce((sum, item) => sum + item.cals, 0));
    return (
      <article className="meal-card fade-slide" style={{ animationDelay: `${(mealIndex + 4) * 80}ms` }} key={meal.id}>
        <div className="meal-card-head">
          <span>{mealIcon} {mealLabel}</span>
          <span className={mealCalories ? "" : "meal-zero"}>{mealCalories} kcal</span>
        </div>
        {meal.items.length === 0 ? (
          <button type="button" className="empty-meal-btn" onClick={() => openSearchOverlay(meal.id)}>
            + Add food
          </button>
        ) : (
          <>
            <div className="meal-items-col">
              {meal.items.map((item) => (
                <div className="meal-item-row" key={item.id}>
                  <div>
                    <div className="meal-item-name">{item.name}</div>
                    <div className="meal-item-serving">{item.servingText || `${item.amount} ${item.unit}`}</div>
                  </div>
                  <div className="meal-item-actions">
                    <span className="cal">{item.cals}</span>
                    <button type="button" onClick={() => openEditItem(meal.id, item)}>✎</button>
                    <button type="button" className="danger" onClick={() => deleteMealItem(meal.id, item.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="ghost-add" onClick={() => openSearchOverlay(meal.id)}>+ Add</button>
          </>
        )}
      </article>
    );
  };

  const renderQuickAdd = () => {
    const favorites = appState.favorites
      .map((key) => getFoodByKey(allFoods, key))
      .filter(Boolean);
    const recents = appState.recents
      .map((key) => getFoodByKey(allFoods, key))
      .filter(Boolean)
      .filter((food) => !favorites.some((fav) => foodKey(fav) === foodKey(food)));
    const quick = [...favorites, ...recents].slice(0, 12);
    return (
      <section className="quick-add-wrap card">
        <div className="section-head">
          <h3>Quick Add</h3>
          <button type="button" onClick={() => setActiveScreen("search")}>See all →</button>
        </div>
        {quick.length === 0 ? (
          <div className="empty-subtle">Star or log foods to build your quick add bar</div>
        ) : (
          <div className="quick-scroll">
            {quick.map((food) => (
              <button
                key={foodKey(food)}
                type="button"
                className="quick-chip"
                onClick={() => {
                  setSearchMeal(defaultMealForTime(appState.settings.mealWindows));
                  setSearchOverlayOpen(true);
                  setSelectedFoodKey(foodKey(food));
                }}
              >
                <div className="quick-name">{food.name}</div>
                <div className="quick-cal">{food.cals} kcal</div>
                <span className="quick-plus">+</span>
              </button>
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderDashboard = () => (
    <>
      {!appState.onboardingComplete && (
        <section className="onboarding-banner" onClick={() => setShowOnboardingWizard(true)}>
          <div>
            <div className="banner-title">🚀 Welcome to NutriTrack</div>
            <div className="banner-copy">Set up your goals to begin tracking your nutrition</div>
          </div>
          <button type="button">Get Started →</button>
        </section>
      )}

      <section className="stats-grid">
        {renderStatCard(
          "Calories",
          Math.round(displayCalories).toLocaleString(),
          "kcal",
          "#c084fc",
          "rgba(139,92,246,0.08)",
          "rgba(139,92,246,0.15)",
          0,
        )}
        {renderStatCard(
          "Protein",
          `${Math.round(displayProtein)}g`,
          `/ ${formatGoal(appState.goals.protein, "g")}`,
          "#34d399",
          "rgba(52,211,153,0.08)",
          "rgba(52,211,153,0.15)",
          1,
        )}
        {renderStatCard(
          "Carbs",
          `${Math.round(displayCarbs)}g`,
          `/ ${formatGoal(appState.goals.carbs, "g")}`,
          "#fbbf24",
          "rgba(251,191,36,0.08)",
          "rgba(251,191,36,0.15)",
          2,
        )}
        {renderStatCard(
          "Fat",
          `${Math.round(displayFat)}g`,
          `/ ${formatGoal(appState.goals.fat, "g")}`,
          "#f472b6",
          "rgba(244,114,182,0.08)",
          "rgba(244,114,182,0.15)",
          3,
        )}
      </section>

      <section className="dashboard-grid">
        <article className="card orbit-card">
          <div className="card-head">
            <h3>Daily Orbit</h3>
            <span>{formatDisplayDate(appState.selectedDate)}</span>
          </div>
          <div className="orbit-shell">
            <svg viewBox="0 0 280 280" className="orbit-svg">
              <OrbitRing
                radius={125}
                color="#c084fc"
                progress={goalsSet ? totals.calories / appState.goals.calories : 0}
                delay={200}
                replayKey={replayKey}
              />
              <OrbitRing
                radius={108}
                color="#34d399"
                progress={goalsSet ? totals.protein / appState.goals.protein : 0}
                delay={400}
                replayKey={replayKey}
              />
              <OrbitRing
                radius={91}
                color="#fbbf24"
                progress={goalsSet ? totals.carbs / appState.goals.carbs : 0}
                delay={600}
                replayKey={replayKey}
              />
              <OrbitRing
                radius={74}
                color="#f472b6"
                progress={goalsSet ? totals.fat / appState.goals.fat : 0}
                delay={800}
                replayKey={replayKey}
              />
            </svg>
            <div className="orbit-center">
              {goalsSet ? (
                <>
                  <div className={`orbit-number ${remainingCalories < 0 ? "over" : ""}`}>
                    {Math.abs(remainingCalories).toLocaleString()}
                  </div>
                  <div className="orbit-label">{remainingCalories < 0 ? "OVER" : "REMAINING"}</div>
                </>
              ) : (
                <>
                  <button type="button" className="orbit-goals-link" onClick={() => setShowOnboardingWizard(true)}>—</button>
                  <div className="orbit-label setup">SET GOALS</div>
                </>
              )}
            </div>
          </div>
          <div className="orbit-legend">
            <span><i style={{ background: "#c084fc" }} />Cal</span>
            <span><i style={{ background: "#34d399" }} />Pro</span>
            <span><i style={{ background: "#fbbf24" }} />Carb</span>
            <span><i style={{ background: "#f472b6" }} />Fat</span>
          </div>
        </article>

        <div className="right-stack">
          <article className="card weekly-card">
            <div className="card-head">
              <h3>Weekly Trend</h3>
              <span>AVG {weeklyAvg || 0} kcal</span>
            </div>
            <div className="bars-wrap">
              {!weeklyHasData && <div className="empty-overlay">Log food to see trends</div>}
              {weeklyData.map((day, index) => {
                const height = (day.cals / barMax) * 48;
                const over = goalsSet && day.cals > appState.goals.calories;
                const isToday = day.date === appState.selectedDate;
                return (
                  <div className="bar-col" key={day.date}>
                    <div
                      className={`bar-inner ${over ? "over" : ""} ${isToday ? "today" : ""}`}
                      style={{ height: `${Math.max(0, height)}px`, animationDelay: `${index * 80}ms` }}
                    />
                    <span className={isToday ? "today-day" : ""}>{day.day.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
            <div className="weekly-footer">
              <span>Goal: {goalsSet ? `${appState.goals.calories} kcal` : "—"}</span>
              <span className={weeklyFooterState === "over" ? "over-txt" : "on-track-txt"}>
                {weeklyFooterState === "none" ? "—" : weeklyFooterState === "over" ? "▼ Over" : "▲ On track"}
              </span>
            </div>
          </article>

          <div className="triple-row">
            <article className="card tdee-card">
              <div className="stat-label">TDEE ESTIMATE</div>
              {appState.tdee ? (
                <div className="tdee-value">
                  <span>{appState.tdee.toLocaleString()}</span>
                  <small>kcal/day</small>
                </div>
              ) : (
                <button type="button" className="setup-link" onClick={() => setShowOnboardingWizard(true)}>Not configured • Set up</button>
              )}
              {appState.tdee && (
                <div className="deficit-badge">
                  {appState.goalModifier >= 0 ? `+${appState.goalModifier}` : appState.goalModifier} modifier
                </div>
              )}
            </article>

            <article className="card water-card">
              <div className="water-top">
                <span>💧 Water</span>
                <span>{selectedDay.water || 0} / {appState.settings.waterGoal}</span>
              </div>
              <div className="water-circles">
                {Array.from({ length: appState.settings.waterGoal || 8 }).map((_, i) => (
                  <button
                    key={`water-${i + 1}`}
                    type="button"
                    className={(selectedDay.water || 0) >= i + 1 ? "fill" : ""}
                    onClick={() => adjustWater((selectedDay.water || 0) >= i + 1 ? i : i + 1)}
                  />
                ))}
              </div>
              <div className="water-buttons">
                <button type="button" onClick={() => adjustWater((selectedDay.water || 0) - 1)}>−</button>
                <button type="button" onClick={() => adjustWater((selectedDay.water || 0) + 1)}>+</button>
              </div>
            </article>

            <article className="card streak-card">
              <div>🔥 Streak</div>
              <div className="streak-value">{streaks.current} <span>days</span></div>
              <div className="small-muted">Personal best: {streaks.best}</div>
            </article>
          </div>
        </div>
      </section>

      <section className="meals-section">
        <div className="section-head">
          <h3>Today's Log</h3>
          <span>{totals.itemCount} items</span>
        </div>
        <div className="meal-grid">{selectedDay.meals.map((meal, idx) => renderMealCard(meal, idx))}</div>
      </section>

      {renderQuickAdd()}
    </>
  );

  const renderDiaryScreen = () => {
    const dayIsEmpty = selectedDay.meals.every((meal) => meal.items.length === 0);
    return (
      <>
        <article className="card diary-summary">
          <div className="summary-left">Total: {totals.calories} kcal</div>
          <div className="summary-bar">
            <div style={{ width: `${macroCalorieSum.sum ? (macroCalorieSum.p / macroCalorieSum.sum) * 100 : 0}%`, background: "#34d399" }} />
            <div style={{ width: `${macroCalorieSum.sum ? (macroCalorieSum.c / macroCalorieSum.sum) * 100 : 0}%`, background: "#fbbf24" }} />
            <div style={{ width: `${macroCalorieSum.sum ? (macroCalorieSum.f / macroCalorieSum.sum) * 100 : 0}%`, background: "#f472b6" }} />
          </div>
          <div className={`summary-right ${remainingCalories < 0 ? "over-txt" : "on-track-txt"}`}>
            Remaining: {goalsSet ? remainingCalories : "—"}
          </div>
        </article>
        <div className="diary-stack">
          {selectedDay.meals.map((meal) => {
            const mealName = getMealLabel(appState.settings, meal.id);
            const mealIcon = MEAL_META.find((item) => item.id === meal.id)?.icon || "•";
            const mealCals = Math.round(meal.items.reduce((sum, item) => sum + item.cals, 0));
            const expanded = expandedMeals[meal.id];
            return (
              <article className="card diary-meal" key={meal.id}>
                <button
                  type="button"
                  className="diary-head"
                  onClick={() => setExpandedMeals((prev) => ({ ...prev, [meal.id]: !prev[meal.id] }))}
                >
                  <span>{mealIcon} {mealName}</span>
                  <span>{mealCals} kcal</span>
                  <span>{expanded ? "▾" : "▸"}</span>
                </button>
                {expanded && (
                  <div className="diary-body">
                    {meal.items.map((item) => (
                      <div className="diary-row" key={item.id}>
                        <div>
                          <div>{item.name}</div>
                          <button type="button" className="inline-link" onClick={() => openEditItem(meal.id, item)}>
                            {item.servingText || `${item.amount} ${item.unit}`}
                          </button>
                        </div>
                        <div className="diary-macros">
                          <span className="pro">P:{roundTo(item.protein, 1)}</span>
                          <span className="carb">C:{roundTo(item.carbs, 1)}</span>
                          <span className="fat">F:{roundTo(item.fat, 1)}</span>
                          <span className="cal">{item.cals}k</span>
                        </div>
                        <div className="diary-actions">
                          <button type="button" onClick={() => openEditItem(meal.id, item)}>Edit</button>
                          <button type="button" onClick={() => deleteMealItem(meal.id, item.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="empty-meal-btn" onClick={() => openSearchOverlay(meal.id)}>+ Add Food</button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        {dayIsEmpty && appState.diaryByDate[addDays(appState.selectedDate, -1)] && (
          <button type="button" className="copy-link" onClick={copyYesterday}>📋 Copy meals from yesterday</button>
        )}
      </>
    );
  };

  const renderSearchScreen = () => (
    <section className="search-screen">
      <article className="card search-head-card">
        <div className="search-input-wrap">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search foods..."
          />
          <button type="button">⊞ Scan</button>
        </div>
        <div className="tab-row">
          <button type="button" className={searchTab === "all" ? "active" : ""} onClick={() => setSearchTab("all")}>Database</button>
          <button type="button" className={searchTab === "my" ? "active" : ""} onClick={() => setSearchTab("my")}>My Foods</button>
          <button type="button" className={searchTab === "favorites" ? "active" : ""} onClick={() => setSearchTab("favorites")}>Favorites ★</button>
          <button type="button" className="active-lite">Recent</button>
        </div>
      </article>
      <section className="search-grid">
        {filteredFoods.map((food) => (
          <article className="card search-food-card" key={foodKey(food)}>
            <div className="search-food-top">
              <div>
                <div className="name">{food.name}</div>
                <div className="meta">{food.per}</div>
              </div>
              <button type="button" onClick={() => toggleFavorite(food)}>
                {appState.favorites.includes(foodKey(food)) ? "★" : "☆"}
              </button>
            </div>
            <div className="search-calories">{food.cals} kcal</div>
            <div className="search-macros">
              <span className="pro">{food.protein}p</span>
              <span className="carb">{food.carbs}c</span>
              <span className="fat">{food.fat}f</span>
            </div>
            <button
              type="button"
              className="add-food-btn"
              onClick={() => {
                openSearchOverlay(defaultMealForTime(appState.settings.mealWindows));
                setSelectedFoodKey(foodKey(food));
              }}
            >
              Add
            </button>
          </article>
        ))}
      </section>
      <button type="button" className="dashed-full" onClick={() => setCreatingCustomFood((v) => !v)}>+ Create Custom Food</button>
      {creatingCustomFood && (
        <article className="card custom-form">
          <div className="custom-grid">
            <input value={customFoodDraft.name} onChange={(e) => setCustomFoodDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
            <input value={customFoodDraft.per} onChange={(e) => setCustomFoodDraft((p) => ({ ...p, per: e.target.value }))} placeholder="Serving size" />
            <input value={customFoodDraft.unit} onChange={(e) => setCustomFoodDraft((p) => ({ ...p, unit: e.target.value }))} placeholder="Unit" />
            <input value={customFoodDraft.baseServing} onChange={(e) => setCustomFoodDraft((p) => ({ ...p, baseServing: e.target.value }))} placeholder="Base amount" />
            <input value={customFoodDraft.cals} onChange={(e) => setCustomFoodDraft((p) => ({ ...p, cals: e.target.value }))} placeholder="Calories" />
            <input value={customFoodDraft.protein} onChange={(e) => setCustomFoodDraft((p) => ({ ...p, protein: e.target.value }))} placeholder="Protein" />
            <input value={customFoodDraft.carbs} onChange={(e) => setCustomFoodDraft((p) => ({ ...p, carbs: e.target.value }))} placeholder="Carbs" />
            <input value={customFoodDraft.fat} onChange={(e) => setCustomFoodDraft((p) => ({ ...p, fat: e.target.value }))} placeholder="Fat" />
          </div>
          <button type="button" className="primary-btn" onClick={saveCustomFood}>Save</button>
        </article>
      )}
    </section>
  );

  const renderProgressScreen = () => (
    <section className="screen-stack">
      <div className="period-pills">
        {["1W", "2W", "1M", "3M", "All"].map((range) => (
          <button key={range} type="button" className={progressRange === range ? "active" : ""} onClick={() => setProgressRange(range)}>
            {range}
          </button>
        ))}
      </div>
      <article className="card chart-card">
        <h3>Calorie Trend</h3>
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData.length ? progressData : [{ label: "Start", calories: 0 }]}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="calories" stroke="none" fill="rgba(192,132,252,0.1)" />
              <Line type="monotone" dataKey="calories" stroke="#c084fc" strokeWidth={2} dot={{ r: 3 }} />
              {goalsSet && <Line type="linear" dataKey={() => appState.goals.calories} stroke="#fbbf24" strokeDasharray="4 4" dot={false} />}
            </LineChart>
          </ResponsiveContainer>
          {!progressData.length && <div className="empty-overlay">Start logging to see your trends</div>}
        </div>
      </article>
      <article className="card chart-card">
        <h3>Macro Trend</h3>
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData.length ? progressData : [{ label: "Start", protein: 0, carbs: 0, fat: 0 }]}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="protein" stroke="#34d399" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="carbs" stroke="#fbbf24" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fat" stroke="#f472b6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );

  const renderGoalsScreen = () => (
    <section className="screen-stack">
      <article className="card">
        <h3>Current Targets</h3>
        <div className="goal-grid">
          {[
            { key: "calories", label: "Calories", color: "#c084fc", unit: "kcal" },
            { key: "protein", label: "Protein", color: "#34d399", unit: "g" },
            { key: "carbs", label: "Carbs", color: "#fbbf24", unit: "g" },
            { key: "fat", label: "Fat", color: "#f472b6", unit: "g" },
          ].map((goal) => (
            <div className="goal-input-card" key={goal.key}>
              <label style={{ color: goal.color }}>{goal.label}</label>
              <div className="goal-input-row">
                <input
                  value={appState.goals[goal.key] ?? ""}
                  onChange={(e) => updateGoalField(goal.key, e.target.value)}
                  type="number"
                  style={{ color: goal.color }}
                />
                <span>{goal.unit}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="toggle-row">
          <span>Auto-balance macros</span>
          <button
            type="button"
            className={`pill-switch ${appState.autoBalanceMacros ? "on" : ""}`}
            onClick={() => setAppState((prev) => ({ ...prev, autoBalanceMacros: !prev.autoBalanceMacros }))}
          >
            <span />
          </button>
        </div>
        <div className="stack-bar">
          <div style={{ width: `${macroCalorieSum.sum ? (macroCalorieSum.p / macroCalorieSum.sum) * 100 : 0}%`, background: "#34d399" }} />
          <div style={{ width: `${macroCalorieSum.sum ? (macroCalorieSum.c / macroCalorieSum.sum) * 100 : 0}%`, background: "#fbbf24" }} />
          <div style={{ width: `${macroCalorieSum.sum ? (macroCalorieSum.f / macroCalorieSum.sum) * 100 : 0}%`, background: "#f472b6" }} />
        </div>
        <div className="small-muted">
          Protein {macroCalorieSum.p} + Carbs {macroCalorieSum.c} + Fat {macroCalorieSum.f} = {macroCalorieSum.sum} kcal
        </div>
        {isMacroMismatch && <div className="warn">Macros don't add up to calorie target</div>}
      </article>

      <article className="card tdee-card">
        <h3>TDEE Reference</h3>
        <div className="tdee-value"><span>{appState.tdee || "—"}</span><small>kcal/day</small></div>
        <button type="button" className="setup-link" onClick={() => { setWizard((prev) => ({ ...prev, ...(appState.onboardingProfile || {}) })); setShowOnboardingWizard(true); }}>
          Recalculate TDEE
        </button>
      </article>

      <article className="card">
        <h3>Meal Timing Preferences</h3>
        <div className="timing-grid">
          {MEAL_META.map((meal) => (
            <div key={meal.id} className="timing-row">
              <span>{getMealLabel(appState.settings, meal.id)}</span>
              <input
                type="time"
                value={appState.settings.mealWindows[meal.id].start}
                onChange={(e) =>
                  setAppState((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      mealWindows: {
                        ...prev.settings.mealWindows,
                        [meal.id]: { ...prev.settings.mealWindows[meal.id], start: e.target.value },
                      },
                    },
                  }))
                }
              />
              <input
                type="time"
                value={appState.settings.mealWindows[meal.id].end}
                onChange={(e) =>
                  setAppState((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      mealWindows: {
                        ...prev.settings.mealWindows,
                        [meal.id]: { ...prev.settings.mealWindows[meal.id], end: e.target.value },
                      },
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </article>
    </section>
  );

  const renderBodyScreen = () => {
    const sorted = [...appState.bodyLog].sort((a, b) => (a.date < b.date ? -1 : 1));
    const start = sorted[0]?.weight || 0;
    const current = sorted[sorted.length - 1]?.weight || 0;
    const delta = roundTo(current - start, 1);
    return (
      <section className="screen-stack">
        <div className="section-head">
          <h3>Body Log</h3>
          <button type="button" className="primary-btn" onClick={() => setShowBodyLogForm((v) => !v)}>+ Log Weight</button>
        </div>
        {showBodyLogForm && (
          <article className="card body-form">
            <input type="date" value={bodyLogDraft.date} onChange={(e) => setBodyLogDraft((p) => ({ ...p, date: e.target.value }))} />
            <input type="number" placeholder={`Weight (${appState.settings.units === "imperial" ? "lbs" : "kg"})`} value={bodyLogDraft.weight} onChange={(e) => setBodyLogDraft((p) => ({ ...p, weight: e.target.value }))} />
            <input placeholder="Note (optional)" value={bodyLogDraft.note} onChange={(e) => setBodyLogDraft((p) => ({ ...p, note: e.target.value }))} />
            <button type="button" className="primary-btn" onClick={saveBodyLog}>Save</button>
          </article>
        )}
        <article className="card chart-card">
          <h3>Weight Trend</h3>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sorted.map((row) => ({ ...row, label: new Date(`${row.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }) }))}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#22d3ee" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            {!sorted.length && <div className="empty-overlay">Log weight to see trend</div>}
          </div>
        </article>
        <div className="stats-grid body-stats">
          <article className="card"><div className="stat-label">Starting</div><div className="body-num">{start || "—"}</div></article>
          <article className="card"><div className="stat-label">Current</div><div className="body-num">{current || "—"}</div></article>
          <article className="card"><div className="stat-label">Change</div><div className={`body-num ${delta <= 0 ? "on-track-txt" : "over-txt"}`}>{Number.isFinite(delta) ? delta : "—"}</div></article>
        </div>
        <article className="card">
          <h3>Entries</h3>
          <div className="table-wrap">
            {sorted.map((row, idx) => (
              <div key={row.id} className="table-row">
                <span>{row.date}</span>
                <span>{row.weight}</span>
                <span>{idx ? roundTo(row.weight - sorted[idx - 1].weight, 1) : "—"}</span>
                <span>{row.note || "—"}</span>
              </div>
            ))}
            {!sorted.length && <div className="empty-subtle">No body entries yet.</div>}
          </div>
        </article>
      </section>
    );
  };

  const renderSettingsScreen = () => (
    <section className="screen-stack">
      <article className="card">
        <h3>Appearance</h3>
        <div className="theme-grid">
          <button type="button" className={`theme-card ${appState.settings.theme === "cosmic" ? "active" : ""}`} onClick={() => setAppState((prev) => ({ ...prev, settings: { ...prev.settings, theme: "cosmic" } }))}>
            Cosmic
          </button>
          <button type="button" className={`theme-card ${appState.settings.theme === "solar" ? "active" : ""}`} onClick={() => setAppState((prev) => ({ ...prev, settings: { ...prev.settings, theme: "solar" } }))}>
            Solar <small>Coming soon</small>
          </button>
        </div>
      </article>
      <article className="card">
        <h3>Preferences</h3>
        <div className="pref-row">
          <span>Units</span>
          <div className="pill-group">
            <button type="button" className={appState.settings.units === "imperial" ? "active" : ""} onClick={() => convertUnits("imperial")}>Imperial</button>
            <button type="button" className={appState.settings.units === "metric" ? "active" : ""} onClick={() => convertUnits("metric")}>Metric</button>
          </div>
        </div>
        <div className="pref-row">
          <span>Default water goal</span>
          <input
            type="number"
            value={appState.settings.waterGoal}
            onChange={(e) =>
              setAppState((prev) => ({
                ...prev,
                settings: { ...prev.settings, waterGoal: Math.max(1, Number(e.target.value) || 8) },
              }))
            }
          />
        </div>
        {MEAL_META.map((meal) => (
          <div key={meal.id} className="pref-row">
            <span>{meal.fallbackName} name</span>
            <input value={getMealLabel(appState.settings, meal.id)} onChange={(e) => setMealName(meal.id, e.target.value)} />
          </div>
        ))}
        <div className="pref-row">
          <span>Daily reminder</span>
          <button
            type="button"
            className={`pill-switch ${appState.settings.notificationsEnabled ? "on" : ""}`}
            onClick={() =>
              setAppState((prev) => ({
                ...prev,
                settings: { ...prev.settings, notificationsEnabled: !prev.settings.notificationsEnabled },
              }))
            }
          >
            <span />
          </button>
          <input
            type="time"
            value={appState.settings.notificationTime}
            onChange={(e) => setAppState((prev) => ({ ...prev, settings: { ...prev.settings, notificationTime: e.target.value } }))}
          />
        </div>
      </article>
      <article className="card">
        <h3>Data Management</h3>
        <div className="button-row">
          <button type="button" className="ghost-add">Export Diary as CSV</button>
          <button type="button" className="danger-outline" onClick={() => setShowClearDataConfirm(true)}>Clear All Data</button>
        </div>
      </article>
      <article className="card">
        <h3>Account</h3>
        <div className="pref-row">
          <span>Display name</span>
          <input value={appState.settings.displayName} onChange={(e) => setAppState((prev) => ({ ...prev, settings: { ...prev.settings, displayName: e.target.value } }))} />
        </div>
        <div className="pref-row">
          <span>Email</span>
          <input value={appState.settings.email} readOnly />
        </div>
        <div className="button-row">
          <button type="button" className="ghost-add">Change Password</button>
          <button type="button" className="danger-outline" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
        <button type="button" className="setup-link" onClick={() => setShowOnboardingWizard(true)}>Recalculate TDEE</button>
      </article>
    </section>
  );

  const renderScreen = () => {
    if (activeScreen === "dashboard") return renderDashboard();
    if (activeScreen === "diary") return renderDiaryScreen();
    if (activeScreen === "search") return renderSearchScreen();
    if (activeScreen === "progress") return renderProgressScreen();
    if (activeScreen === "goals") return renderGoalsScreen();
    if (activeScreen === "body") return renderBodyScreen();
    return renderSettingsScreen();
  };

  return (
    <AuthGuard>
      <div className={`cosmic-root ${appState.settings.theme === "solar" ? "solar" : ""}`}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@300;400&family=Outfit:wght@200;300;400;600;800;900&display=swap" />
      <canvas ref={canvasRef} className="star-canvas" />
      <div className="orb orb-one" />
      <div className="orb orb-two" />

      <aside className="cosmic-sidebar">
        <div className="brand-icon">N</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`side-nav-btn ${activeScreen === item.id ? "active" : ""}`}
            onClick={() => setActiveScreen(item.id)}
          >
            {activeScreen === item.id && <span className="active-indicator" />}
            <span>{item.icon}</span>
          </button>
        ))}
        <div className="sidebar-spacer" />
        <div className="avatar">{(appState.settings.displayName || "GM").slice(0, 2).toUpperCase()}</div>
      </aside>

      <main className="cosmic-main">
        <div className="cosmic-content">
          <header className="top-header">
            <div>
              <h1>NutriTrack</h1>
              <p>FUEL YOUR POTENTIAL</p>
            </div>
            <div className="header-center">{renderDateNavigator()}</div>
            <div className="header-right">
              <div className="clock-pill">{clock}</div>
              <button type="button" className="primary-btn" onClick={() => openSearchOverlay(null)}>+ Log Food</button>
            </div>
          </header>

          {renderScreen()}
        </div>
      </main>

      <nav className="bottom-tabs">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} type="button" className={activeScreen === item.id ? "active" : ""} onClick={() => setActiveScreen(item.id)}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>

      <button type="button" className="fab-log" onClick={() => openSearchOverlay(null)}>+</button>

      {recentAchievement && (
        <button type="button" className="achievement-fab" onClick={() => setShowAchievementsPanel(true)}>
          🏆 {recentAchievement.name}
        </button>
      )}

      {searchOverlayOpen && (
        <div className="overlay" onClick={closeSearchOverlay}>
          <section className={`search-panel ${selectedFood ? "serving-open" : ""}`} onClick={(e) => e.stopPropagation()}>
            {!selectedFood ? (
              <>
                <div className="panel-head">
                  <h3>Log Food</h3>
                  <button type="button" onClick={closeSearchOverlay}>×</button>
                </div>
                <div className="meal-pill-row">
                  {MEAL_META.map((meal) => (
                    <button key={meal.id} type="button" className={searchMeal === meal.id ? "active" : ""} onClick={() => setSearchMeal(meal.id)}>
                      {getMealLabel(appState.settings, meal.id)}
                    </button>
                  ))}
                </div>
                <div className="search-input-wrap">
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search foods..." autoFocus />
                  <button type="button">⊞</button>
                </div>
                <div className="tab-row">
                  <button type="button" className={searchTab === "all" ? "active" : ""} onClick={() => setSearchTab("all")}>All Foods</button>
                  <button type="button" className={searchTab === "my" ? "active" : ""} onClick={() => setSearchTab("my")}>My Foods</button>
                  <button type="button" className={searchTab === "favorites" ? "active" : ""} onClick={() => setSearchTab("favorites")}>Favorites ★</button>
                </div>
                <div className="results-scroll">
                  {searchTab === "all" && !searchTerm && appState.recents.length > 0 && (
                    <>
                      <div className="subhead">Recent</div>
                      {appState.recents.map((key) => {
                        const food = getFoodByKey(allFoods, key);
                        if (!food) return null;
                        return (
                          <button type="button" className="result-row" key={`recent-${key}`} onClick={() => setSelectedFoodKey(foodKey(food))}>
                            <div><strong>{food.name}</strong><small>{food.per}</small></div>
                            <div className="macro-inline"><span className="cal">{food.cals}</span><span className="pro">{food.protein}p</span><span className="carb">{food.carbs}c</span><span className="fat">{food.fat}f</span></div>
                          </button>
                        );
                      })}
                      <div className="subhead">Database</div>
                    </>
                  )}
                  {filteredFoods.map((food) => (
                    <button type="button" className="result-row" key={foodKey(food)} onClick={() => setSelectedFoodKey(foodKey(food))}>
                      <div>
                        <strong>{food.name}</strong>
                        <small>{food.per}</small>
                      </div>
                      <div className="macro-inline">
                        <span className="cal">{food.cals}</span>
                        <span className="pro">{food.protein}p</span>
                        <span className="carb">{food.carbs}c</span>
                        <span className="fat">{food.fat}f</span>
                      </div>
                      <span className="favorite-toggle" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(food); }}>{appState.favorites.includes(foodKey(food)) ? "★" : "☆"}</span>
                    </button>
                  ))}
                  {!filteredFoods.length && <div className="empty-subtle">No foods found.</div>}
                </div>
                <button type="button" className="dashed-full" onClick={() => { setCreatingCustomFood(true); setActiveScreen("search"); closeSearchOverlay(); }}>
                  + Create Custom Food
                </button>
              </>
            ) : (
              <>
                <div className="panel-head">
                  <button type="button" className="inline-link" onClick={() => { setSelectedFoodKey(null); setEditingItem(null); }}>← Back</button>
                  <h3>{selectedFood.name}</h3>
                  <span />
                </div>
                <article className="card nutrition-hero">
                  <div className="big-cals">{scaledFoodMacros.cals}</div>
                  <div className="small-muted">kcal</div>
                  <div className="macro-hero-row">
                    <div><strong className="pro">{scaledFoodMacros.protein}</strong><small>Protein</small></div>
                    <div><strong className="carb">{scaledFoodMacros.carbs}</strong><small>Carbs</small></div>
                    <div><strong className="fat">{scaledFoodMacros.fat}</strong><small>Fat</small></div>
                  </div>
                </article>
                <div className="meal-pill-row">
                  {(selectedFood.units || [selectedFood.baseUnit]).map((unit) => (
                    <button key={unit} type="button" className={selectedUnit === unit ? "active" : ""} onClick={() => setSelectedUnit(unit)}>
                      {unit}
                    </button>
                  ))}
                </div>
                <div className="amount-wrap">
                  <input type="number" step="0.1" value={selectedAmount} onChange={(e) => setSelectedAmount(Number(e.target.value) || 0)} />
                </div>
                <div className="meal-pill-row">
                  {[0.5, 1, 1.5, 2].map((mul) => (
                    <button
                      key={mul}
                      type="button"
                      className={selectedMultiplier === mul ? "active" : ""}
                      onClick={() => {
                        setSelectedMultiplier(mul);
                        setSelectedAmount(roundTo((selectedFood.baseServing || 1) * mul, 2));
                      }}
                    >
                      {mul}×
                    </button>
                  ))}
                </div>
                <input
                  className="slider"
                  type="range"
                  min={0.25}
                  max={5}
                  step={0.25}
                  value={(selectedFood.baseServing ? selectedAmount / selectedFood.baseServing : 1)}
                  onChange={(e) => setSelectedAmount(roundTo((selectedFood.baseServing || 1) * Number(e.target.value), 2))}
                />
                <button type="button" className="primary-btn full" onClick={() => addFoodToMeal("close")}>
                  {editingItem ? "Update" : "Add to"} {getMealLabel(appState.settings, searchMeal)} — {scaledFoodMacros.cals} kcal
                </button>
                <button type="button" className="inline-link center" onClick={() => addFoodToMeal("continue")}>Add & Continue</button>
              </>
            )}
          </section>
        </div>
      )}
      {showOnboardingWizard && (
        <div className="overlay modal-overlay" onClick={() => {}}>
          <section className="wizard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wizard-dots">
              {[1, 2, 3, 4].map((step) => <i key={step} className={onboardingStep === step ? "active" : ""} />)}
            </div>
            {onboardingStep === 1 && (
              <div className="wizard-step">
                <h2>About You</h2>
                <input value={wizard.name} onChange={(e) => setWizard((prev) => ({ ...prev, name: e.target.value }))} placeholder="Display name" />
                <div className="pill-group">
                  <button type="button" className={wizard.sex === "male" ? "active" : ""} onClick={() => setWizard((prev) => ({ ...prev, sex: "male" }))}>Male</button>
                  <button type="button" className={wizard.sex === "female" ? "active" : ""} onClick={() => setWizard((prev) => ({ ...prev, sex: "female" }))}>Female</button>
                </div>
                <input type="number" value={wizard.age} onChange={(e) => setWizard((prev) => ({ ...prev, age: e.target.value }))} placeholder="Age" />
                {wizard.units === "imperial" ? (
                  <div className="inline-two">
                    <input type="number" value={wizard.heightFt} onChange={(e) => setWizard((prev) => ({ ...prev, heightFt: e.target.value }))} placeholder="Feet" />
                    <input type="number" value={wizard.heightIn} onChange={(e) => setWizard((prev) => ({ ...prev, heightIn: e.target.value }))} placeholder="Inches" />
                  </div>
                ) : (
                  <input type="number" value={wizard.heightCm} onChange={(e) => setWizard((prev) => ({ ...prev, heightCm: e.target.value }))} placeholder="Height (cm)" />
                )}
                <input type="number" value={wizard.weight} onChange={(e) => setWizard((prev) => ({ ...prev, weight: e.target.value }))} placeholder={`Weight (${wizard.units === "imperial" ? "lbs" : "kg"})`} />
                <button type="button" className="inline-link" onClick={() => setWizard((prev) => ({ ...prev, units: prev.units === "imperial" ? "metric" : "imperial" }))}>
                  Switch to {wizard.units === "imperial" ? "metric" : "imperial"}
                </button>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="wizard-step">
                <h2>Activity Level</h2>
                {ACTIVITY_OPTIONS.map((option) => (
                  <button key={option.label} type="button" className={`activity-card ${wizard.activity === option.value ? "active" : ""}`} onClick={() => setWizard((prev) => ({ ...prev, activity: option.value }))}>
                    <div>
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </div>
                    {wizard.activity === option.value ? "OK" : ""}
                  </button>
                ))}
              </div>
            )}
            {onboardingStep === 3 && (
              <div className="wizard-step">
                <h2>Your Goal</h2>
                <div className="goal-mode-row">
                  <button type="button" className={wizard.goalMode === "lose" ? "active" : ""} onClick={() => setWizard((prev) => ({ ...prev, goalMode: "lose", modifier: -250 }))}>Lose</button>
                  <button type="button" className={wizard.goalMode === "maintain" ? "active" : ""} onClick={() => setWizard((prev) => ({ ...prev, goalMode: "maintain", modifier: 0 }))}>Maintain</button>
                  <button type="button" className={wizard.goalMode === "gain" ? "active" : ""} onClick={() => setWizard((prev) => ({ ...prev, goalMode: "gain", modifier: 250 }))}>Gain</button>
                </div>
                {wizard.goalMode !== "maintain" && (
                  <div className="pill-group">
                    {(wizard.goalMode === "lose" ? [-250, -500, -750] : [250, 500]).map((value) => (
                      <button key={value} type="button" className={wizard.modifier === value ? "active" : ""} onClick={() => setWizard((prev) => ({ ...prev, modifier: value }))}>
                        {value > 0 ? `+${value}` : value}
                      </button>
                    ))}
                  </div>
                )}
                <div className="preview-callout">Your daily target: {wizardPreview.targetCalories.toLocaleString()} kcal</div>
              </div>
            )}
            {onboardingStep === 4 && (
              <div className="wizard-step">
                <h2>Your Plan</h2>
                <div className="plan-num">TDEE: {wizardPreview.tdee.toLocaleString()} kcal/day</div>
                <div className="plan-target">{wizardPreview.targetCalories.toLocaleString()} kcal/day</div>
                <div className="macro-lines">
                  <div>Protein: {wizardPreview.protein}g</div>
                  <div>Carbs: {wizardPreview.carbs}g</div>
                  <div>Fat: {wizardPreview.fat}g</div>
                </div>
                <div className="stack-bar">
                  <div style={{ width: `${(wizardPreview.protein * 4 / wizardPreview.targetCalories) * 100}%`, background: "#34d399" }} />
                  <div style={{ width: `${(wizardPreview.carbs * 4 / wizardPreview.targetCalories) * 100}%`, background: "#fbbf24" }} />
                  <div style={{ width: `${(wizardPreview.fat * 9 / wizardPreview.targetCalories) * 100}%`, background: "#f472b6" }} />
                </div>
                <button type="button" className="primary-btn full" onClick={applyWizard}>Confirm & Start Tracking</button>
              </div>
            )}
            <div className="wizard-actions">
              <button type="button" className="ghost-add" onClick={() => setOnboardingStep((step) => clamp(step - 1, 1, 4))}>Back</button>
              {onboardingStep < 4 && (
                <button type="button" className="primary-btn" onClick={() => setOnboardingStep((step) => clamp(step + 1, 1, 4))}>Next</button>
              )}
            </div>
            <button type="button" className="skip-link" onClick={skipWizard}>Skip with defaults</button>
          </section>
        </div>
      )}

      {showAchievementsPanel && (
        <div className="overlay" onClick={() => setShowAchievementsPanel(false)}>
          <section className="achievement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <h3>Achievements</h3>
              <button type="button" onClick={() => setShowAchievementsPanel(false)}>x</button>
            </div>
            <div className="achieve-grid">
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = appState.achievements.includes(achievement.id);
                return (
                  <article key={achievement.id} className={`achieve-card ${unlocked ? "unlocked" : "locked"}`}>
                    <div className="icon">{achievement.icon}</div>
                    <div>{achievement.name}</div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {showClearDataConfirm && (
        <div className="overlay" onClick={() => setShowClearDataConfirm(false)}>
          <section className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Clear all data?</h3>
            <p>This will erase diary entries, custom foods, and goals.</p>
            <div className="button-row">
              <button type="button" className="ghost-add" onClick={() => setShowClearDataConfirm(false)}>Cancel</button>
              <button
                type="button"
                className="danger-outline"
                onClick={() => {
                  setAppState((prev) => ({
                    ...INITIAL_STATE,
                    selectedDate: prev.selectedDate,
                    settings: prev.settings,
                    diaryByDate: { [prev.selectedDate]: createEmptyDay() },
                  }));
                  setShowClearDataConfirm(false);
                }}
              >
                Clear Everything
              </button>
            </div>
          </section>
        </div>
      )}

      <div className="toast-stack">
        {toasts.map((toast) => (
          <article key={toast.id} className={`toast ${toast.type || "success"}`}>
            <div>{toast.message}</div>
            <div className="toast-actions">
              {toast.undo && <button type="button" onClick={toast.undo}>Undo</button>}
              <button type="button" onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}>x</button>
            </div>
          </article>
        ))}
      </div>

      <div key={confettiSeed} className="confetti-layer">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={`confetti-${i}`}
            style={{
              left: `${10 + i * 7}%`,
              background: ["#c084fc", "#34d399", "#fbbf24", "#f472b6", "#22d3ee"][i % 5],
              animationDelay: `${i * 40}ms`,
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        :root {
          --bg-void: #050510;
          --bg-nebula: #1a0a2e;
          --bg-space: #0a0a1a;
          --text-primary: #e8e0f0;
          --text-muted: rgba(255, 255, 255, 0.35);
          --text-dim: rgba(255, 255, 255, 0.25);
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.06);
        }
        .cosmic-root {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          color: var(--text-primary);
          font-family: "DM Sans", sans-serif;
          background: radial-gradient(ellipse at 20% 20%, var(--bg-nebula) 0%, var(--bg-space) 40%, var(--bg-void) 100%);
        }
        .cosmic-root.solar {
          --bg-void: #f5f7ff;
          --bg-nebula: #f0ecff;
          --bg-space: #e9efff;
          --text-primary: #1b1536;
          --text-muted: rgba(29, 18, 60, 0.45);
          --text-dim: rgba(29, 18, 60, 0.25);
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(130, 120, 170, 0.2);
        }
        .star-canvas { position: absolute; inset: 0; opacity: 0.6; pointer-events: none; }
        .orb { position: absolute; border-radius: 999px; pointer-events: none; }
        .orb-one {
          width: 400px;
          height: 400px;
          top: -100px;
          right: -100px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
        }
        .orb-two {
          width: 500px;
          height: 500px;
          left: -50px;
          bottom: -150px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%);
        }
        .card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .cosmic-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px 0;
          background: rgba(255, 255, 255, 0.03);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          z-index: 20;
        }
        .brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          font-family: "Outfit", sans-serif;
          font-weight: 800;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
          margin-bottom: 24px;
        }
        .side-nav-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.35);
          position: relative;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .side-nav-btn:hover { background: rgba(255, 255, 255, 0.06); }
        .side-nav-btn.active { background: rgba(139, 92, 246, 0.2); color: #c084fc; }
        .active-indicator {
          position: absolute;
          width: 3px;
          height: 20px;
          border-radius: 2px;
          left: -14px;
          top: 12px;
          background: #8b5cf6;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.6);
        }
        .sidebar-spacer { flex: 1; }
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #374151, #1f2937);
          border: 2px solid rgba(139, 92, 246, 0.3);
          font-size: 12px;
          font-weight: 600;
        }
        .cosmic-main {
          margin-left: 72px;
          padding: clamp(20px, 2.4vw, 32px) clamp(20px, 3vw, 42px) clamp(30px, 4vw, 48px);
          height: 100vh;
          overflow-y: auto;
          position: relative;
          z-index: 2;
        }
        .cosmic-content {
          width: min(1360px, 100%);
          margin: 0 auto;
        }
        .top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }
        .top-header h1 {
          margin: 0;
          font-family: "Outfit", sans-serif;
          font-size: clamp(28px, 3vw, 42px);
          line-height: 1;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 0%, #c084fc 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .top-header p {
          margin: 6px 0 0;
          font-family: "DM Mono", monospace;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          font-size: 13px;
        }
        .header-center { flex: 1; display: flex; justify-content: center; }
        .date-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
        }
        .date-nav button, .today-pill {
          border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          border-radius: 8px;
          padding: 4px 8px;
          cursor: pointer;
        }
        .today-pill { background: rgba(139, 92, 246, 0.15); color: #c084fc; font-size: 11px; }
        .date-nav span { font-size: 14px; font-weight: 500; }
        .header-right { display: flex; gap: 12px; align-items: center; }
        .clock-pill {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          font-family: "DM Mono", monospace;
          font-size: 13px;
          color: var(--text-muted);
        }
        .primary-btn {
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.35);
          transition: all 0.2s ease;
        }
        .primary-btn:hover { filter: brightness(1.1); }
        .primary-btn:active { transform: scale(0.97); }
        .primary-btn.full { width: 100%; }
        .onboarding-banner {
          border-radius: 16px;
          padding: 16px 24px;
          margin-bottom: 20px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(236, 72, 153, 0.04));
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          animation: borderPulse 3s ease infinite;
        }
        .banner-title { font-weight: 500; font-size: 15px; }
        .banner-copy { color: var(--text-muted); font-size: 12px; margin-top: 2px; }
        .onboarding-banner button {
          border: none;
          border-radius: 10px;
          padding: 8px 18px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: #fff;
          cursor: pointer;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-card { padding: 18px 20px; border-radius: 16px; border: 1px solid; }
        .fade-slide { opacity: 0; transform: translateY(16px); animation: fadeSlideUp 0.6s ease forwards; }
        .stat-label {
          margin-bottom: 8px;
          font-size: 11px;
          font-family: "DM Mono", monospace;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.45);
        }
        .stat-value-row { display: flex; align-items: baseline; gap: 8px; }
        .stat-value {
          font-size: clamp(24px, 2.5vw, 32px);
          line-height: 1;
          font-family: "Outfit", sans-serif;
          font-weight: 800;
        }
        .stat-unit { color: rgba(255, 255, 255, 0.3); font-family: "DM Mono", monospace; font-size: 12px; }
        .dashboard-grid { display: grid; grid-template-columns: minmax(320px, 400px) minmax(0, 1fr); gap: 16px; margin-bottom: 18px; }
        .orbit-card { border-radius: 20px; padding: 22px 22px 18px; }
        .card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .card-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
        .card-head span { color: var(--text-muted); font-family: "DM Mono", monospace; font-size: 11px; }
        .orbit-shell { position: relative; display: grid; place-items: center; }
        .orbit-svg { width: min(100%, 280px); max-width: 280px; }
        .orbit-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); text-align: center; }
        .orbit-number { font-family: "Outfit", sans-serif; font-size: clamp(30px, 3vw, 38px); font-weight: 900; line-height: 1; }
        .orbit-number.over { color: #ff6b6b; }
        .orbit-label {
          margin-top: 4px;
          font-size: 10px;
          font-family: "DM Mono", monospace;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.4);
        }
        .orbit-label.setup { color: #c084fc; }
        .orbit-goals-link {
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.25);
          font-family: "Outfit", sans-serif;
          font-size: 38px;
          cursor: pointer;
        }
        .orbit-legend { display: flex; justify-content: center; gap: 24px; margin-top: 12px; color: var(--text-muted); font-family: "DM Mono", monospace; font-size: 11px; }
        .orbit-legend span { display: inline-flex; align-items: center; gap: 6px; }
        .orbit-legend i { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
        .right-stack { display: flex; flex-direction: column; gap: 16px; }
        .weekly-card, .chart-card { padding: 22px 24px; border-radius: 20px; }
        .bars-wrap { position: relative; display: flex; align-items: end; gap: 6px; height: 64px; margin-top: 4px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; justify-content: end; align-items: center; gap: 6px; height: 100%; }
        .bar-inner {
          width: 100%;
          border-radius: 4px;
          background: linear-gradient(to top, #c084fc, #818cf8);
          opacity: 0.85;
          min-height: 0;
          transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: fadeSlideUp 0.6s ease both;
        }
        .bar-inner.over { background: linear-gradient(to top, #ff6b6b, #ee5a5a); }
        .bar-inner.today { opacity: 1; box-shadow: 0 0 8px rgba(192, 132, 252, 0.35); }
        .bar-col span { font-family: "DM Mono", monospace; font-size: 9px; color: rgba(255, 255, 255, 0.4); }
        .bar-col span.today-day { color: #c084fc; }
        .weekly-footer {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-family: "DM Mono", monospace;
          color: var(--text-muted);
        }
        .on-track-txt { color: #34d399; }
        .over-txt { color: #ff6b6b; }
        .empty-overlay, .empty-subtle { color: var(--text-muted); font-family: "DM Mono", monospace; font-size: 10px; text-align: center; }
        .empty-overlay { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); pointer-events: none; }
        .triple-row { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 12px; }
        .tdee-card { padding: 20px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.08)); border-color: rgba(139, 92, 246, 0.15); }
        .tdee-value { display: flex; align-items: baseline; gap: 6px; margin-top: 6px; }
        .tdee-value span { font-family: "Outfit", sans-serif; font-size: clamp(24px, 2.4vw, 30px); font-weight: 800; }
        .tdee-value small { color: var(--text-muted); font-size: 13px; }
        .deficit-badge { margin-top: 8px; border-radius: 10px; display: inline-block; padding: 8px 14px; background: rgba(52, 211, 153, 0.15); color: #34d399; font-size: 12px; font-weight: 600; }
        .setup-link { border: none; background: transparent; color: #c084fc; cursor: pointer; padding: 0; margin-top: 8px; }
        .water-card, .streak-card { padding: 16px 18px; }
        .water-top { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
        .water-circles { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; margin-bottom: 8px; }
        .water-circles button {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.06);
          cursor: pointer;
        }
        .water-circles button.fill { background: #22d3ee; box-shadow: 0 0 6px rgba(34, 211, 238, 0.4); }
        .water-buttons { display: flex; gap: 8px; }
        .water-buttons button {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--text-primary);
          cursor: pointer;
        }
        .streak-value { font-family: "Outfit", sans-serif; font-size: 24px; font-weight: 800; color: #f59e0b; animation: flamePulse 1s ease infinite; }
        .streak-value span { color: var(--text-muted); font-size: 11px; font-family: "DM Mono", monospace; margin-left: 4px; }
        .small-muted { color: var(--text-dim); font-size: 10px; font-family: "DM Mono", monospace; }
        .meals-section { margin-top: 16px; }
        .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .section-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
        .section-head span { font-size: 11px; font-family: "DM Mono", monospace; color: var(--text-dim); }
        .section-head button { background: none; border: none; color: #c084fc; cursor: pointer; font-size: 11px; }
        .meal-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        .meal-card { padding: 18px 16px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); }
        .meal-card-head { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; font-weight: 600; }
        .meal-card-head span:last-child { font-family: "DM Mono", monospace; font-size: 12px; color: rgba(255, 255, 255, 0.35); }
        .meal-card-head span.meal-zero { color: rgba(255, 255, 255, 0.15); }
        .empty-meal-btn {
          width: 100%;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 16px 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.2);
          cursor: pointer;
        }
        .meal-items-col { display: flex; flex-direction: column; gap: 8px; }
        .meal-item-row { display: flex; justify-content: space-between; gap: 8px; padding: 10px 12px; border-radius: 10px; background: rgba(255, 255, 255, 0.04); }
        .meal-item-name { font-size: 12px; font-weight: 500; }
        .meal-item-serving { margin-top: 2px; font-family: "DM Mono", monospace; font-size: 10px; color: rgba(255, 255, 255, 0.25); }
        .meal-item-actions { display: flex; align-items: center; gap: 6px; font-size: 10px; }
        .meal-item-actions .cal { color: #c084fc; font-family: "DM Mono", monospace; }
        .meal-item-actions button { border: none; background: transparent; color: var(--text-muted); cursor: pointer; }
        .meal-item-actions button.danger:hover { color: #ff6b6b; }
        .ghost-add {
          margin-top: 8px;
          width: 100%;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px;
          background: none;
          color: rgba(255, 255, 255, 0.35);
          cursor: pointer;
        }
        .quick-add-wrap { padding: 14px; }
        .quick-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scroll-snap-type: x mandatory; }
        .quick-chip {
          min-width: 120px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          border-radius: 12px;
          padding: 10px 14px;
          text-align: left;
          position: relative;
          color: var(--text-primary);
          cursor: pointer;
          scroll-snap-align: start;
          transition: all 0.2s ease;
        }
        .quick-chip:hover { border-color: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }
        .quick-chip:active { transform: scale(0.96); }
        .quick-name { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .quick-cal { margin-top: 4px; color: #c084fc; font-family: "DM Mono", monospace; font-size: 11px; }
        .quick-plus { position: absolute; top: 8px; right: 10px; color: rgba(255, 255, 255, 0.3); }
        .screen-stack { display: flex; flex-direction: column; gap: 16px; }
        .diary-summary, .search-head-card, .body-form { padding: 16px 20px; }
        .summary-left { font-family: "Outfit", sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 10px; }
        .summary-bar, .stack-bar { width: 100%; height: 8px; border-radius: 999px; overflow: hidden; display: flex; margin-bottom: 10px; background: rgba(255, 255, 255, 0.08); }
        .summary-right { font-family: "DM Mono", monospace; font-size: 13px; }
        .diary-stack { display: flex; flex-direction: column; gap: 12px; }
        .diary-meal { overflow: hidden; }
        .diary-head { width: 100%; border: none; background: transparent; color: var(--text-primary); padding: 16px 20px; display: flex; justify-content: space-between; cursor: pointer; }
        .diary-body { padding: 0 0 12px; }
        .diary-row { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 14px 20px; border-top: 1px solid rgba(255, 255, 255, 0.03); }
        .inline-link { border: none; background: none; color: #c084fc; cursor: pointer; padding: 0; font-size: 12px; text-decoration: underline dotted; }
        .inline-link.center { display: block; margin: 8px auto 0; text-decoration: none; }
        .diary-macros { display: flex; gap: 8px; font-size: 12px; font-family: "DM Mono", monospace; }
        .diary-macros .pro { color: #34d399; }
        .diary-macros .carb { color: #fbbf24; }
        .diary-macros .fat { color: #f472b6; }
        .diary-macros .cal { color: #c084fc; }
        .diary-actions button { margin-left: 6px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 12px; }
        .copy-link { border: none; background: none; color: #c084fc; cursor: pointer; text-align: left; font-size: 13px; }
        .search-screen { display: flex; flex-direction: column; gap: 16px; }
        .search-input-wrap { display: flex; align-items: center; gap: 8px; width: 100%; }
        .search-input-wrap input {
          width: 100%;
          border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
          border-radius: 12px;
          padding: 12px 14px;
          outline: none;
          font-size: 16px;
        }
        .search-input-wrap input:focus { border-color: rgba(139, 92, 246, 0.4); }
        .search-input-wrap button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--text-muted);
          cursor: pointer;
        }
        .tab-row, .pill-group, .meal-pill-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
        .tab-row button, .pill-group button, .meal-pill-row button, .period-pills button, .goal-mode-row button {
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          padding: 7px 12px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
        }
        .tab-row button.active, .pill-group button.active, .meal-pill-row button.active, .period-pills button.active, .goal-mode-row button.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.3);
          color: #c084fc;
        }
        .tab-row button:hover, .pill-group button:hover, .meal-pill-row button:hover, .period-pills button:hover { filter: brightness(1.05); }
        .tab-row button:active, .pill-group button:active, .meal-pill-row button:active, .period-pills button:active { transform: scale(0.97); }
        .search-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .search-food-card { padding: 16px; }
        .search-food-top { display: flex; justify-content: space-between; gap: 8px; }
        .search-food-top .name { font-size: 15px; font-weight: 600; }
        .search-food-top .meta { color: var(--text-muted); font-size: 11px; font-family: "DM Mono", monospace; }
        .search-food-top button { border: none; background: none; color: var(--text-muted); cursor: pointer; font-size: 16px; }
        .search-food-top button:hover { transform: scale(1.15); color: #f59e0b; }
        .search-calories { margin-top: 8px; font-family: "Outfit", sans-serif; font-weight: 700; font-size: 22px; color: #c084fc; }
        .search-macros { margin-top: 6px; display: flex; gap: 8px; font-family: "DM Mono", monospace; font-size: 12px; }
        .search-macros .pro { color: #34d399; }
        .search-macros .carb { color: #fbbf24; }
        .search-macros .fat { color: #f472b6; }
        .add-food-btn { margin-top: 10px; width: 100%; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.04); color: var(--text-primary); padding: 8px; cursor: pointer; }
        .dashed-full { width: 100%; border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.2); background: transparent; color: var(--text-muted); padding: 12px; cursor: pointer; }
        .dashed-full:hover { border-color: rgba(255, 255, 255, 0.3); }
        .custom-form { padding: 16px; }
        .custom-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
        .custom-grid input, .goal-input-card input, .timing-row input, .pref-row input, .wizard-step input, .body-form input {
          border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          color: var(--text-primary);
          padding: 10px 12px;
          outline: none;
        }
        .custom-grid input:focus, .goal-input-card input:focus, .timing-row input:focus, .pref-row input:focus, .wizard-step input:focus, .body-form input:focus { border-color: rgba(139, 92, 246, 0.45); }
        .period-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .chart-shell { position: relative; height: 240px; margin-top: 8px; }
        .goal-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
        .goal-input-card { border-radius: 14px; border: 1px solid var(--glass-border); padding: 14px; background: rgba(255, 255, 255, 0.02); }
        .goal-input-card label { display: block; font-family: "DM Mono", monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
        .goal-input-row { display: flex; align-items: baseline; gap: 8px; }
        .goal-input-row input {
          width: 100%;
          font-size: clamp(24px, 2.2vw, 30px);
          line-height: 1;
          font-family: "Outfit", sans-serif;
          font-weight: 800;
          border: none;
          border-bottom: 2px solid transparent;
          border-radius: 0;
          padding: 0 0 4px;
          background: transparent;
        }
        .goal-input-row input:focus { border-bottom-color: currentColor; }
        .goal-input-row span { color: var(--text-muted); font-family: "DM Mono", monospace; font-size: 12px; }
        .toggle-row { margin-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .pill-switch {
          width: 48px;
          height: 24px;
          border-radius: 12px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          position: relative;
          cursor: pointer;
        }
        .pill-switch span {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 999px;
          background: #fff;
          top: 2px;
          left: 2px;
          transition: transform 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .pill-switch.on { background: #8b5cf6; }
        .pill-switch.on span { transform: translateX(24px); }
        .warn { margin-top: 8px; color: #fbbf24; font-size: 12px; font-family: "DM Mono", monospace; }
        .timing-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
        .timing-row { display: grid; grid-template-columns: 1fr 120px 120px; gap: 10px; align-items: center; }
        .body-stats { margin-top: -4px; }
        .body-num { font-family: "Outfit", sans-serif; font-size: 22px; font-weight: 700; margin-top: 4px; }
        .table-wrap { margin-top: 8px; }
        .table-row { display: grid; grid-template-columns: 140px 120px 120px minmax(0, 1fr); gap: 8px; padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; }
        .theme-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
        .theme-card { border: 1px solid var(--glass-border); border-radius: 14px; padding: 16px; background: rgba(255, 255, 255, 0.03); color: var(--text-primary); cursor: pointer; }
        .theme-card.active { border-color: #8b5cf6; }
        .theme-card small { display: block; color: var(--text-muted); margin-top: 6px; }
        .pref-row { margin-top: 12px; display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 12px; align-items: center; }
        .button-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .danger-outline { border: 1px solid rgba(255, 107, 107, 0.7); background: transparent; color: #ff6b6b; border-radius: 10px; padding: 10px 12px; cursor: pointer; }
        .danger-outline:hover { background: rgba(255, 107, 107, 0.1); }
        .danger-outline:disabled { opacity: 0.6; cursor: not-allowed; }
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 5, 16, 0.7);
          backdrop-filter: blur(6px);
          z-index: 100;
          display: flex;
          justify-content: flex-end;
        }
        .modal-overlay { justify-content: center; align-items: center; }
        .search-panel {
          width: 440px;
          height: 100%;
          border-left: 1px solid var(--glass-border);
          background: rgba(10, 10, 26, 0.92);
          backdrop-filter: blur(16px);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: slideInRight 0.35s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .panel-head { display: flex; justify-content: space-between; align-items: center; }
        .panel-head h3 { margin: 0; font-size: 18px; }
        .panel-head button { border: none; background: none; color: var(--text-muted); cursor: pointer; font-size: 20px; }
        .results-scroll { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
        .subhead { margin-top: 8px; font-family: "DM Mono", monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }
        .result-row {
          border: none;
          width: 100%;
          text-align: left;
          padding: 12px 10px;
          border-radius: 12px;
          background: transparent;
          color: var(--text-primary);
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          gap: 8px;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          transition: all 0.2s ease;
        }
        .result-row:hover { background: rgba(255, 255, 255, 0.05); }
        .result-row:active { background: rgba(255, 255, 255, 0.08); }
        .result-row strong { display: block; font-size: 14px; font-weight: 500; }
        .result-row small { color: var(--text-muted); font-family: "DM Mono", monospace; font-size: 11px; }
        .macro-inline { display: flex; gap: 8px; font-family: "DM Mono", monospace; font-size: 12px; }
        .macro-inline .cal { color: #c084fc; }
        .macro-inline .pro { color: #34d399; }
        .macro-inline .carb { color: #fbbf24; }
        .macro-inline .fat { color: #f472b6; }
        .favorite-toggle { color: var(--text-muted); font-size: 16px; }
        .favorite-toggle:hover { color: #f59e0b; transform: scale(1.15); }
        .nutrition-hero { padding: 20px; margin: 6px 0; text-align: center; }
        .big-cals { font-family: "Outfit", sans-serif; font-size: 36px; font-weight: 800; color: #c084fc; }
        .macro-hero-row { margin-top: 12px; display: flex; justify-content: center; gap: 20px; }
        .macro-hero-row strong { display: block; font-family: "Outfit", sans-serif; font-size: 18px; }
        .macro-hero-row .pro { color: #34d399; }
        .macro-hero-row .carb { color: #fbbf24; }
        .macro-hero-row .fat { color: #f472b6; }
        .macro-hero-row small { display: block; margin-top: 3px; color: var(--text-muted); font-family: "DM Mono", monospace; font-size: 10px; }
        .amount-wrap input {
          width: 100%;
          text-align: center;
          border: none;
          border-bottom: 2px solid rgba(255, 255, 255, 0.15);
          background: transparent;
          color: var(--text-primary);
          font-family: "Outfit", sans-serif;
          font-size: 42px;
          font-weight: 800;
          outline: none;
        }
        .amount-wrap input:focus { border-bottom-color: #8b5cf6; }
        .slider { width: 100%; accent-color: #8b5cf6; }
        .wizard-modal {
          width: min(520px, 92vw);
          border-radius: 24px;
          border: 1px solid var(--glass-border);
          background: rgba(10, 10, 26, 0.95);
          backdrop-filter: blur(20px);
          padding: 36px 32px;
        }
        .wizard-dots { display: flex; justify-content: center; gap: 12px; margin-bottom: 14px; }
        .wizard-dots i { width: 8px; height: 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); display: block; }
        .wizard-dots i.active { background: #8b5cf6; }
        .wizard-step h2 { margin: 0 0 12px; font-size: 22px; font-family: "Outfit", sans-serif; }
        .wizard-step { display: flex; flex-direction: column; gap: 10px; }
        .inline-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .activity-card {
          width: 100%;
          border-radius: 14px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          color: var(--text-primary);
        }
        .activity-card strong { display: block; font-size: 14px; }
        .activity-card small { color: var(--text-muted); font-size: 11px; }
        .activity-card.active { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.08); box-shadow: inset 3px 0 0 #8b5cf6; }
        .goal-mode-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
        .preview-callout { border-radius: 12px; border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.03); padding: 12px; font-family: "DM Mono", monospace; font-size: 12px; }
        .plan-num { font-family: "Outfit", sans-serif; font-size: 28px; font-weight: 800; }
        .plan-target { margin: 6px 0 10px; font-family: "Outfit", sans-serif; font-size: 36px; font-weight: 900; color: #c084fc; line-height: 1; }
        .macro-lines { display: grid; gap: 6px; font-family: "DM Mono", monospace; font-size: 12px; }
        .wizard-actions { margin-top: 14px; display: flex; justify-content: space-between; gap: 10px; }
        .skip-link { margin-top: 10px; width: 100%; border: none; background: none; color: var(--text-muted); cursor: pointer; font-size: 12px; }
        .achievement-fab {
          position: fixed;
          left: 20px;
          bottom: 24px;
          z-index: 55;
          border-radius: 12px;
          border: 1px solid rgba(245, 158, 11, 0.5);
          background: rgba(255, 255, 255, 0.06);
          color: #f59e0b;
          padding: 10px 14px;
          font-size: 12px;
          cursor: pointer;
        }
        .achievement-modal, .confirm-modal {
          width: min(480px, 92vw);
          max-height: 84vh;
          overflow-y: auto;
          border-radius: 18px;
          border: 1px solid var(--glass-border);
          background: rgba(10, 10, 26, 0.95);
          backdrop-filter: blur(16px);
          padding: 18px;
          margin: auto;
        }
        .achieve-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 10px; }
        .achieve-card { border-radius: 12px; border: 1px solid var(--glass-border); min-height: 100px; display: grid; place-items: center; text-align: center; font-size: 11px; padding: 8px; }
        .achieve-card .icon { font-size: 28px; margin-bottom: 4px; }
        .achieve-card.unlocked { border-color: #f59e0b; background: rgba(245, 158, 11, 0.08); }
        .achieve-card.locked { opacity: 0.3; filter: grayscale(1); }
        .toast-stack {
          position: fixed;
          right: 24px;
          top: 20px;
          z-index: 300;
          width: min(360px, calc(100vw - 30px));
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .toast {
          border-radius: 12px;
          padding: 12px 16px;
          border: 1px solid var(--glass-border);
          background: rgba(15, 15, 30, 0.95);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          animation: slideInRight 0.3s ease;
        }
        .toast.success { border-left: 3px solid #34d399; }
        .toast.warning { border-left: 3px solid #fbbf24; }
        .toast.error { border-left: 3px solid #ff6b6b; }
        .toast-actions { display: flex; gap: 8px; }
        .toast-actions button { border: none; background: none; color: #c084fc; cursor: pointer; font-size: 13px; }
        .confetti-layer {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: 250;
          overflow: hidden;
        }
        .confetti-layer span {
          position: absolute;
          top: 16px;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: confettiFall 1.2s ease-out forwards;
        }
        .bottom-tabs {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: 64px;
          border-top: 1px solid var(--glass-border);
          background: rgba(12, 12, 24, 0.9);
          backdrop-filter: blur(20px);
          display: none;
          justify-content: space-around;
          align-items: center;
          z-index: 40;
        }
        .bottom-tabs button {
          border: none;
          background: none;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          cursor: pointer;
        }
        .bottom-tabs button.active { color: #c084fc; }
        .bottom-tabs small { font-size: 10px; }
        .fab-log {
          position: fixed;
          right: 20px;
          bottom: 80px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          color: #fff;
          font-size: 28px;
          line-height: 1;
          display: none;
          place-items: center;
          z-index: 50;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.4);
        }
        .fab-log:hover { filter: brightness(1.1); }
        .fab-log:active { transform: scale(0.97); }
        .orbit-over-dot { animation: pulse 1.5s ease infinite; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes borderPulse { 0%, 100% { border-color: rgba(139, 92, 246, 0.15); } 50% { border-color: rgba(139, 92, 246, 0.35); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.8; } }
        @keyframes flamePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(180px) rotate(240deg); opacity: 0; } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
        @media (max-width: 1279px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .triple-row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .meal-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 1023px) {
          .cosmic-sidebar { display: none; }
          .cosmic-main { margin-left: 0; padding: 22px 22px 96px; }
          .bottom-tabs { display: flex; }
          .header-right .primary-btn { display: none; }
          .fab-log { display: grid; }
          .achievement-fab { bottom: 78px; }
          .search-grid { grid-template-columns: 1fr; }
          .table-row { grid-template-columns: 110px 90px 90px minmax(0, 1fr); }
          .header-center { flex: 1; }
        }
        @media (max-width: 767px) {
          .cosmic-main { padding: 18px 18px 88px; }
          .top-header { flex-wrap: wrap; gap: 10px; }
          .header-center { order: 3; width: 100%; justify-content: flex-start; }
          .clock-pill { display: none; }
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .meal-grid { grid-template-columns: 1fr; }
          .triple-row { grid-template-columns: 1fr; }
          .timing-row { grid-template-columns: 1fr; }
          .pref-row { grid-template-columns: 1fr; }
          .goal-grid { grid-template-columns: 1fr; }
          .search-panel {
            width: 100%;
            height: min(85vh, 700px);
            margin-top: auto;
            border-left: none;
            border-top: 1px solid var(--glass-border);
            border-radius: 20px 20px 0 0;
            animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1);
          }
          .toast-stack { left: 12px; right: 12px; width: auto; }
          .bottom-tabs { height: 56px; }
          .achievement-fab { left: 12px; bottom: 68px; }
        }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      </div>
    </AuthGuard>
  );
}
