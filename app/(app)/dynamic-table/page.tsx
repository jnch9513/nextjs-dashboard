import {
  ArrowUpDown,
  CircleUser,
  Code2,
  Hash,
  ListChecks,
  Server,
} from "lucide-react"

import { ShowcaseTable } from "@/components/dynamic-table/showcase-table"

const capabilities = [
  {
    icon: Code2,
    title: "Declarative columns",
    body: "Describe each column as JSON — key, label, and type. The table renders itself from the config.",
  },
  {
    icon: Hash,
    title: "Type-aware formatting",
    body: "Strings, numbers (currency / decimals), and dates (with time + fixed time zone) are formatted automatically.",
  },
  {
    icon: CircleUser,
    title: "Rich cells",
    body: "Avatar columns build initials + a secondary line; badge columns map values to colored pills with a highlighted note.",
  },
  {
    icon: Code2,
    title: "Inject custom components",
    body: "custom / actions columns take a render(row) function — drop in star ratings, menus, links, anything per row.",
  },
  {
    icon: ArrowUpDown,
    title: "Sorting",
    body: "Click any sortable header to cycle ascending → descending → off, using a comparator matched to the column type.",
  },
  {
    icon: ListChecks,
    title: "Pagination",
    body: "Built-in client paging with a live range readout and page controls — set pageSize per table.",
  },
  {
    icon: Server,
    title: "API-ready",
    body: "Swap in ApiDynamicTable + an endpoint to load rows from your backend, handling both array and paged responses.",
  },
]

export default function DynamicTablePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Dynamic Table — everything it can do</h1>
        <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
          One table, driven entirely by a JSON column schema. The example below uses every supported
          column type at once, with live sorting and pagination.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((cap) => (
          <li key={cap.title} className="flex flex-col gap-2 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <cap.icon className="size-4" aria-hidden="true" />
              </span>
              <h2 className="font-medium">{cap.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">{cap.body}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-medium">All column types in one table</h2>
          <p className="text-sm text-muted-foreground">avatar · string · badge · number · custom · date · actions</p>
        </div>
        <ShowcaseTable />
      </div>
    </div>
  )
}
