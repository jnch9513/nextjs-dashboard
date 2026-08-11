"use client"

import { createContext, useContext, useMemo, useState } from "react"

import type { SessionUser } from "./types"
import { SESSIONS } from "./mock-data"

// Provides the current authenticated principal. The "acting as" switcher lets
// you preview each role's view during development.
//
// In production, replace the local state below with the real session, e.g.
//   const { data: session } = useSWR<SessionUser>("/api/me", fetcher)
// and drop `availableSessions` / `setSessionId`.

type SessionContextValue = {
  session: SessionUser
  availableSessions: SessionUser[]
  setSessionId: (id: string) => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string>(SESSIONS[0].id)

  const session = useMemo(
    () => SESSIONS.find((s) => s.id === sessionId) ?? SESSIONS[0],
    [sessionId],
  )

  const value = useMemo(
    () => ({ session, availableSessions: SESSIONS, setSessionId }),
    [session],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within a SessionProvider")
  return ctx
}
