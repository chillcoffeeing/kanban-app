import type { ReactNode } from "react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

interface PrefRowProps {
  icon?: PhosphorIcon;
  title: string;
  description?: string;
  children: ReactNode;
}

export function PrefRow({ icon: Icon, title, description, children }: PrefRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-light py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        {Icon && (
          <Icon
            size={22}
            weight="duotone"
            className="mt-0.5 text-primary"
          />
        )}
        <div>
          <p className="text-sm font-medium text-neutral-dark">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs text-neutral-dark/60">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
