import { useState } from "react";
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
import type { UserNotificationPrefs } from "@/shared/types/user";
import { Button } from "@/shared/components/Button";

export function UserNotificationsPage() {
  const store = useSettingsStore();
  const n = store.notifications;

  const [form, setForm] = useState({
    emailEnabled: n.emailEnabled,
    pushEnabled: n.pushEnabled,
    mentions: n.mentions,
    cardAssigned: n.cardAssigned,
    cardDueSoon: n.cardDueSoon,
    boardInvites: n.boardInvites,
    weeklyDigest: n.weeklyDigest,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const hasChanges =
    form.emailEnabled !== n.emailEnabled ||
    form.pushEnabled !== n.pushEnabled ||
    form.mentions !== n.mentions ||
    form.cardAssigned !== n.cardAssigned ||
    form.cardDueSoon !== n.cardDueSoon ||
    form.boardInvites !== n.boardInvites ||
    form.weeklyDigest !== n.weeklyDigest;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await store.apply({ notifications: form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      emailEnabled: n.emailEnabled,
      pushEnabled: n.pushEnabled,
      mentions: n.mentions,
      cardAssigned: n.cardAssigned,
      cardDueSoon: n.cardDueSoon,
      boardInvites: n.boardInvites,
      weeklyDigest: n.weeklyDigest,
    });
    setSaved(false);
  };

  const rows: Array<[keyof UserNotificationPrefs, string, string, PhosphorIcon]> = [
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
      <div className="space-y-2">
        {rows.map(([key, title, desc, Icon]) => (
          <div
            key={key}
            className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3"
          >
            <div className="flex items-start gap-2">
              <Icon size={22} weight="duotone" className="mt-0.5 text-icon-muted" />
              <div>
                <p className="text-content font-medium text-fg-default">{title}</p>
                <p className="text-card-meta text-fg-subtle">{desc}</p>
              </div>
            </div>
            <div className="shrink-0">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="h-4 w-4 rounded border-border-default"
              />
            </div>
          </div>
        ))}
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
          <span className="text-content text-fg-success">Notificaciones guardadas correctamente</span>
        )}
      </div>
    </div>
  );
}
