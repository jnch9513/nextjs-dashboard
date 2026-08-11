"use client"

import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"

import { userManagementApi, type CreateUserInput } from "@/lib/user-management/api"
import { useSession } from "@/lib/user-management/session-context"
import {
  EMPTY_FILTERS,
  canManageUsers,
  isParticipantScoped,
  type ManagedUser,
  type StatusCode,
  type UserFilters,
} from "@/lib/user-management/types"
import { CreateUserDialog } from "@/components/user-management/create-user-dialog"
import { PendingApprovals } from "@/components/user-management/pending-approvals"
import { UserFiltersBar } from "@/components/user-management/user-filters"
import { UserTable } from "@/components/user-management/user-table"

export default function UserManagementPage() {
  const { session } = useSession()
  const [filters, setFilters] = useState<UserFilters>(EMPTY_FILTERS)

  const canManage = canManageUsers(session.roleCode)
  const showParticipant = !isParticipantScoped(session.roleCode)

  // Keyed on session + filters so switching acting-as user or changing a filter
  // refetches the correctly scoped list (query params in production).
  const usersKey = [
    "um-users",
    session.id,
    filters.participantCode,
    filters.username,
    filters.status,
    filters.roleCode,
  ] as const
  const {
    data: users,
    isLoading,
    mutate: mutateUsers,
  } = useSWR(usersKey, () => userManagementApi.listUsers(session, filters))

  const pendingKey = ["um-pending", session.id] as const
  const { data: pending, mutate: mutatePending } = useSWR(pendingKey, () =>
    userManagementApi.listPending(session),
  )

  async function refresh() {
    await Promise.all([mutateUsers(), mutatePending()])
  }

  async function handleCreate(input: CreateUserInput) {
    await userManagementApi.createUserRequest(session, input)
    toast.success("User request submitted", {
      description: `${input.fullName} is pending approval by another admin.`,
    })
    await refresh()
  }

  async function handleStatusChange(user: ManagedUser, status: StatusCode) {
    await userManagementApi.requestStatusChange(session, user.id, status)
    toast("Status change requested", { description: `${user.fullName} is pending approval.` })
    await refresh()
  }

  async function handleDelete(user: ManagedUser) {
    await userManagementApi.requestDelete(session, user.id)
    toast("Deletion requested", { description: `${user.fullName} is pending approval.` })
    await refresh()
  }

  async function handleApprove(user: ManagedUser) {
    await userManagementApi.approveRequest(user.id)
    toast.success("Request approved", { description: `${user.fullName} updated.` })
    await refresh()
  }

  async function handleReject(user: ManagedUser) {
    await userManagementApi.rejectRequest(user.id)
    toast("Request rejected", { description: `${user.fullName}'s request was rejected.` })
    await refresh()
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">
          {showParticipant
            ? "Manage users across all participants."
            : `Manage users for participant ${session.participantCode}.`}
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <UserFiltersBar filters={filters} onChange={setFilters} showParticipant={showParticipant} />
        {canManage ? (
          <div className="shrink-0">
            <CreateUserDialog session={session} onCreate={handleCreate} />
          </div>
        ) : null}
      </div>

      {canManage ? (
        <PendingApprovals
          pending={pending ?? []}
          session={session}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : null}

      <UserTable
        users={users ?? []}
        isLoading={isLoading}
        session={session}
        onRequestStatusChange={handleStatusChange}
        onRequestDelete={handleDelete}
      />
    </div>
  )
}
