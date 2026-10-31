import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-lg text-sm bg-white dark:bg-surface-900 border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-surface-100 disabled:text-surface-500 ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightIcon ? 'pr-10' : 'pr-3.5'} py-2.5 ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:text-rose-200'
              : 'border-surface-300 dark:border-surface-700 focus:border-brand-500 text-surface-900 dark:text-surface-100'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-surface-500 dark:text-surface-400">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
