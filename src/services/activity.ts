import { ApiClient } from "./api";

export interface ActivityResponse {
  id: string;
  boardId: string;
  membershipId: string | null;
  userName?: string;
  type: string;
  detail: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

export const ActivityService = {
  listByBoard(
    boardId: string,
    opts?: { limit?: number; before?: string },
  ): Promise<ActivityResponse[]> {
    const params = new URLSearchParams();
    if (opts?.limit) params.set("limit", String(opts.limit));
    if (opts?.before) params.set("before", opts.before);
    const qs = params.toString();
    return ApiClient.get(`/boards/${boardId}/activity${qs ? `?${qs}` : ""}`);
  },
};
