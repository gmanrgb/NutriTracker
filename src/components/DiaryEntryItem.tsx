'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Slider from '@radix-ui/react-slider';
import { apiFetch } from '@/api/client';
import { useDiaryStore, type DiaryEntry } from '@/stores/diary';
import { toast } from '@/components/Toaster';

interface Props {
  entry: DiaryEntry;
}

export function DiaryEntryItem({ entry }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [servingQty, setServingQty] = useState(entry.serving_qty);
  const [saving, setSaving] = useState(false);
  const { removeEntry, updateEntry } = useDiaryStore();

  const food = entry.food;
  const calories = food ? Math.round(food.calories * entry.serving_qty) : 0;

  async function handleEdit() {
    setSaving(true);
    try {
      await apiFetch(`/api/diary/${entry.id}`, {
        method: 'PUT',
        body: JSON.stringify({ serving_qty: servingQty }),
      });
      updateEntry(entry.id, servingQty);
      setEditOpen(false);
      toast('Entry updated');
    } catch {
      toast('Failed to update', undefined, 'destructive');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await apiFetch(`/api/diary/${entry.id}`, { method: 'DELETE' });
      removeEntry(entry.id);
      toast('Entry removed');
    } catch {
      toast('Failed to delete', undefined, 'destructive');
    }
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {food?.name ?? entry.food_id}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {servingQty}× {food?.serving_label} · {calories} kcal
        </p>
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        {/* Edit */}
        <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
          <Dialog.Trigger asChild>
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-80">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit serving
              </Dialog.Title>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{food?.name}</p>

              <div className="space-y-4">
                <Slider.Root
                  value={[servingQty]}
                  onValueChange={([v]) => v !== undefined && setServingQty(Math.round(v * 4) / 4)}
                  min={0.25}
                  max={5}
                  step={0.25}
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
                    min={0.25}
                    max={20}
                    step={0.25}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">× {food?.serving_label}</span>
                </div>

                {food && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    = {Math.round(food.calories * servingQty)} kcal
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Dialog.Close asChild>
                  <button className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleEdit}
                  disabled={saving}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Delete */}
        <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialog.Trigger asChild>
            <button className="text-xs text-red-600 dark:text-red-400 hover:underline">Remove</button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
            <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-80">
              <AlertDialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Remove entry?</AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This will remove {food?.name ?? 'this item'} from your diary.
              </AlertDialog.Description>
              <div className="flex gap-2">
                <AlertDialog.Cancel asChild>
                  <button className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button onClick={handleDelete} className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Remove</button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
    </div>
  );
}
