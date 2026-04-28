import {
  Envelope,
  DeviceMobile,
  Bell,
  User,
  At,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { useSettingsStore } from "@/stores/settingsStore";
import type { UserNotificationPrefs } from "@/shared/types/user";

export function UserNotificationsPage() {
  const s = useSettingsStore();
  const n = s.notifications;

  const rows: Array<[keyof UserNotificationPrefs, string, string, PhosphorIcon]> = [
    ["emailEnabled", "Notificaciones por email", "Recibe resúmenes y alertas por correo.", Envelope],
    ["pushEnabled", "Notificaciones push", "Avisos en el navegador o dispositivo.", DeviceMobile],
    ["mentions", "Menciones", "Cuando alguien te menciona (@).", At],
    ["cardAssigned", "Tarjetas asignadas", "Cuando te agregan a una tarjeta.", User],
    ["cardDueSoon", "Vencimientos próximos", "Alerta antes de la fecha de entrega.", Bell],
    ["boardInvites", "Invitaciones a tableros", "Cuando te invitan a colaborar.", Envelope],
    ["weeklyDigest", "Resumen semanal", "Actividad consolidada cada lunes.", Bell],
  ];

  return (
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
              checked={!!n[key]}
              onChange={(e) => s.setNotification(key, e.target.checked)}
              className="h-4 w-4 rounded border-border-default"
            />
          </div>
        </div>
      ))}
    </div>
  );
}