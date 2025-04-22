
import { useRef, useEffect } from 'react';

export const useRenderCount = (componentName: string) => {
  const renderCount = useRef(0);
  const renderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentRender = performance.now();
    const renderDuration = currentRender - renderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `%c[Render] ${componentName}:`,
        'color: #2ECC71',
        `Count: ${renderCount.current}, Duration: ${renderDuration.toFixed(2)}ms`
      );
    }
    
    renderTime.current = currentRender;
  });

  return renderCount.current;
};
