
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (title: string, message?: string) => {
    sonnerToast.success(title, { description: message });
  },
  error: (title: string, message?: string) => {
    sonnerToast.error(title, { description: message });
  },
  warning: (title: string, message?: string) => {
    sonnerToast.warning(title, { description: message });
  },
  info: (title: string, message?: string) => {
    sonnerToast.info(title, { description: message });
  },
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  dismiss: (id?: string) => {
    if (id) {
      sonnerToast.dismiss(id);
    } else {
      sonnerToast.dismiss();
    }
  }
};
