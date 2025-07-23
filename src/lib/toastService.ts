import { toast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning" | "default";

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?:
    | "top-center"
    | "top-right"
    | "top-left"
    | "bottom-center"
    | "bottom-right"
    | "bottom-left";
}

const defaultOptions: ToastOptions = {
  type: "default",
  duration: 3000,
  position: "top-right",
};

const showToast = (message: string, options: ToastOptions = {}) => {
  const { type, ...rest } = { ...defaultOptions, ...options };

  switch (type) {
    case "success":
      toast.success(message, rest);
      break;
    case "error":
      toast.error(message, rest);
      break;
    case "info":
      toast.message(message, rest);
      break;
    case "warning":
      toast.warning(message, rest);
      break;
    default:
      toast(message, rest);
  }
};

export const toastService = {
  show: showToast,
  success: (msg: string, opts?: Omit<ToastOptions, "type">) =>
    showToast(msg, { ...opts, type: "success" }),
  error: (msg: string, opts?: Omit<ToastOptions, "type">) =>
    showToast(msg, { ...opts, type: "error" }),
  info: (msg: string, opts?: Omit<ToastOptions, "type">) =>
    showToast(msg, { ...opts, type: "info" }),
  warning: (msg: string, opts?: Omit<ToastOptions, "type">) =>
    showToast(msg, { ...opts, type: "warning" }),
};
