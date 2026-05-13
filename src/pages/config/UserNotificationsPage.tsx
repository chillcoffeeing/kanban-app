import { useState, useEffect } from "react";
import {
  EnvelopeIcon,
  DeviceMobileIcon,
  BellIcon,
  UserIcon,
  AtIcon,
  FloppyDiskIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { useSettingsStore } from "@/stores/settingsStore";
import { Button } from "@/shared/components/Button";

export function UserNotificationsPage() {
  const store = useSettingsStore();

  const [form, setForm] = useState({
    emailEnabled: store.emailEnabled,
    pushEnabled: store.pushEnabled,
    mentions: store.mentions,
    cardAssigned: store.cardAssigned,
    cardDueSoon: store.cardDueSoon,
    boardInvites: store.boardInvites,
    weeklyDigest: store.weeklyDigest,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const hasChanges =
    form.emailEnabled !== store.emailEnabled ||
    form.pushEnabled !== store.pushEnabled ||
    form.mentions !== store.mentions ||
    form.cardAssigned !== store.cardAssigned ||
    form.cardDueSoon !== store.cardDueSoon ||
    form.boardInvites !== store.boardInvites ||
    form.weeklyDigest !== store.weeklyDigest;

  // Sync form from store when user resets
  useEffect(() => {
    setForm({
      emailEnabled: store.emailEnabled,
      pushEnabled: store.pushEnabled,
      mentions: store.mentions,
      cardAssigned: store.cardAssigned,
      cardDueSoon: store.cardDueSoon,
      boardInvites: store.boardInvites,
      weeklyDigest: store.weeklyDigest,
    });
  }, [store.emailEnabled, store.pushEnabled, store.mentions, store.cardAssigned, store.cardDueSoon, store.boardInvites, store.weeklyDigest]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await store.apply(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      emailEnabled: store.emailEnabled,
      pushEnabled: store.pushEnabled,
      mentions: store.mentions,
      cardAssigned: store.cardAssigned,
      cardDueSoon: store.cardDueSoon,
      boardInvites: store.boardInvites,
      weeklyDigest: store.weeklyDigest,
    });
    setSaved(false);
  };

  const rows: Array<[keyof typeof form, string, string, PhosphorIcon]> = [
    ["emailEnabled", "Notificaciones por email", "Recibe resúmenes y alertas por correo.", EnvelopeIcon],
    ["pushEnabled", "Notificaciones push", "Avisos en el navegador o dispositivo.", DeviceMobileIcon],
    ["mentions", "Menciones", "Cuando alguien te menciona (@).", AtIcon],
    ["cardAssigned", "Tarjetas asignadas", "Cuando te agregan a una tarjeta.", UserIcon],
    ["cardDueSoon", "Vencimientos próximos", "Alerta antes de la fecha de entrega.", BellIcon],
    ["boardInvites", "Invitaciones a tableros", "Cuando te invitan a colaborar.", EnvelopeIcon],
    ["weeklyDigest", "Resumen semanal", "Actividad consolidada cada lunes.", BellIcon],
  ];

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
          <span className="text-content text-success">Notificaciones guardadas correctamente</span>
        )}
      </div>
      <section className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <BellIcon size={20} weight="duotone" className="text-primary/70" />
          Preferencias de notificaciones
        </h3>
        <p className="mb-4 text-sm text-neutral-dark/60">Configura cómo y cuándo recibir avisos.</p>
        <div className="space-y-2">
          {rows.map(([key, title, desc, Icon]) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 rounded-lg border border-neutral-light bg-neutral-light/30 p-3 hover:bg-neutral-light-hover transition-colors"
            >
              <div className="flex items-start gap-2">
                <Icon size={22} weight="duotone" className="mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-neutral-dark">{title}</p>
                  <p className="mt-0.5 text-xs text-neutral-dark/60">{desc}</p>
                </div>
              </div>
              <div className="shrink-0">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="size-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
