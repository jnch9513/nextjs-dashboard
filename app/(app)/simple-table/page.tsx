import { SimpleUserTable } from "@/components/simple-table/simple-user-table"

export default function SimpleTablePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">Simple Table</h1>
        <p className="text-pretty text-muted-foreground">
          A minimal, config-driven table (no sorting, no avatars) wired to one endpoint. Swap{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">USERS_ENDPOINT</code> in{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">lib/simple-table/use-users.ts</code>{" "}
          to point at your Spring Boot API &mdash; nothing else changes.
        </p>
      </header>
      <SimpleUserTable />
    </div>
  )
}
