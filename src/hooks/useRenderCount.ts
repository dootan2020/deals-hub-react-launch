
import { useRef, useEffect } from 'react';

export const useRenderCount = (componentName: string) => {
  const renderCount = useRef(0);
  const renderTime = useRef(performance.now());
  const firstRenderTime = useRef<number | null>(null);
  const totalRenderTime = useRef(0);

  useEffect(() => {
    if (firstRenderTime.current === null) {
      firstRenderTime.current = performance.now();
    }
    
    renderCount.current += 1;
    const currentRender = performance.now();
    const renderDuration = currentRender - renderTime.current;
    totalRenderTime.current += renderDuration;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `%c[Render] ${componentName}:`, 
        'color: #2ECC71',
        `Count: ${renderCount.current}, ` +
        `Duration: ${renderDuration.toFixed(2)}ms, ` +
        `Avg: ${(totalRenderTime.current / renderCount.current).toFixed(2)}ms, ` +
        `Total: ${totalRenderTime.current.toFixed(2)}ms`
      );
    }
    
    renderTime.current = currentRender;

    // Report metrics to performance observer
    performance.mark(`${componentName}-render-${renderCount.current}`);
    performance.measure(
      `${componentName}-render-time`,
      `${componentName}-render-${renderCount.current}`
    );
  });

  return {
    count: renderCount.current,
    totalTime: totalRenderTime.current,
    avgTime: totalRenderTime.current / renderCount.current
  };
};
