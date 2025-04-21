
import { toast } from "@/hooks/use-toast";

interface ToastMessages {
  loading?: string;
  success?: string;
  error?: string;
}

/**
 * Thực thi action async kèm toast phản hồi.
 */
export async function withToastFeedback<T>(
  action: () => Promise<T>,
  msgs: ToastMessages = {}
): Promise<T> {
  let loadingToast: string | number | undefined;
  try {
    if (msgs.loading) {
      loadingToast = toast.loading(msgs.loading);
    }
    const result = await action();
    if (loadingToast) toast.dismiss(loadingToast);
    if (msgs.success) toast.success(msgs.success);
    return result;
  } catch (err: any) {
    if (loadingToast) toast.dismiss(loadingToast);
    if (msgs.error) toast.error(msgs.error, err?.message);
    throw err;
  }
}
