import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UserIcon, TrashIcon } from "@phosphor-icons/react";

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

interface PendingInvitationCardProps {
  invitation: PendingInvitation;
  onDelete: (invitationId: string, email: string) => void;
}

export function PendingInvitationCard({ invitation, onDelete }: PendingInvitationCardProps) {
  return (
    <div className="rounded-lg border border-neutral-light p-3 opacity-75">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-neutral-light-hover">
            <UserIcon
              size={20}
              className="text-neutral-dark"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-dark">
                {invitation.email}
              </span>
              <span className="rounded bg-warning px-1.5 py-0.5 text-xs text-warning">
                Pendiente
              </span>
              <span className="rounded bg-neutral-light/50 px-1.5 py-0.5 text-xs text-neutral-dark">
                {invitation.role}
              </span>
            </div>
            <p className="text-xs text-neutral-dark">
              Invitado:{" "}
              {format(new Date(invitation.createdAt), "P", { locale: es })}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDelete(invitation.id, invitation.email)}
          className="cursor-pointer text-danger hover:text-danger-hover"
        >
          <TrashIcon size={20} weight="duotone" />
        </button>
      </div>
    </div>
  );
}
