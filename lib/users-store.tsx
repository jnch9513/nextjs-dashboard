"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

export type UserStatus = "active" | "inactive" | "pending" | "rejected"

// Sensitive actions that must go through maker-checker approval.
export type RequestType = "create" | "inactivate" | "delete"

export type ManagedUser = {
  id: string
  name: string
  email: string
  role: string
  status: UserStatus
  createdAt: string
  // Populated while a request is awaiting approval.
  pendingRequest?: {
    type: RequestType
    requestedById: string
    requestedByName: string
    requestedAt: string
  }
}

export type Admin = {
  id: string
  name: string
  email: string
}

// The people who can act in the console. The "acting as" switcher lets you
// demonstrate maker-checker: a request must be approved by a different admin.
export const ADMINS: Admin[] = [
  { id: "adm_alice", name: "Alice Chan", email: "alice.chan@acme.com" },
  { id: "adm_bob", name: "Bob Wong", email: "bob.wong@acme.com" },
  { id: "adm_carol", name: "Carol Ng", email: "carol.ng@acme.com" },
]

const ROLES = ["Administrator", "Manager", "Analyst", "Viewer"]
export { ROLES }

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

const SEED_USERS: ManagedUser[] = [
  {
    id: uid("usr"),
    name: "David Lee",
    email: "david.lee@acme.com",
    role: "Manager",
    status: "active",
    createdAt: "2025-11-02T09:15:00Z",
  },
  {
    id: uid("usr"),
    name: "Emma Watson",
    email: "emma.watson@acme.com",
    role: "Analyst",
    status: "active",
    createdAt: "2025-12-18T14:30:00Z",
  },
  {
    id: uid("usr"),
    name: "Frank Miller",
    email: "frank.miller@acme.com",
    role: "Viewer",
    status: "inactive",
    createdAt: "2025-09-21T11:05:00Z",
  },
  {
    id: uid("usr"),
    name: "Grace Kim",
    email: "grace.kim@acme.com",
    role: "Analyst",
    status: "pending",
    createdAt: "2026-07-19T08:45:00Z",
    pendingRequest: {
      type: "create",
      requestedById: "adm_bob",
      requestedByName: "Bob Wong",
      requestedAt: "2026-07-19T08:45:00Z",
    },
  },
]

type CreateUserInput = { name: string; email: string; role: string }

type UsersContextValue = {
  users: ManagedUser[]
  currentAdmin: Admin
  setCurrentAdminId: (id: string) => void
  createUserRequest: (input: CreateUserInput) => void
  requestInactivate: (id: string) => void
  requestDelete: (id: string) => void
  approveRequest: (id: string) => void
  rejectRequest: (id: string) => void
  reactivateUser: (id: string) => void
}

const UsersContext = createContext<UsersContextValue | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<ManagedUser[]>(SEED_USERS)
  const [currentAdminId, setCurrentAdminId] = useState<string>(ADMINS[0].id)

  const currentAdmin = useMemo(
    () => ADMINS.find((a) => a.id === currentAdminId) ?? ADMINS[0],
    [currentAdminId],
  )

  const createUserRequest = useCallback(
    (input: CreateUserInput) => {
      setUsers((prev) => [
        {
          id: uid("usr"),
          name: input.name,
          email: input.email,
          role: input.role,
          status: "pending",
          createdAt: new Date().toISOString(),
          pendingRequest: {
            type: "create",
            requestedById: currentAdmin.id,
            requestedByName: currentAdmin.name,
            requestedAt: new Date().toISOString(),
          },
        },
        ...prev,
      ])
    },
    [currentAdmin],
  )

  const requestInactivate = useCallback(
    (id: string) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                pendingRequest: {
                  type: "inactivate",
                  requestedById: currentAdmin.id,
                  requestedByName: currentAdmin.name,
                  requestedAt: new Date().toISOString(),
                },
              }
            : u,
        ),
      )
    },
    [currentAdmin],
  )

  const requestDelete = useCallback(
    (id: string) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                pendingRequest: {
                  type: "delete",
                  requestedById: currentAdmin.id,
                  requestedByName: currentAdmin.name,
                  requestedAt: new Date().toISOString(),
                },
              }
            : u,
        ),
      )
    },
    [currentAdmin],
  )

  const approveRequest = useCallback((id: string) => {
    setUsers((prev) =>
      prev.flatMap((u) => {
        if (u.id !== id || !u.pendingRequest) return [u]
        const { type } = u.pendingRequest
        if (type === "delete") return []
        if (type === "create") return [{ ...u, status: "active", pendingRequest: undefined }]
        // inactivate
        return [{ ...u, status: "inactive", pendingRequest: undefined }]
      }),
    )
  }, [])

  const rejectRequest = useCallback((id: string) => {
    setUsers((prev) =>
      prev.flatMap((u) => {
        if (u.id !== id || !u.pendingRequest) return [u]
        const { type } = u.pendingRequest
        // A rejected brand-new user is removed; other rejected requests just
        // clear the pending flag and keep the previous status.
        if (type === "create") return [{ ...u, status: "rejected", pendingRequest: undefined }]
        return [{ ...u, pendingRequest: undefined }]
      }),
    )
  }, [])

  const reactivateUser = useCallback((id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" } : u)))
  }, [])

  const value: UsersContextValue = {
    users,
    currentAdmin,
    setCurrentAdminId,
    createUserRequest,
    requestInactivate,
    requestDelete,
    approveRequest,
    rejectRequest,
    reactivateUser,
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export function useUsers() {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error("useUsers must be used within a UsersProvider")
  return ctx
}
