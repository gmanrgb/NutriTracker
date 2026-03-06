'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { CalorieRing } from '@/components/CalorieRing';
import { MacroBar } from '@/components/MacroBar';
import { apiFetch } from '@/api/client';

interface Macros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

type Goals = Macros;

export default function DashboardPage() {
  const [totals, setTotals] = useState<Macros>({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  const [goals, setGoals] = useState<Goals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      apiFetch<{ totals: Macros }>(`/api/diary?date=${today}`),
      apiFetch<Goals | null>('/api/goals'),
    ])
      .then(([diary, g]) => {
        setTotals(diary.totals);
        setGoals(g);
      })
      .finally(() => setLoading(false));
  }, []);

  const g = goals ?? { calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65 };

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Today&apos;s Summary</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center">
              <CalorieRing consumed={totals.calories} target={g.calories} />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Macros</h2>
              <MacroBar label="Protein" consumed={totals.protein_g} target={g.protein_g} color="blue" />
              <MacroBar label="Carbs" consumed={totals.carbs_g} target={g.carbs_g} color="amber" />
              <MacroBar label="Fat" consumed={totals.fat_g} target={g.fat_g} color="rose" />
            </div>

            {!goals && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
                No goals set yet. <a href="/goals" className="underline font-medium">Set your goals</a> to see personalized targets.
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
