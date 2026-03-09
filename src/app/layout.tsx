import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import { Nav } from '@/components/Nav';
import { Toaster } from '@/components/Toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', preload: false });

export const metadata: Metadata = {
  title: 'NutriTrack - Nutrition Tracker',
  description: 'Self-hosted nutrition tracking app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Nav />
          <main>{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
