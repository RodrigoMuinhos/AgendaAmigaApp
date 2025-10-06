import type { ReactNode } from "react";

export type ToastPayload = {
  title: string;
  description?: string;
  variant?: "success" | "danger" | "info" | string;
};

type ToastContextValue = {
  pushToast: (payload: ToastPayload) => void;
};

const defaultContext: ToastContextValue = {
  pushToast: (payload) => {
    const message = `${payload.title}${payload.description ? ` - ${payload.description}` : ""}`;
    if (payload.variant === "danger") {
      console.error(message);
    } else {
      console.log(message);
    }
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useToast(): ToastContextValue {
  return defaultContext;
}
