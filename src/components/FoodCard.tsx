'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Slider from '@radix-ui/react-slider';
import { apiFetch } from '@/api/client';
import { toast } from '@/components/Toaster';

interface Food {
  id: string;
  name: string;
  brand?: string | null;
  serving_label: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  food_source?: 'catalog' | 'custom';
}

interface Props {
  food: Food;
  defaultMeal?: string;
  defaultDate?: string;
  onLogged?: () => void;
}

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export function FoodCard({ food, defaultMeal, defaultDate, onLogged }: Props) {
  const [open, setOpen] = useState(false);
  const [servingQty, setServingQty] = useState(1);
  const [meal, setMeal] = useState(defaultMeal ?? 'breakfast');
  const [logging, setLogging] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const date = defaultDate ?? today;

  async function handleLog() {
    setLogging(true);
    try {
      await apiFetch('/api/diary', {
        method: 'POST',
        body: JSON.stringify({
          food_id: food.id,
          food_source: food.food_source ?? 'catalog',
          date,
          meal_slot: meal,
          serving_qty: servingQty,
        }),
      });
      toast('Food logged!', `${food.name} added to ${meal}`);
      setOpen(false);
      setServingQty(1);
      onLogged?.();
    } catch {
      toast('Failed to log food', undefined, 'destructive');
    } finally {
      setLogging(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{food.name}</p>
            {food.brand && <p className="text-xs text-gray-400 dark:text-gray-500">{food.brand}</p>}
          </div>
          <div className="text-right ml-3 shrink-0">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{Math.round(food.calories)} kcal</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{food.serving_label}</p>
          </div>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-80">
          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{food.name}</Dialog.Title>
          {food.brand && <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{food.brand}</p>}

          <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{Math.round(food.calories * servingQty)}</p>
              <p className="text-gray-400 dark:text-gray-500">kcal</p>
            </div>
            <div>
              <p className="font-bold text-blue-600 dark:text-blue-400">{Math.round(food.protein_g * servingQty)}g</p>
              <p className="text-gray-400 dark:text-gray-500">prot</p>
            </div>
            <div>
              <p className="font-bold text-amber-600 dark:text-amber-400">{Math.round(food.carbs_g * servingQty)}g</p>
              <p className="text-gray-400 dark:text-gray-500">carbs</p>
            </div>
            <div>
              <p className="font-bold text-rose-600 dark:text-rose-400">{Math.round(food.fat_g * servingQty)}g</p>
              <p className="text-gray-400 dark:text-gray-500">fat</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <Slider.Root
              value={[servingQty]}
              onValueChange={([v]) => v !== undefined && setServingQty(Math.round(v * 4) / 4)}
              min={0.25} max={5} step={0.25}
              className="relative flex items-center w-full h-5"
            >
              <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1.5">
                <Slider.Range className="absolute bg-green-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-green-500 rounded-full shadow focus:outline-none" />
            </Slider.Root>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={servingQty}
                onChange={(e) => setServingQty(parseFloat(e.target.value) || 1)}
                min={0.25} max={20} step={0.25}
                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">× {food.serving_label}</span>
            </div>

            <Select.Root value={meal} onValueChange={setMeal}>
              <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                <Select.Value />
                <Select.Icon>▾</Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <Select.Viewport>
                    {MEALS.map((m) => (
                      <Select.Item
                        key={m}
                        value={m}
                        className="px-3 py-2 text-sm cursor-pointer capitalize hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white data-[highlighted]:bg-green-50 dark:data-[highlighted]:bg-green-900/20 outline-none"
                      >
                        <Select.ItemText>{m.charAt(0).toUpperCase() + m.slice(1)}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          <div className="flex gap-2">
            <Dialog.Close asChild>
              <button className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
            </Dialog.Close>
            <button
              onClick={handleLog}
              disabled={logging}
              className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {logging ? 'Logging...' : 'Log'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
