"use client"

import { CheckCircle2, Clock, Users, UserX } from "lucide-react"

import { useUsers } from "@/lib/users-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateUserDialog } from "@/components/user-management/create-user-dialog"
import { PendingApprovals } from "@/components/user-management/pending-approvals"
import { UserTable } from "@/components/user-management/user-table"

export default function UserManagementPage() {
  const { users } = useUsers()

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    pending: users.filter((u) => u.pendingRequest).length,
  }

  const cards = [
    { label: "Total users", value: stats.total, icon: Users, tint: "text-foreground" },
    { label: "Active", value: stats.active, icon: CheckCircle2, tint: "text-emerald-600" },
    { label: "Inactive", value: stats.inactive, icon: UserX, tint: "text-muted-foreground" },
    { label: "Pending approval", value: stats.pending, icon: Clock, tint: "text-amber-600" },
  ]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, deactivate, and remove users. Sensitive changes require a second admin&apos;s
            approval.
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className={`size-4 ${card.tint}`} aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <PendingApprovals />

      <UserTable />
    </div>
  )
}
