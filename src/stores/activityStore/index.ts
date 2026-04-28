import { create } from "zustand";
import type { ActivityState } from "./types";
import { createActivityActions } from "./activityActions";
import { ACTIVITY_TYPES } from "./constants";

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  ...createActivityActions(set),
}));

export { ACTIVITY_TYPES };
