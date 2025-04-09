import React from 'react';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div className={cn('animate-spin', sizeClasses[size])}>
      <svg
        className="text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

const LoadingDots = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'w-1.5 h-1.5',
    default: 'w-2 h-2',
    large: 'w-3 h-3',
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-primary rounded-full',
            sizeClasses[size],
            'animate-bounce'
          )}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
};

const LoadingPulse = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div className={cn('relative', sizeClasses[size])}>
      <div className="absolute inset-0 bg-primary rounded-full animate-ping" />
      <div className="absolute inset-0 bg-primary rounded-full opacity-75" />
    </div>
  );
};

const LoadingBar = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'h-1',
    default: 'h-2',
    large: 'h-3',
  };

  return (
    <div className={cn('w-24 overflow-hidden rounded-full bg-muted', sizeClasses[size])}>
      <div className="w-1/2 h-full bg-primary animate-loading" />
    </div>
  );
};

const Loading = ({ variant = 'spinner', size = 'default', className }) => {
  const variants = {
    spinner: <LoadingSpinner size={size} />,
    dots: <LoadingDots size={size} />,
    pulse: <LoadingPulse size={size} />,
    bar: <LoadingBar size={size} />,
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {variants[variant]}
    </div>
  );
};

export default Loading; 