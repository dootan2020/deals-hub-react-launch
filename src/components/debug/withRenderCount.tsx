
import { ComponentType } from 'react';
import { useRenderCount } from '@/hooks/useRenderCount';

export function withRenderCount<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string
) {
  const WithRenderCount = (props: P) => {
    const metrics = useRenderCount(componentName);
    
    return process.env.NODE_ENV === 'development' ? (
      <div className="relative">
        <WrappedComponent {...props} />
        <div 
          className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl"
          title={`Avg: ${metrics.avgTime.toFixed(1)}ms, Total: ${metrics.totalTime.toFixed(1)}ms`}
        >
          renders: {metrics.count}
        </div>
      </div>
    ) : (
      <WrappedComponent {...props} />
    );
  };

  WithRenderCount.displayName = `WithRenderCount(${componentName})`;
  return WithRenderCount;
}
