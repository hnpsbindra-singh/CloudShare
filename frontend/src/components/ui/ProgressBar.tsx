import React from 'react';

interface ProgressBarProps {
  used: number;
  total: number;
  className?: string;
  showLabels?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  used,
  total,
  className = '',
  showLabels = false,
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  // Determine color status based on storage usage
  let colorClass = 'bg-brand-600 dark:bg-brand-500';
  let badgeClass = 'text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-400';

  if (percentage >= 90) {
    colorClass = 'bg-rose-500';
    badgeClass = 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400';
  } else if (percentage >= 75) {
    colorClass = 'bg-amber-500';
    badgeClass = 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400';
  }

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-surface-600 dark:text-surface-400">Used Space</span>
          <span className={`px-2 py-0.5 rounded-full font-semibold ${badgeClass}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
