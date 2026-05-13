import { useState, useEffect } from "react";
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
import { Button } from "@/shared/components/Button";
import type { UserPreferenceJson } from "@/shared/types/api";

export function UserPrivacyPage() {
  const store = useSettingsStore();

  const [form, setForm] = useState({
    profileVisibility: store.profileVisibility,
    showEmail: store.showEmail,
    showActivity: store.showActivity,
    allowDM: store.allowDM,
    analyticsOptOut: store.analyticsOptOut,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const hasChanges =
    form.profileVisibility !== store.profileVisibility ||
    form.showEmail !== store.showEmail ||
    form.showActivity !== store.showActivity ||
    form.allowDM !== store.allowDM ||
    form.analyticsOptOut !== store.analyticsOptOut;

  // Sync form from store when user resets
  useEffect(() => {
    setForm({
      profileVisibility: store.profileVisibility,
      showEmail: store.showEmail,
      showActivity: store.showActivity,
      allowDM: store.allowDM,
      analyticsOptOut: store.analyticsOptOut,
    });
  }, [store.profileVisibility, store.showEmail, store.showActivity, store.allowDM, store.analyticsOptOut]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await store.apply(form as unknown as Partial<UserPreferenceJson>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      profileVisibility: store.profileVisibility,
      showEmail: store.showEmail,
      showActivity: store.showActivity,
      allowDM: store.allowDM,
      analyticsOptOut: store.analyticsOptOut,
    });
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
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
          <span className="text-content text-success">Privacidad guardada correctamente</span>
        )}
      </div>
      <section className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <ShieldCheckIcon size={20} weight="duotone" className="text-primary/70" />
          Configuración de privacidad
        </h3>
        <p className="mb-4 text-sm text-neutral-dark/60">Controla qué información es visible y cómo se usa.</p>
        <div className="space-y-2">
        <div
          className="flex items-start justify-between gap-4 rounded-lg border border-neutral-light bg-neutral-light/30 p-3 hover:bg-neutral-light-hover transition-colors"
        >
          <div className="flex items-start gap-3">
            <UserIcon size={22} weight="duotone" className="mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium text-neutral-dark">Visibilidad del perfil</p>
              <p className="mt-0.5 text-xs text-neutral-dark/60">Quién puede ver tu perfil completo.</p>
            </div>
          </div>
          <div className="shrink-0">
            <select
              value={form.profileVisibility}
              onChange={(e) => set("profileVisibility", e.target.value)}
              className="rounded-lg border border-neutral-light bg-surface px-3 py-1.5 text-sm text-neutral-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="public">Público</option>
              <option value="workspace">Espacio de trabajo</option>
              <option value="private">Privado</option>
            </select>
          </div>
        </div>

        <div
          className="flex items-start justify-between gap-4 rounded-lg border border-neutral-light bg-neutral-light/30 p-3 hover:bg-neutral-light-hover transition-colors"
        >
          <div className="flex items-start gap-3">
            <EnvelopeIcon size={22} weight="duotone" className="mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium text-neutral-dark">Mostrar email en perfil</p>
              <p className="mt-0.5 text-xs text-neutral-dark/60">Otros miembros pueden ver tu correo.</p>
            </div>
          </div>
          <div className="shrink-0">
            <input
              type="checkbox"
              checked={form.showEmail}
              onChange={(e) => set("showEmail", e.target.checked)}
              className="size-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div
          className="flex items-start justify-between gap-4 rounded-lg border border-neutral-light bg-neutral-light/30 p-3 hover:bg-neutral-light-hover transition-colors"
        >
          <div className="flex items-start gap-3">
            <LightningIcon size={22} weight="duotone" className="mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium text-neutral-dark">Mostrar actividad</p>
              <p className="mt-0.5 text-xs text-neutral-dark/60">Tu historial aparece en el feed del tablero.</p>
            </div>
          </div>
          <div className="shrink-0">
            <input
              type="checkbox"
              checked={form.showActivity}
              onChange={(e) => set("showActivity", e.target.checked)}
              className="size-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div
          className="flex items-start justify-between gap-4 rounded-lg border border-neutral-light bg-neutral-light/30 p-3 hover:bg-neutral-light-hover transition-colors"
        >
          <div className="flex items-start gap-3">
            <AtIcon size={22} weight="duotone" className="mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium text-neutral-dark">Permitir mensajes directos</p>
              <p className="mt-0.5 text-xs text-neutral-dark/60">Otros miembros pueden escribirte directamente.</p>
            </div>
          </div>
          <div className="shrink-0">
            <input
              type="checkbox"
              checked={form.allowDM}
              onChange={(e) => set("allowDM", e.target.checked)}
              className="size-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div
          className="flex items-start justify-between gap-4 rounded-lg border border-neutral-light bg-neutral-light/30 p-3 hover:bg-neutral-light-hover transition-colors"
        >
          <div className="flex items-start gap-3">
            <ShieldCheckIcon size={22} weight="duotone" className="mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium text-neutral-dark">Excluirme de analíticas</p>
              <p className="mt-0.5 text-xs text-neutral-dark/60">No incluir mi uso en métricas agregadas.</p>
            </div>
          </div>
          <div className="shrink-0">
            <input
              type="checkbox"
              checked={form.analyticsOptOut}
              onChange={(e) => set("analyticsOptOut", e.target.checked)}
              className="size-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
