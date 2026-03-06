'use client';

import * as Toast from '@radix-ui/react-toast';
import { create } from 'zustand';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(title: string, description?: string, variant: 'default' | 'destructive' = 'default') {
  useToastStore.getState().addToast({ title, description, variant });
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <Toast.Provider swipeDirection="right">
      {toasts.map((t) => (
        <Toast.Root
          key={t.id}
          className={`fixed bottom-4 right-4 rounded-lg shadow-lg p-4 flex items-start gap-3 z-50 w-80
            ${t.variant === 'destructive' ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'}`}
          open
          onOpenChange={(open) => !open && removeToast(t.id)}
          duration={3000}
        >
          <div className="flex-1">
            <Toast.Title className="font-semibold text-sm">{t.title}</Toast.Title>
            {t.description && (
              <Toast.Description className="text-xs mt-0.5 opacity-80">{t.description}</Toast.Description>
            )}
          </div>
          <Toast.Close className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport />
    </Toast.Provider>
  );
}
