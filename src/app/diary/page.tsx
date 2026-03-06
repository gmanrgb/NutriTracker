'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Tabs from '@radix-ui/react-tabs';
import { AuthGuard } from '@/components/AuthGuard';
import { DiaryEntryItem } from '@/components/DiaryEntryItem';
import { useDiaryStore } from '@/stores/diary';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function DiaryPage() {
  const { date, entries, totals, loading, setDate, loadDiary } = useDiaryStore();
  const router = useRouter();

  useEffect(() => {
    loadDiary(date);
  }, [date, loadDiary]);

  function changeDate(delta: number) {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Date nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeDate(-1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ← Prev
          </button>
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white">{formatDate(date)}</p>
            <button
              onClick={() => setDate(new Date().toISOString().slice(0, 10))}
              className="text-xs text-green-600 dark:text-green-400 hover:underline mt-0.5"
            >
              Today
            </button>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Next →
          </button>
        </div>

        {/* Daily totals */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(totals.calories)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">kcal</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{Math.round(totals.protein_g)}g</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">protein</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{Math.round(totals.carbs_g)}g</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">carbs</p>
            </div>
            <div>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{Math.round(totals.fat_g)}g</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">fat</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
          </div>
        ) : (
          <Tabs.Root defaultValue="breakfast">
            <Tabs.List className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {MEALS.map((meal) => {
                const count = entries.filter((e) => e.meal_slot === meal).length;
                return (
                  <Tabs.Trigger
                    key={meal}
                    value={meal}
                    className="flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors
                      data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900
                      data-[state=active]:text-gray-900 dark:data-[state=active]:text-white
                      data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400"
                  >
                    {meal} {count > 0 && <span className="text-xs">({count})</span>}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>

            {MEALS.map((meal) => {
              const mealEntries = entries.filter((e) => e.meal_slot === meal);
              return (
                <Tabs.Content key={meal} value={meal}>
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {mealEntries.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                        No entries yet
                      </p>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800 p-2">
                        {mealEntries.map((entry) => (
                          <DiaryEntryItem key={entry.id} entry={entry} />
                        ))}
                      </div>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-800 p-3">
                      <button
                        onClick={() => router.push(`/search?meal=${meal}&date=${date}`)}
                        className="w-full text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                      >
                        + Add food
                      </button>
                    </div>
                  </div>
                </Tabs.Content>
              );
            })}
          </Tabs.Root>
        )}
      </div>
    </AuthGuard>
  );
}
