
import { useState, useCallback } from "react";

/**
 * Chuẩn hóa trạng thái cho các thao tác async quan trọng.
 */
export function useActionStatus<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);

  // Hàm thực thi action có kiểm soát trạng thái
  const execute = useCallback(
    async (action: () => Promise<T>) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await action();
        setResult(data);
        setIsLoading(false);
        return data;
      } catch (err: any) {
        setError(err?.message || "Đã có lỗi xảy ra");
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return { isLoading, error, result, execute, reset };
}
