import Link from "next/link"
import { ArrowRight, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome to the admin console.</p>
      </div>
      <Link href="/user-management" className="block max-w-sm">
        <Card className="transition-colors hover:border-foreground/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Users className="size-4" aria-hidden="true" />
                User Management
              </span>
              <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </CardTitle>
            <CardDescription>Maintain users and approve pending requests.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Create, deactivate, and remove users with maker-checker approval.
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
