import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

/**
 * Loading component dengan spinner dan text opsional
 * Dapat digunakan sebagai inline loading atau fullscreen loading
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Memuat...', 
  className,
  fullScreen = false 
}) => {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-2',
      fullScreen && 'min-h-screen',
      className
    )}>
      <Loader2 className={cn(
        'animate-spin text-primary',
        sizeClasses[size]
      )} />
      {text && (
        <p className={cn(
          'text-muted-foreground',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Loading Skeleton component untuk placeholder content
 */
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn(
      'animate-pulse rounded-md bg-muted',
      className
    )} />
  );
};

/**
 * Loading Spinner component sederhana
 */
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className 
}) => {
  return (
    <Loader2 className={cn(
      'animate-spin',
      sizeClasses[size],
      className
    )} />
  );
};