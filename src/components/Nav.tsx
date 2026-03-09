'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { apiFetch } from '@/api/client';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/diary', label: 'Diary' },
  { href: '/search', label: 'Search' },
  { href: '/goals', label: 'Goals' },
  { href: '/settings', label: 'Settings' },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser } = useAuthStore();

  async function handleLogout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearUser();
      router.replace('/');
    }
  }

  if (pathname?.startsWith('/cosmic')) return null;
  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-1">
          <span className="font-bold text-green-600 mr-4">NutriTrack</span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${pathname === link.href
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">{user.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

