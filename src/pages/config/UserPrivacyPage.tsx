import {
  User,
  Envelope,
  Lightning,
  At,
  ShieldCheck,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { useSettingsStore } from "@/stores/settingsStore";
import type { UserPrivacyPrefs } from "@/shared/types/user";

export function UserPrivacyPage() {
  const s = useSettingsStore();
  const p = s.privacy;

  return (
    <div className="space-y-2">
      <div
        className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3"
      >
        <div className="flex items-start gap-2">
          <User size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
          <div>
            <p className="text-content font-medium text-fg-default">Visibilidad del perfil</p>
            <p className="text-card-meta text-fg-subtle">Quién puede ver tu perfil completo.</p>
          </div>
        </div>
        <div className="shrink-0">
          <select
            value={p.profileVisibility}
            onChange={(e) => s.setPrivacy("profileVisibility", e.target.value as UserPrivacyPrefs["profileVisibility"])}
            className="rounded-input border border-border-default bg-bg-card px-2 py-1 text-content text-fg-default"
          >
            <option value="public">Público</option>
            <option value="workspace">Espacio de trabajo</option>
            <option value="private">Privado</option>
          </select>
        </div>
      </div>

      <div
        className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3"
      >
        <div className="flex items-start gap-2">
          <Envelope size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
          <div>
            <p className="text-content font-medium text-fg-default">Mostrar email en perfil</p>
            <p className="text-card-meta text-fg-subtle">Otros miembros pueden ver tu correo.</p>
          </div>
        </div>
        <div className="shrink-0">
          <input
            type="checkbox"
            checked={p.showEmail}
            onChange={(e) => s.setPrivacy("showEmail", e.target.checked)}
            className="h-4 w-4 rounded border-border-default"
          />
        </div>
      </div>

      <div
        className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3"
      >
        <div className="flex items-start gap-2">
          <Lightning size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
          <div>
            <p className="text-content font-medium text-fg-default">Mostrar actividad</p>
            <p className="text-card-meta text-fg-subtle">Tu historial aparece en el feed del tablero.</p>
          </div>
        </div>
        <div className="shrink-0">
          <input
            type="checkbox"
            checked={p.showActivity}
            onChange={(e) => s.setPrivacy("showActivity", e.target.checked)}
            className="h-4 w-4 rounded border-border-default"
          />
        </div>
      </div>

      <div
        className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3"
      >
        <div className="flex items-start gap-2">
          <At size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
          <div>
            <p className="text-content font-medium text-fg-default">Permitir mensajes directos</p>
            <p className="text-card-meta text-fg-subtle">Otros miembros pueden escribirte directamente.</p>
          </div>
        </div>
        <div className="shrink-0">
          <input
            type="checkbox"
            checked={p.allowDM}
            onChange={(e) => s.setPrivacy("allowDM", e.target.checked)}
            className="h-4 w-4 rounded border-border-default"
          />
        </div>
      </div>

      <div
        className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3"
      >
        <div className="flex items-start gap-2">
          <ShieldCheck size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
          <div>
            <p className="text-content font-medium text-fg-default">Excluirme de analíticas</p>
            <p className="text-card-meta text-fg-subtle">No incluir mi uso en métricas agregadas.</p>
          </div>
        </div>
        <div className="shrink-0">
          <input
            type="checkbox"
            checked={p.analyticsOptOut}
            onChange={(e) => s.setPrivacy("analyticsOptOut", e.target.checked)}
            className="h-4 w-4 rounded border-border-default"
          />
        </div>
      </div>
    </div>
  );
}