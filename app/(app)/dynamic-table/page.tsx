import { DynamicUserTable } from "@/components/dynamic-table/dynamic-user-table"

export default function DynamicTablePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">Dynamic Table</h1>
        <p className="text-pretty text-muted-foreground">
          Declarative Spring pagination, search fields, formatting, and responsive columns. Add
          your API URL to{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            lib/dynamic-table/users-api.ts
          </code>{" "}
          when the endpoint is ready.
        </p>
      </header>
      <DynamicUserTable />
    </div>
  )
}
