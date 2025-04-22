
/**
 * Utility for monitoring performance metrics in the application
 */

// Track key page transitions for performance monitoring
export const trackPageTransition = (pageName: string) => {
  const navigationStart = performance.now();
  performance.mark(`${pageName}-start`);
  
  // Return a function to call when navigation is complete
  return () => {
    performance.mark(`${pageName}-end`);
    performance.measure(
      `${pageName}-navigation`,
      `${pageName}-start`,
      `${pageName}-end`
    );
    
    const navigationTime = performance.now() - navigationStart;
    console.log(
      `%c[Navigation] ${pageName}:`,
      'color: #3498DB',
      `Time: ${navigationTime.toFixed(2)}ms`
    );
  };
};

// Track component render time
export const trackComponentRender = (componentName: string) => {
  const renderStart = performance.now();
  performance.mark(`${componentName}-render-start`);
  
  return () => {
    performance.mark(`${componentName}-render-end`);
    performance.measure(
      `${componentName}-render-time`,
      `${componentName}-render-start`,
      `${componentName}-render-end`
    );
    
    const renderTime = performance.now() - renderStart;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `%c[Render] ${componentName}:`,
        'color: #2ECC71',
        `Time: ${renderTime.toFixed(2)}ms`
      );
    }
  };
};

// Track API call performance
export const trackApiCall = (endpoint: string) => {
  const apiStart = performance.now();
  performance.mark(`${endpoint}-start`);
  
  return () => {
    performance.mark(`${endpoint}-end`);
    performance.measure(
      `${endpoint}-time`,
      `${endpoint}-start`,
      `${endpoint}-end`
    );
    
    const apiTime = performance.now() - apiStart;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `%c[API] ${endpoint}:`,
        'color: #9B59B6',
        `Time: ${apiTime.toFixed(2)}ms`
      );
    }
    
    return apiTime;
  };
};

// Capture Core Web Vitals
export const captureWebVitals = () => {
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
      getCLS(metric => {
        console.log(`CLS: ${metric.value}`);
      });
      
      getFID(metric => {
        console.log(`FID: ${metric.value}`);
      });
      
      getLCP(metric => {
        console.log(`LCP: ${metric.value}`);
      });
    });
  }
};

// Get memory usage information
export const getMemoryInfo = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
      usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
};

// Performance testing utility for UI components
export const measureComponentPerformance = (
  componentName: string,
  testFn: () => void,
  iterations: number = 5
) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log(`%c[Performance Test] ${componentName}`, 'color: #E74C3C');
  
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    testFn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const average = times.reduce((sum, time) => sum + time, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log(`Results after ${iterations} iterations:`);
  console.log(`- Average: ${average.toFixed(2)}ms`);
  console.log(`- Min: ${min.toFixed(2)}ms`);
  console.log(`- Max: ${max.toFixed(2)}ms`);
  
  return { average, min, max, times };
};
