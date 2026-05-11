import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ActivityState } from "./types";
import { createActivityActions } from "./activityActions";
import { ACTIVITY_TYPES } from "./constants";

export const useActivityStore = create<ActivityState>()(
  devtools(
    (set) => ({
      activities: [],
      ...createActivityActions(set),
    }),
    { name: "activityStore" },
  ),
);

export { ACTIVITY_TYPES };
