export type FamilyPlanningHorizon = 'day' | 'week' | 'month' | 'year'

export type FamilyMemberRole = 'owner' | 'partner' | 'shared'

export type FamilyTaskStatus = 'todo' | 'in_progress' | 'done'

export type FamilyGoalStatus = 'draft' | 'active' | 'done'

export type FamilyCalendarEventKind = 'ritual' | 'meeting' | 'deadline' | 'rest'

export interface FamilyMember {
  id: string
  name: string
  role: FamilyMemberRole
  focus: string
}

export interface FamilyGoal {
  id: string
  title: string
  horizon: FamilyPlanningHorizon
  ownerIds: string[]
  supporterIds: string[]
  status: FamilyGoalStatus
  metric: string
  nextStep: string
}

export interface FamilyTask {
  id: string
  title: string
  horizon: FamilyPlanningHorizon
  status: FamilyTaskStatus
  assigneeIds: string[]
  forMemberIds: string[]
  dueLabel: string
  relatedGoalId?: string
  notes?: string
}

export interface FamilyCalendarEvent {
  id: string
  title: string
  horizon: FamilyPlanningHorizon
  dateLabel: string
  kind: FamilyCalendarEventKind
  participantIds: string[]
  notes?: string
}

export interface FamilyPlanningSnapshot {
  updatedAtIso: string
  members: FamilyMember[]
  goals: FamilyGoal[]
  tasks: FamilyTask[]
  events: FamilyCalendarEvent[]
}
