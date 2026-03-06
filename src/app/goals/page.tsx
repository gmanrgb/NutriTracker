'use client';

import { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import { AuthGuard } from '@/components/AuthGuard';
import { apiFetch } from '@/api/client';
import { mifflinStJeor } from '@/lib/nutrition';
import { toast } from '@/components/Toaster';

interface Goals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

const ACTIVITY_OPTIONS = [
  { value: '1.2', label: 'Sedentary (no exercise)' },
  { value: '1.375', label: 'Lightly active (1-3 days/week)' },
  { value: '1.55', label: 'Moderately active (3-5 days/week)' },
  { value: '1.725', label: 'Very active (6-7 days/week)' },
  { value: '1.9', label: 'Extra active (physical job)' },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goals>({ calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // TDEE calculator
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState('1.55');

  useEffect(() => {
    apiFetch<Goals | null>('/api/goals')
      .then((g) => {
        if (g) setGoals(g);
      })
      .finally(() => setLoading(false));
  }, []);

  function calculateTDEE() {
    const ageN = parseInt(age);
    const weightN = parseFloat(weight);
    const heightN = parseFloat(height);
    if (!ageN || !weightN || !heightN) return;
    const tdee = mifflinStJeor({
      age: ageN, weightKg: weightN, heightCm: heightN,
      sex, activityMultiplier: parseFloat(activity),
    });
    setGoals((g) => ({ ...g, calories: tdee }));
    toast('TDEE calculated', `${tdee} kcal/day`);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await apiFetch<Goals>('/api/goals', {
        method: 'PUT',
        body: JSON.stringify(goals),
      });
      setGoals(saved);
      toast('Goals saved!');
    } catch {
      toast('Failed to save goals', undefined, 'destructive');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nutrition Goals</h1>

        {/* TDEE Calculator */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">TDEE Calculator</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min={10} max={120}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min={20} max={500} step={0.1}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} min={100} max={250}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sex</label>
              <Select.Root value={sex} onValueChange={(v) => setSex(v as 'male' | 'female')}>
                <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                  <Select.Value />
                  <Select.Icon>▾</Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                    <Select.Viewport>
                      <Select.Item value="male" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white outline-none">
                        <Select.ItemText>Male</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="female" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white outline-none">
                        <Select.ItemText>Female</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activity Level</label>
              <Select.Root value={activity} onValueChange={setActivity}>
                <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                  <Select.Value />
                  <Select.Icon>▾</Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                    <Select.Viewport>
                      {ACTIVITY_OPTIONS.map((opt) => (
                        <Select.Item key={opt.value} value={opt.value} className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white outline-none">
                          <Select.ItemText>{opt.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>
          <button
            onClick={calculateTDEE}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Calculate TDEE → fill calorie goal
          </button>
        </div>

        {/* Goals form */}
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Daily Targets</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {([
              ['calories', 'Calories (kcal)', 500, 10000],
              ['protein_g', 'Protein (g)', 0, 500],
              ['carbs_g', 'Carbs (g)', 0, 1000],
              ['fat_g', 'Fat (g)', 0, 300],
            ] as [keyof Goals, string, number, number][]).map(([key, label, min, max]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input
                  type="number"
                  value={goals[key]}
                  onChange={(e) => setGoals((g) => ({ ...g, [key]: parseFloat(e.target.value) || 0 }))}
                  min={min} max={max} step={1}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save Goals'}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
