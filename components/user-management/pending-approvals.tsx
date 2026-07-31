"use client"

import { Check, Clock, X } from "lucide-react"
import { toast } from "sonner"

import { useUsers, type ManagedUser, type RequestType } from "@/lib/users-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const REQUEST_LABEL: Record<RequestType, string> = {
  create: "Create user",
  inactivate: "Inactivate user",
  delete: "Delete user",
}

export function PendingApprovals() {
  const { users, currentAdmin, approveRequest, rejectRequest } = useUsers()
  const pending = users.filter((u) => u.pendingRequest)

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
          Requests must be approved by an admin other than the requester.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.map((user) => (
          <PendingRow
            key={user.id}
            user={user}
            isOwnRequest={user.pendingRequest?.requestedById === currentAdmin.id}
            onApprove={() => {
              approveRequest(user.id)
              toast.success("Request approved", { description: `${user.name} updated.` })
            }}
            onReject={() => {
              rejectRequest(user.id)
              toast("Request rejected", { description: `${user.name}'s request was rejected.` })
            }}
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
            {REQUEST_LABEL[req.type]}
          </span>
          <span className="truncate font-medium">{user.name}</span>
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {user.email} &middot; {user.role} &middot; requested by {req.requestedByName}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isOwnRequest ? (
          <Tooltip>
            <TooltipTrigger
              render={<span tabIndex={0} className="text-xs text-muted-foreground" />}
            >
              Awaiting another admin
            </TooltipTrigger>
            <TooltipContent>
              You can&apos;t approve your own request. Switch admin to approve.
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
