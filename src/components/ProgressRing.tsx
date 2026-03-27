'use client';

export default function ProgressRing({ completed, total, size = 80 }: { completed: number; total: number; size?: number }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="url(#progressGradient)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4c6ef5" />
            <stop offset="100%" stopColor="#845ef7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-surface-900 dark:text-night-100">{completed}/{total}</span>
      </div>
    </div>
  );
}
