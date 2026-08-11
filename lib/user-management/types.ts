// Domain model for user management. These types mirror the shape the Spring
// Boot backend is expected to return, so swapping the mock API in
// `api.ts` for real `fetch` calls requires no changes here or in the UI.

export type StatusCode = "IS" | "A" | "TL" | "PL" | "S" | "D"
export type RoleCode = "PO" | "MLA" | "MLN"

export const STATUS_LABELS: Record<StatusCode, string> = {
  IS: "Invitation Sent",
  A: "Active",
  TL: "Temp Locked",
  PL: "Perm Locked",
  S: "Suspended",
  D: "Deleted",
}

export const ROLE_LABELS: Record<RoleCode, string> = {
  PO: "Platform Operator",
  MLA: "ML Admin User",
  MLN: "ML Normal User",
}

export const STATUS_CODES: StatusCode[] = ["IS", "A", "TL", "PL", "S", "D"]
export const ROLE_CODES: RoleCode[] = ["PO", "MLA", "MLN"]

// Sensitive changes route through maker-checker approval.
export type PendingRequestType = "create" | "status_change" | "delete"

export type PendingRequest = {
  type: PendingRequestType
  // Target status for `create` (initial) and `status_change` requests.
  targetStatus?: StatusCode
  requestedById: string
  requestedByName: string
  requestedAt: string
}

export type ManagedUser = {
  id: string
  username: string
  fullName: string
  email: string
  roleCode: RoleCode
  status: StatusCode
  // The participant a user belongs to. Empty string for platform-level
  // (Platform Operator) accounts that are not tied to a single participant.
  participantCode: string
  createdAt: string
  pendingRequest?: PendingRequest
}

// The authenticated principal. In production this comes from `/api/me`
// (backed by the Spring session), not from the client.
export type SessionUser = {
  id: string
  fullName: string
  username: string
  roleCode: RoleCode
  participantCode: string // "" for Platform Operators
}

export type UserFilters = {
  participantCode: string
  username: string
  status: StatusCode | "all"
  roleCode: RoleCode | "all"
}

export const EMPTY_FILTERS: UserFilters = {
  participantCode: "",
  username: "",
  status: "all",
  roleCode: "all",
}

// Platform Operators see every participant; ML roles are scoped to their own.
export function isParticipantScoped(role: RoleCode): boolean {
  return role !== "PO"
}

// Platform Operators and ML Admins can manage users; ML Normal users are read-only.
export function canManageUsers(role: RoleCode): boolean {
  return role === "PO" || role === "MLA"
}

// Roles a given session is allowed to assign when creating a user.
export function assignableRoles(role: RoleCode): RoleCode[] {
  if (role === "PO") return ["PO", "MLA", "MLN"]
  if (role === "MLA") return ["MLA", "MLN"]
  return []
}
