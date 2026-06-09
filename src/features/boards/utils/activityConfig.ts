import type { ActivityType } from '@/shared/types/domain'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import {
  StackIcon,
  FileTextIcon,
  ArrowsLeftRightIcon,
  TrashIcon,
  TagIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  NotePencilIcon,
} from '@phosphor-icons/react'
import { ACTIVITY_TYPES } from '@/stores/activityStore'

export const ICON_MAP: Partial<Record<ActivityType, PhosphorIcon>> = {
  [ACTIVITY_TYPES.BOARD_RENAMED]: NotePencilIcon,
  [ACTIVITY_TYPES.STAGE_CREATED]: StackIcon,
  [ACTIVITY_TYPES.STAGE_RENAMED]: NotePencilIcon,
  [ACTIVITY_TYPES.STAGE_DELETED]: TrashIcon,
  [ACTIVITY_TYPES.CARD_CREATED]: FileTextIcon,
  [ACTIVITY_TYPES.CARD_UPDATED]: NotePencilIcon,
  [ACTIVITY_TYPES.CARD_MOVED]: ArrowsLeftRightIcon,
  [ACTIVITY_TYPES.CARD_DELETED]: TrashIcon,
  [ACTIVITY_TYPES.CARD_LABEL_ADDED]: TagIcon,
  [ACTIVITY_TYPES.CARD_LABEL_REMOVED]: TagIcon,
  [ACTIVITY_TYPES.CARD_DATE_SET]: CalendarBlankIcon,
  [ACTIVITY_TYPES.CARD_CHECKLIST_ADDED]: CheckCircleIcon,
  [ACTIVITY_TYPES.CARD_CHECKLIST_TOGGLED]: CheckCircleIcon,
  [ACTIVITY_TYPES.MEMBER_JOINED_CARD]: UserPlusIcon,
  [ACTIVITY_TYPES.MEMBER_LEFT_CARD]: UserMinusIcon,
  [ACTIVITY_TYPES.MEMBER_INVITED]: UserPlusIcon,
  [ACTIVITY_TYPES.MEMBER_REMOVED]: UserMinusIcon,
}

export const COLOR_MAP: Partial<Record<ActivityType, string>> = {
  [ACTIVITY_TYPES.CARD_DELETED]: 'text-danger bg-danger',
  [ACTIVITY_TYPES.STAGE_DELETED]: 'text-danger bg-danger',
  [ACTIVITY_TYPES.MEMBER_REMOVED]: 'text-danger bg-danger',
  [ACTIVITY_TYPES.MEMBER_LEFT_CARD]: 'text-warning bg-warning',
  [ACTIVITY_TYPES.CARD_MOVED]: 'text-info bg-info',
  [ACTIVITY_TYPES.MEMBER_INVITED]: 'text-success bg-success',
  [ACTIVITY_TYPES.MEMBER_JOINED_CARD]: 'text-success bg-success',
  [ACTIVITY_TYPES.CARD_CREATED]: 'text-success bg-success',
  [ACTIVITY_TYPES.STAGE_CREATED]: 'text-success bg-success',
}
