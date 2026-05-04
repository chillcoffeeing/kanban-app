import { useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  LightningIcon,
  AtIcon,
  ShieldCheckIcon,
  FloppyDiskIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { useSettingsStore } from "@/stores/settingsStore";
import type { UserPrivacyPrefs } from "@/shared/types/user";
import { Button } from "@/shared/components/Button";

export function UserPrivacyPage() {
  const store = useSettingsStore();
  const p = store.privacy;

  const [form, setForm] = useState({
    profileVisibility: p.profileVisibility,
    showEmail: p.showEmail,
    showActivity: p.showActivity,
    allowDM: p.allowDM,
    analyticsOptOut: p.analyticsOptOut,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const hasChanges =
    form.profileVisibility !== p.profileVisibility ||
    form.showEmail !== p.showEmail ||
    form.showActivity !== p.showActivity ||
    form.allowDM !== p.allowDM ||
    form.analyticsOptOut !== p.analyticsOptOut;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await store.apply({ privacy: form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      profileVisibility: p.profileVisibility,
      showEmail: p.showEmail,
      showActivity: p.showActivity,
      allowDM: p.allowDM,
      analyticsOptOut: p.analyticsOptOut,
    });
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div
          className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3"
        >
          <div className="flex items-start gap-2">
            <UserIcon size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
            <div>
              <p className="text-content font-medium text-fg-default">Visibilidad del perfil</p>
              <p className="text-card-meta text-fg-subtle">Quién puede ver tu perfil completo.</p>
            </div>
          </div>
          <div className="shrink-0">
            <select
              value={form.profileVisibility}
              onChange={(e) => set("profileVisibility", e.target.value as UserPrivacyPrefs["profileVisibility"])}
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
            <EnvelopeIcon size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
            <div>
              <p className="text-content font-medium text-fg-default">Mostrar email en perfil</p>
              <p className="text-card-meta text-fg-subtle">Otros miembros pueden ver tu correo.</p>
            </div>
          </div>
          <div className="shrink-0">
            <input
              type="checkbox"
              checked={form.showEmail}
              onChange={(e) => set("showEmail", e.target.checked)}
              className="h-4 w-4 rounded border-border-default"
            />
          </div>
        </div>

        <div
          className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3"
        >
          <div className="flex items-start gap-2">
            <LightningIcon size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
            <div>
              <p className="text-content font-medium text-fg-default">Mostrar actividad</p>
              <p className="text-card-meta text-fg-subtle">Tu historial aparece en el feed del tablero.</p>
            </div>
          </div>
          <div className="shrink-0">
            <input
              type="checkbox"
              checked={form.showActivity}
              onChange={(e) => set("showActivity", e.target.checked)}
              className="h-4 w-4 rounded border-border-default"
            />
          </div>
        </div>

        <div
          className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3"
        >
          <div className="flex items-start gap-2">
            <AtIcon size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
            <div>
              <p className="text-content font-medium text-fg-default">Permitir mensajes directos</p>
              <p className="text-card-meta text-fg-subtle">Otros miembros pueden escribirte directamente.</p>
            </div>
          </div>
          <div className="shrink-0">
            <input
              type="checkbox"
              checked={form.allowDM}
              onChange={(e) => set("allowDM", e.target.checked)}
              className="h-4 w-4 rounded border-border-default"
            />
          </div>
        </div>

        <div
          className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3"
        >
          <div className="flex items-start gap-2">
            <ShieldCheckIcon size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
            <div>
              <p className="text-content font-medium text-fg-default">Excluirme de analíticas</p>
              <p className="text-card-meta text-fg-subtle">No incluir mi uso en métricas agregadas.</p>
            </div>
          </div>
          <div className="shrink-0">
            <input
              type="checkbox"
              checked={form.analyticsOptOut}
              onChange={(e) => set("analyticsOptOut", e.target.checked)}
              className="h-4 w-4 rounded border-border-default"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border-default">
        <Button variant="primary" onClick={handleSave} disabled={saving || !hasChanges}>
          <FloppyDiskIcon size={20} weight="duotone" />
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
        {hasChanges && (
          <Button variant="ghost" onClick={handleReset} disabled={saving}>
            <ArrowCounterClockwiseIcon size={20} weight="duotone" /> Descartar
          </Button>
        )}
        {saved && (
          <span className="text-content text-fg-success">Privacidad guardada correctamente</span>
        )}
      </div>
    </div>
  );
}
