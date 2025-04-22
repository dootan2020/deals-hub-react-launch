
import { Suspense, ComponentType, lazy } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadProps {
  children: React.ReactNode;
  className?: string;
}

export const LazyLoadFallback = ({ className = '' }: { className?: string }) => (
  <div className={`flex justify-center items-center p-4 ${className}`}>
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
);

export const LazyLoadWrapper = ({ children, className = '' }: LazyLoadProps) => (
  <Suspense fallback={<LazyLoadFallback className={className} />}>
    {children}
  </Suspense>
);

export function withLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  return function WithLazy(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LazyLoadFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
