'use client';

import * as Progress from '@radix-ui/react-progress';

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number;
  color: 'blue' | 'amber' | 'rose';
}

const colorMap = {
  blue: { bar: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  rose: { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
};

export function MacroBar({ label, consumed, target, color }: MacroBarProps) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const colors = colorMap[color];

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${colors.text}`}>{label}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round(consumed)}g / {Math.round(target)}g ({Math.round(pct)}%)
        </span>
      </div>
      <Progress.Root
        className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-full h-2"
        value={pct}
      >
        <Progress.Indicator
          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </Progress.Root>
    </div>
  );
}
