"use client"

import { Check, Clock, X } from "lucide-react"

import {
  ROLE_LABELS,
  STATUS_LABELS,
  type ManagedUser,
  type PendingRequest,
  type SessionUser,
} from "@/lib/user-management/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

function describeRequest(req: PendingRequest): string {
  if (req.type === "create") return "Create user"
  if (req.type === "delete") return "Delete user"
  return `Change to ${req.targetStatus ? STATUS_LABELS[req.targetStatus] : "new status"}`
}

export function PendingApprovals({
  pending,
  session,
  onApprove,
  onReject,
}: {
  pending: ManagedUser[]
  session: SessionUser
  onApprove: (user: ManagedUser) => void
  onReject: (user: ManagedUser) => void
}) {
  if (pending.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="size-4 text-amber-600" aria-hidden="true" />
          Pending approvals
          <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            {pending.length}
          </span>
        </CardTitle>
        <CardDescription>
          Placeholder approval flow &mdash; requests must be approved by an admin other than the
          requester.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.map((user) => (
          <PendingRow
            key={user.id}
            user={user}
            isOwnRequest={user.pendingRequest?.requestedById === session.id}
            onApprove={() => onApprove(user)}
            onReject={() => onReject(user)}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function PendingRow({
  user,
  isOwnRequest,
  onApprove,
  onReject,
}: {
  user: ManagedUser
  isOwnRequest: boolean
  onApprove: () => void
  onReject: () => void
}) {
  const req = user.pendingRequest!

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {describeRequest(req)}
          </span>
          <span className="truncate font-medium">{user.fullName}</span>
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          @{user.username} &middot; {ROLE_LABELS[user.roleCode]}
          {user.participantCode ? ` · ${user.participantCode}` : ""} &middot; requested by{" "}
          {req.requestedByName}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isOwnRequest ? (
          <Tooltip>
            <TooltipTrigger render={<span tabIndex={0} className="text-xs text-muted-foreground" />}>
              Awaiting another admin
            </TooltipTrigger>
            <TooltipContent>
              You can&apos;t approve your own request. Switch acting-as user to approve.
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={onReject}>
              <X className="size-4" aria-hidden="true" />
              Reject
            </Button>
            <Button size="sm" onClick={onApprove}>
              <Check className="size-4" aria-hidden="true" />
              Approve
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
