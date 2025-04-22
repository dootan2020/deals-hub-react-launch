
import { useEffect, useCallback, useState, useRef } from 'react';
import { toast } from 'sonner';

// Error types enum
export enum AsyncErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

interface AsyncError extends Error {
  type?: AsyncErrorType;
  originalError?: any;
}

const formatError = (error: any): AsyncError => {
  const asyncError: AsyncError = new Error();
  
  if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
    asyncError.type = AsyncErrorType.NETWORK;
    asyncError.message = 'Lỗi kết nối mạng';
  } else if (error.message?.includes('Invalid token') || error.message?.includes('Unauthorized')) {
    asyncError.type = AsyncErrorType.AUTH;
    asyncError.message = 'Phiên đăng nhập đã hết hạn';
  } else {
    asyncError.type = AsyncErrorType.UNKNOWN;
    asyncError.message = 'Đã xảy ra lỗi không mong muốn';
  }
  
  asyncError.originalError = error;
  return asyncError;
};

export const safeAsync = async <T,>(
  asyncFn: () => Promise<T>,
  onError?: (error: AsyncError) => void
): Promise<T | undefined> => {
  try {
    return await asyncFn();
  } catch (error) {
    const formattedError = formatError(error);
    
    if (onError) {
      onError(formattedError);
    } else {
      toast.error(formattedError.message);
    }
    
    return undefined;
  }
};

export const useAsyncEffect = (
  effect: () => Promise<void | (() => void)>,
  deps: any[] = []
) => {
  useEffect(() => {
    const isMounted = { current: true };
    
    const runEffect = async () => {
      try {
        const cleanup = await effect();
        return () => {
          isMounted.current = false;
          cleanup?.();
        };
      } catch (error) {
        if (isMounted.current) {
          const formattedError = formatError(error);
          toast.error(formattedError.message);
        }
      }
    };

    return runEffect();
  }, deps);
};

export const useSafeAsync = <T,>(asyncFn: () => Promise<T>) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AsyncError | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      if (isMounted.current) {
        setData(result);
      }
      return result;
    } catch (error) {
      const formattedError = formatError(error);
      if (isMounted.current) {
        setError(formattedError);
        toast.error(formattedError.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [asyncFn]);

  return { execute, data, loading, error };
};
