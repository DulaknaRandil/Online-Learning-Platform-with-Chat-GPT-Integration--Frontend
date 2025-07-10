'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    fullWidth = false,
    variant = 'default',
    size = 'md',
    startIcon,
    endIcon,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      {
        'w-full': fullWidth,
        'border-red-300 focus-visible:ring-red-500': error,
        'h-8 px-2 text-xs': size === 'sm',
        'h-10 px-3 text-sm': size === 'md',
        'h-12 px-4 text-base': size === 'lg',
        'border-2 border-gray-300': variant === 'outlined',
        'bg-gray-50 border-gray-200': variant === 'filled',
        'opacity-50 cursor-not-allowed': disabled,
        'pl-10': startIcon,
        'pr-10': endIcon,
      },
      className
    );

    return (
      <div className={cn('space-y-1', { 'w-full': fullWidth })}>
        {label && (
          <label className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            { 'text-red-600': error }
          )}>
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            className={baseClasses}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
