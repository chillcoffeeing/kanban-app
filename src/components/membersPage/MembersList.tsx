import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BoardMember, Permission } from "@/shared/types";
import { PERMISSIONS } from "@/shared/utils/constants";
import { TrashIcon, UserIcon } from "@phosphor-icons/react";
import MembersItem, { PendingRequest } from "./MembersItem";

export default function MembersList({
  members,
  pendingRequests,
  handleRemoveMember,
  togglePermission,
}: {
  members: BoardMember[];
  pendingRequests: PendingRequest[];
  handleRemoveMember: (member: BoardMember) => void;
  togglePermission: (memberId: string, permission: Permission) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {members.map((member) => {
        const memberPendingRequests = pendingRequests.filter(
          (pr) => pr.requesterId === member.id,
        );

        return (
          <MembersItem
            key={member.id}
            member={member}
            togglePermission={togglePermission}
            handleRemoveMember={handleRemoveMember}
            memberPendingRequests={memberPendingRequests || []}
          />
        );
      })}
    </div>
  );
}
