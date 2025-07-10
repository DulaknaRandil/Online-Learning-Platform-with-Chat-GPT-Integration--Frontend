'use client';

import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default',
    padding = 'md',
    rounded = 'md',
    shadow = 'sm',
    hover = false,
    interactive = false,
    children,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'rounded-lg border bg-card text-card-foreground',
      {
        // Variants
        'border-border': variant === 'default',
        'border-2 border-input': variant === 'outlined',
        'shadow-lg border-0': variant === 'elevated',
        'border-0 bg-transparent': variant === 'ghost',
        
        // Padding
        'p-0': padding === 'none',
        'p-3': padding === 'sm',
        'p-6': padding === 'md',
        'p-8': padding === 'lg',
        
        // Rounded
        'rounded-none': rounded === 'none',
        'rounded-sm': rounded === 'sm',
        'rounded-md': rounded === 'md',
        'rounded-lg': rounded === 'lg',
        'rounded-xl': rounded === 'xl',
        
        // Shadow
        'shadow-none': shadow === 'none',
        'shadow-sm': shadow === 'sm',
        'shadow-md': shadow === 'md',
        'shadow-lg': shadow === 'lg',
        
        // Hover effects
        'hover:shadow-md transition-shadow duration-200': hover,
        'cursor-pointer hover:bg-accent/50 transition-colors duration-200': interactive,
      },
      className
    );

    return (
      <div
        className={baseClasses}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact';
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5',
        {
          'p-6': variant === 'default',
          'p-4': variant === 'compact',
        },
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact';
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        {
          'p-6 pt-0': variant === 'default',
          'p-4 pt-0': variant === 'compact',
        },
        className
      )}
      {...props}
    />
  )
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact';
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center',
        {
          'p-6 pt-0': variant === 'default',
          'p-4 pt-0': variant === 'compact',
        },
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;
