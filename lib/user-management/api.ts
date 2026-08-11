import {
  isParticipantScoped,
  type ManagedUser,
  type RoleCode,
  type SessionUser,
  type StatusCode,
  type UserFilters,
} from "./types"
import { SEED_USERS } from "./mock-data"

// ---------------------------------------------------------------------------
// Mock backend
//
// This module is the single seam between the UI and the server. Every method
// is async and returns the same shape the Spring Boot API is expected to
// return, so going live means replacing each body with a `fetch(...)` call
// (see the TODO markers) — the components never change.
//
// In production, scoping/authorization is enforced server-side from the
// session. The client-side scoping below only simulates that for the demo.
// ---------------------------------------------------------------------------

let store: ManagedUser[] = SEED_USERS.map((u) => ({ ...u }))

const LATENCY_MS = 300
function respond<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function scopeForSession(users: ManagedUser[], session: SessionUser): ManagedUser[] {
  if (!isParticipantScoped(session.roleCode)) return users
  return users.filter((u) => u.participantCode === session.participantCode)
}

function clone(users: ManagedUser[]): ManagedUser[] {
  return users.map((u) => ({ ...u, pendingRequest: u.pendingRequest ? { ...u.pendingRequest } : undefined }))
}

export type CreateUserInput = {
  username: string
  fullName: string
  email: string
  roleCode: RoleCode
  participantCode: string
}

export const userManagementApi = {
  async listUsers(session: SessionUser, filters: UserFilters): Promise<ManagedUser[]> {
    // TODO(spring): const p = new URLSearchParams({ ...filters });
    // return fetch(`/api/users?${p}`, { credentials: "include" }).then(r => r.json())
    let result = scopeForSession(store, session)

    const participant = filters.participantCode.trim().toUpperCase()
    if (!isParticipantScoped(session.roleCode) && participant) {
      result = result.filter((u) => u.participantCode.toUpperCase().includes(participant))
    }

    const username = filters.username.trim().toLowerCase()
    if (username) {
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(username) ||
          u.fullName.toLowerCase().includes(username),
      )
    }

    if (filters.status !== "all") {
      result = result.filter((u) => u.status === filters.status)
    }
    if (filters.roleCode !== "all") {
      result = result.filter((u) => u.roleCode === filters.roleCode)
    }

    return respond(clone(result))
  },

  async listPending(session: SessionUser): Promise<ManagedUser[]> {
    // TODO(spring): fetch(`/api/users/pending`, { credentials: "include" })
    const result = scopeForSession(store, session).filter((u) => u.pendingRequest)
    return respond(clone(result))
  },

  async createUserRequest(session: SessionUser, input: CreateUserInput): Promise<ManagedUser> {
    // TODO(spring): fetch(`/api/users`, { method: "POST", credentials: "include", body: JSON.stringify(input) })
    const now = new Date().toISOString()
    const user: ManagedUser = {
      id: uid("usr"),
      username: input.username,
      fullName: input.fullName,
      email: input.email,
      roleCode: input.roleCode,
      status: "IS",
      participantCode: isParticipantScoped(session.roleCode)
        ? session.participantCode
        : input.participantCode,
      createdAt: now,
      pendingRequest: {
        type: "create",
        targetStatus: "IS",
        requestedById: session.id,
        requestedByName: session.fullName,
        requestedAt: now,
      },
    }
    store = [user, ...store]
    return respond(user)
  },

  async requestStatusChange(
    session: SessionUser,
    userId: string,
    targetStatus: StatusCode,
  ): Promise<void> {
    // TODO(spring): fetch(`/api/users/${userId}/status`, { method: "POST", credentials: "include", body: JSON.stringify({ targetStatus }) })
    const now = new Date().toISOString()
    store = store.map((u) =>
      u.id === userId
        ? {
            ...u,
            pendingRequest: {
              type: "status_change",
              targetStatus,
              requestedById: session.id,
              requestedByName: session.fullName,
              requestedAt: now,
            },
          }
        : u,
    )
    return respond(undefined)
  },

  async requestDelete(session: SessionUser, userId: string): Promise<void> {
    // TODO(spring): fetch(`/api/users/${userId}`, { method: "DELETE", credentials: "include" })
    const now = new Date().toISOString()
    store = store.map((u) =>
      u.id === userId
        ? {
            ...u,
            pendingRequest: {
              type: "delete",
              targetStatus: "D",
              requestedById: session.id,
              requestedByName: session.fullName,
              requestedAt: now,
            },
          }
        : u,
    )
    return respond(undefined)
  },

  async approveRequest(userId: string): Promise<void> {
    // TODO(spring): fetch(`/api/users/${userId}/approve`, { method: "POST", credentials: "include" })
    store = store.flatMap((u) => {
      if (u.id !== userId || !u.pendingRequest) return [u]
      const { type, targetStatus } = u.pendingRequest
      if (type === "create") return [{ ...u, status: "IS" as StatusCode, pendingRequest: undefined }]
      return [{ ...u, status: targetStatus ?? u.status, pendingRequest: undefined }]
    })
    return respond(undefined)
  },

  async rejectRequest(userId: string): Promise<void> {
    // TODO(spring): fetch(`/api/users/${userId}/reject`, { method: "POST", credentials: "include" })
    store = store.flatMap((u) => {
      if (u.id !== userId || !u.pendingRequest) return [u]
      // A rejected brand-new user is discarded; other rejections keep the user.
      if (u.pendingRequest.type === "create") return []
      return [{ ...u, pendingRequest: undefined }]
    })
    return respond(undefined)
  },
}
