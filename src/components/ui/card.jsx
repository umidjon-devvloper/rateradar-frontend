import * as React from 'react';
import { cn } from '@/lib/utils';

const CARD_VARIANTS = {
  default: 'rounded-xl border bg-card text-card-foreground shadow-soft',
  glass: 'rounded-2xl glass text-card-foreground',
  'glass-strong': 'rounded-2xl glass-strong text-card-foreground',
  flat: 'rounded-xl border bg-card text-card-foreground',
  premium:
    'rounded-2xl glass-strong text-card-foreground ring-premium overflow-hidden',
};

const Card = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(CARD_VARIANTS[variant] || CARD_VARIANTS.default, className)}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
