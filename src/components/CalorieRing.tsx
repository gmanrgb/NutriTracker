'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface CalorieRingProps {
  consumed: number;
  target: number;
}

export function CalorieRing({ consumed, target }: CalorieRingProps) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const remaining = Math.max(target - consumed, 0);
  const data = [{ value: pct, fill: pct > 100 ? '#ef4444' : '#22c55e' }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            startAngle={90}
            endAngle={-270}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: '#e5e7eb' }} cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(consumed)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ {Math.round(target)} kcal</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">{Math.round(remaining)} left</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">Calories</p>
    </div>
  );
}
