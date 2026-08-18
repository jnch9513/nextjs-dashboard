import { SEED_USERS } from "./mock-data"
import type { ManagedUser, StatusCode } from "./types"

// In-memory store for the mock Spring Boot API. This lets the demo mutations
// (status change / delete) persist across refreshes within a running server
// session. A real Spring backend owns this state instead.
//
// `globalThis` caching survives dev-server hot reloads so edits don't reset
// the list mid-demo.
const store = globalThis as unknown as { __userStore?: ManagedUser[] }

if (!store.__userStore) {
  store.__userStore = SEED_USERS.map((u) => ({ ...u }))
}

const users = store.__userStore

export function listUsers(): ManagedUser[] {
  return users
}

export function setUserStatus(id: string, status: StatusCode): ManagedUser | null {
  const user = users.find((u) => u.id === id)
  if (!user) return null
  user.status = status
  return user
}

export function deleteUser(id: string): boolean {
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return false
  users.splice(index, 1)
  return true
}
