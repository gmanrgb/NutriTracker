'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import { AuthGuard } from '@/components/AuthGuard';
import { apiFetch } from '@/api/client';
import { toast } from '@/components/Toaster';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [units, setUnits] = useState('metric');
  const [savingUnits, setSavingUnits] = useState(false);

  useEffect(() => {
    apiFetch<Record<string, string>>('/api/settings')
      .then((s) => { if (s.units) setUnits(s.units); })
      .catch(() => {});
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      await apiFetch('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      toast('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: unknown) {
      setPwError(e instanceof Error ? e.message : 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  }

  async function handleUnitsChange(value: string) {
    setUnits(value);
    setSavingUnits(true);
    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ key: 'units', value }),
      });
      toast('Units updated');
    } catch {
      toast('Failed to save units', undefined, 'destructive');
    } finally {
      setSavingUnits(false);
    }
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark mode</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Switch between light and dark theme</p>
            </div>
            <Switch.Root
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative data-[state=checked]:bg-green-500 transition-colors focus:outline-none"
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow transition-transform data-[state=checked]:translate-x-5 translate-x-0.5" />
            </Switch.Root>
          </div>
        </div>

        {/* Units */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Units</h2>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Measurement system</p>
            <Select.Root value={units} onValueChange={handleUnitsChange} disabled={savingUnits}>
              <Select.Trigger className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                <Select.Value />
                <Select.Icon>▾</Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <Select.Viewport>
                    <Select.Item value="metric" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white outline-none">
                      <Select.ItemText>Metric (kg, cm)</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="imperial" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white outline-none">
                      <Select.ItemText>Imperial (lbs, in)</Select.ItemText>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Change Password</h2>
          {pwError && <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{pwError}</div>}
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={savingPw}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg"
            >
              {savingPw ? 'Changing...' : 'Change password'}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
