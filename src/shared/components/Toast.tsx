import { useRef, useEffect } from "react";
import gsap from "gsap";
import { XIcon } from "@phosphor-icons/react";
import { useToastStore } from "@/stores/toastStore";
import type { Toast as ToastType } from "@/stores/toastStore/types";

const STYLES: Record<string, string> = {
  success: "border-l-4 border-l-success bg-success/10 text-success",
  error: "border-l-4 border-l-danger bg-danger/10 text-danger",
  warning: "border-l-4 border-l-warning bg-warning/10 text-warning",
  info: "border-l-4 border-l-info bg-info/10 text-info",
};

export function Toast({ toast }: { toast: ToastType }) {
  const ref = useRef<HTMLDivElement>(null);
  const removeToast = useToastStore((s) => s.removeToast);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, []);

  const handleDismiss = () => {
    const el = ref.current;
    if (!el) { removeToast(toast.id); return; }
    gsap.to(el, { x: 120, opacity: 0, duration: 0.25, ease: "power2.in", onComplete: () => removeToast(toast.id) });
  };

  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 rounded-xl bg-surface px-4 py-3 shadow-lg ring-1 ring-neutral-light ${STYLES[toast.type] ?? STYLES.info}`}
    >
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={handleDismiss} className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
        <XIcon size={16} weight="bold" />
      </button>
    </div>
  );
}
