
import { ComponentType } from 'react';
import { useRenderCount } from '@/hooks/useRenderCount';

export function withRenderCount<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string
) {
  const WithRenderCount = (props: P) => {
    useRenderCount(componentName);
    
    return process.env.NODE_ENV === 'development' ? (
      <div className="relative">
        <WrappedComponent {...props} />
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded">
          renders: {useRenderCount(componentName)}
        </div>
      </div>
    ) : (
      <WrappedComponent {...props} />
    );
  };

  WithRenderCount.displayName = `WithRenderCount(${componentName})`;
  return WithRenderCount;
}
