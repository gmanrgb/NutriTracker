import { create } from 'zustand';
import { apiFetch } from '@/api/client';

export interface FoodInfo {
  name: string;
  brand: string | null;
  serving_label: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface DiaryEntry {
  id: string;
  food_id: string;
  food_source: 'catalog' | 'custom';
  meal_slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  serving_qty: number;
  food: FoodInfo | null;
}

export interface Macros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface DiaryState {
  date: string;
  entries: DiaryEntry[];
  totals: Macros;
  loading: boolean;
  setDate: (date: string) => void;
  loadDiary: (date: string) => Promise<void>;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, serving_qty: number) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const useDiaryStore = create<DiaryState>((set, get) => ({
  date: today(),
  entries: [],
  totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  loading: false,

  setDate: (date) => {
    set({ date });
    get().loadDiary(date);
  },

  loadDiary: async (date) => {
    set({ loading: true });
    try {
      const data = await apiFetch<{ entries: DiaryEntry[]; totals: Macros }>(
        `/api/diary?date=${date}`
      );
      set({ entries: data.entries, totals: data.totals, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  removeEntry: (id) => {
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }));
  },

  updateEntry: (id, serving_qty) => {
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, serving_qty } : e)),
    }));
  },
}));
