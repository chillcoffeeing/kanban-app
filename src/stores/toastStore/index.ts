import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { generateId } from "@/shared/utils/helpers";
import type { ToastState } from "./types";

export const useToastStore = create<ToastState>()(
  devtools(
    (set) => ({
      toasts: [],

      addToast: (toast) => {
        const id = generateId();
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        const duration = toast.duration ?? 4000;
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, duration);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
    }),
    { name: "toastStore" },
  ),
);
