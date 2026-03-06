'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AuthGuard } from '@/components/AuthGuard';
import { FoodCard } from '@/components/FoodCard';
import { apiFetch } from '@/api/client';
import { toast } from '@/components/Toaster';
import { CustomFoodSchema } from '@/lib/schemas';

interface Food {
  id: string;
  name: string;
  brand?: string | null;
  serving_label: string;
  serving_size_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface CustomFood extends Food {
  created_at: string;
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const defaultMeal = searchParams.get('meal') ?? 'breakfast';
  const defaultDate = searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Custom food form
  const [form, setForm] = useState({
    name: '', brand: '', serving_size_g: '', serving_label: '',
    calories: '', protein_g: '', carbs_g: '', fat_g: '',
    fiber_g: '', sugar_g: '', saturated_fat_g: '', sodium_mg: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<CustomFood[]>('/api/custom-foods').then(setCustomFoods).catch(() => {});
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const data = await apiFetch<Food[]>(`/api/foods/search?q=${encodeURIComponent(q)}`);
      setResults(data);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  async function handleCreateFood(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const parsed = CustomFoodSchema.safeParse({
      name: form.name, brand: form.brand || undefined,
      serving_size_g: parseFloat(form.serving_size_g),
      serving_label: form.serving_label,
      calories: parseFloat(form.calories),
      protein_g: parseFloat(form.protein_g),
      carbs_g: parseFloat(form.carbs_g),
      fat_g: parseFloat(form.fat_g),
      fiber_g: form.fiber_g ? parseFloat(form.fiber_g) : undefined,
      sugar_g: form.sugar_g ? parseFloat(form.sugar_g) : undefined,
      saturated_fat_g: form.saturated_fat_g ? parseFloat(form.saturated_fat_g) : undefined,
      sodium_mg: form.sodium_mg ? parseFloat(form.sodium_mg) : undefined,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setSaving(true);
    try {
      const created = await apiFetch<CustomFood>('/api/custom-foods', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      setCustomFoods((prev) => [created, ...prev]);
      setCreateOpen(false);
      setForm({ name: '', brand: '', serving_size_g: '', serving_label: '', calories: '', protein_g: '', carbs_g: '', fat_g: '', fiber_g: '', sugar_g: '', saturated_fat_g: '', sodium_mg: '' });
      toast('Custom food created');
    } catch {
      setFormError('Failed to create food');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCustomFood(id: string) {
    try {
      await apiFetch(`/api/custom-foods/${id}`, { method: 'DELETE' });
      setCustomFoods((prev) => prev.filter((f) => f.id !== id));
      toast('Food deleted');
    } catch {
      toast('Failed to delete', undefined, 'destructive');
    }
    setDeleteId(null);
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search Foods</h1>

        <Tabs.Root defaultValue="catalog">
          <Tabs.List className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <Tabs.Trigger
              value="catalog"
              className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400"
            >
              Foods
            </Tabs.Trigger>
            <Tabs.Trigger
              value="custom"
              className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400"
            >
              My Foods
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="catalog">
            <div className="mb-4">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for chicken, apple, oats..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {searching && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500" />
                </div>
              )}
              {!searching && results.length === 0 && query && (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">No results for &quot;{query}&quot;</p>
              )}
              {!searching && results.length === 0 && !query && (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">Type to search foods</p>
              )}
              {results.map((food) => (
                <div key={food.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <FoodCard food={food} defaultMeal={defaultMeal} defaultDate={defaultDate} />
                </div>
              ))}
            </div>
          </Tabs.Content>

          <Tabs.Content value="custom">
            <div className="flex justify-end mb-3">
              <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
                <Dialog.Trigger asChild>
                  <button className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700">
                    + Create Food
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-96 max-h-[90vh] overflow-y-auto">
                    <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Custom Food</Dialog.Title>
                    {formError && <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">{formError}</div>}
                    <form onSubmit={handleCreateFood} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          ['name', 'Name *', 'text'],
                          ['brand', 'Brand', 'text'],
                          ['serving_size_g', 'Serving size (g) *', 'number'],
                          ['serving_label', 'Serving label *', 'text'],
                          ['calories', 'Calories *', 'number'],
                          ['protein_g', 'Protein (g) *', 'number'],
                          ['carbs_g', 'Carbs (g) *', 'number'],
                          ['fat_g', 'Fat (g) *', 'number'],
                          ['fiber_g', 'Fiber (g)', 'number'],
                          ['sugar_g', 'Sugar (g)', 'number'],
                          ['saturated_fat_g', 'Sat. fat (g)', 'number'],
                          ['sodium_mg', 'Sodium (mg)', 'number'],
                        ] as [string, string, string][]).map(([field, label, type]) => (
                          <div key={field} className={field === 'name' ? 'col-span-2' : ''}>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                            <input
                              type={type}
                              value={form[field as keyof typeof form]}
                              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              min={type === 'number' ? 0 : undefined}
                              step={type === 'number' ? 0.1 : undefined}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Dialog.Close asChild>
                          <button type="button" className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
                        </Dialog.Close>
                        <button type="submit" disabled={saving} className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                          {saving ? 'Creating...' : 'Create'}
                        </button>
                      </div>
                    </form>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {customFoods.length === 0 ? (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">No custom foods yet</p>
              ) : (
                customFoods.map((food) => (
                  <div key={food.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-center">
                    <div className="flex-1">
                      <FoodCard food={{ ...food, food_source: 'custom' }} defaultMeal={defaultMeal} defaultDate={defaultDate} />
                    </div>
                    <button
                      onClick={() => setDeleteId(food.id)}
                      className="px-3 py-1 text-xs text-red-500 hover:text-red-700 mr-2"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            <AlertDialog.Root open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-80">
                  <AlertDialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete food?</AlertDialog.Title>
                  <AlertDialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    This custom food will be permanently deleted.
                  </AlertDialog.Description>
                  <div className="flex gap-2">
                    <AlertDialog.Cancel asChild>
                      <button className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg">Cancel</button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <button
                        onClick={() => deleteId && handleDeleteCustomFood(deleteId)}
                        className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </AlertDialog.Action>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </AuthGuard>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" /></div>}>
      <SearchPageInner />
    </Suspense>
  );
}
