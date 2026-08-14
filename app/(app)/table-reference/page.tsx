import type { ReactNode } from "react"

import { CodeBlock } from "@/components/dynamic-table/code-block"
import { ReferenceLiveExample } from "@/components/dynamic-table/reference-live-example"
import { Badge } from "@/components/ui/badge"

const step1 = `// 1. Define your columns — this is your Type.
import type { ColumnDef } from "@/lib/dynamic-table/types"

const productColumns: ColumnDef[] = [
  { key: "name", label: "Product", type: "string" },
  { key: "sku", label: "SKU", type: "string" },
  {
    key: "price",
    label: "Price",
    type: "number",
    format: { currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 },
  },
  { key: "stock", label: "In stock", type: "number" },
  { key: "updatedAt", label: "Last updated", type: "date", format: { dateStyle: "medium" } },
]`

const step2 = `// 2. Point it at your backend endpoint. That's it.
import { ApiDynamicTable } from "@/components/dynamic-table/api-dynamic-table"

export default function ProductsPage() {
  return (
    <ApiDynamicTable
      columns={productColumns}
      endpoint="https://your-api.com/api/products"
      pageSize={8}
    />
  )
}`

const responseShapes = `// Both backend response shapes work automatically:

// A) Plain array
[
  { "name": "Aeron Chair", "sku": "AER-001", "price": 1395, ... }
]

// B) Pageable Page<T> envelope
{
  "content": [ { "name": "Aeron Chair", ... } ],
  "totalElements": 42,
  "totalPages": 6,
  "number": 0,
  "size": 8
}`

const richColumns = `// Rich column types — all driven by the column config.

const columns: ColumnDef[] = [
  // Avatar: a name circle + primary line + muted secondary line.
  {
    key: "ownerName",
    label: "Owner",
    type: "avatar",
    avatar: { secondaryKey: "ownerUsername", secondaryPrefix: "@" },
  },

  // Badge: map each raw value to a label + color,
  // with an optional highlighted note underneath.
  {
    key: "status",
    label: "Status",
    type: "badge",
    badge: {
      noteKey: "statusNote",
      noteTone: "warning",
      options: {
        active: { label: "Active", tone: "success" },
        low:    { label: "Low stock", tone: "warning" },
        out:    { label: "Out of stock", tone: "danger" },
      },
    },
  },

  // Actions: inject ANY component you want. It receives the row.
  {
    key: "actions",
    label: "",
    type: "actions",
    render: (row) => <RowActions row={row} />,
  },
]`

const typeRef = `export type ColumnType =
  | "string" | "number" | "date"   // scalar, auto-formatted
  | "avatar"                        // name circle + primary/secondary lines
  | "badge"                         // colored status pill + optional note
  | "actions" | "custom"           // inject your own component via render()

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "muted"

interface ColumnDef {
  key: string
  label: string
  type: ColumnType
  sortable?: boolean               // default true (false for actions/custom)
  align?: "left" | "right" | "center"
  headerClassName?: string         // e.g. "w-[60px]"

  format?: {                       // number / date
    currency?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    dateStyle?: "short" | "medium" | "long"
    withTime?: boolean
  }

  avatar?: {                       // type: "avatar"
    nameKey?: string               // defaults to key
    secondaryKey?: string
    secondaryPrefix?: string       // e.g. "@"
  }

  badge?: {                        // type: "badge"
    options?: Record<string, { label: string; tone: Tone }>
    noteKey?: string               // small highlighted line under the badge
    noteTone?: Tone
  }

  render?: (row) => ReactNode      // type: "actions" | "custom"
}`

function SectionHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary tabular-nums">
        {step}
      </span>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  )
}

function InlineCode({ children }: { children: ReactNode }) {
  return <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>
}

export default function TableReferencePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit">
          Reference
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Dynamic Table</h1>
        <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
          A reusable pattern for future tables. Define the column Type once, point it at a backend
          endpoint, and the table fetches, formats, sorts, and paginates on its own — including
          avatars, colored status badges, and custom row actions you inject.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <SectionHeading step="1" title="Define your Type" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Each column declares a <InlineCode>key</InlineCode>, <InlineCode>label</InlineCode>, and{" "}
          <InlineCode>type</InlineCode>. The type decides how cells are formatted and compared when sorting.
        </p>
        <CodeBlock code={step1} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading step="2" title="Connect the endpoint" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pass the endpoint to <InlineCode>ApiDynamicTable</InlineCode>. It uses SWR under the hood and
          shows loading and error states for you.
        </p>
        <CodeBlock code={step2} />
        <p className="text-sm text-muted-foreground leading-relaxed">
          The fetcher understands both shapes your backend controller returns, so no mapping is needed:
        </p>
        <CodeBlock code={responseShapes} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading step="3" title="Rich columns: avatar, badge, actions" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Beyond scalars, columns can render a name <strong className="font-medium text-foreground">avatar</strong>{" "}
          with a secondary line, a colored status <strong className="font-medium text-foreground">badge</strong> with
          a highlighted note, or an <strong className="font-medium text-foreground">actions</strong> column where you
          inject your own component via <InlineCode>render(row)</InlineCode>.
        </p>
        <CodeBlock code={richColumns} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading step="4" title="Live example" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Fetching from a mock <InlineCode>/api/products</InlineCode> endpoint that returns a{" "}
          <InlineCode>Page&lt;T&gt;</InlineCode> response. It shows the avatar, colored status badge with a
          note, and an injected actions menu — try sorting and paging.
        </p>
        <ReferenceLiveExample />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">ColumnDef type reference</h2>
        <CodeBlock code={typeRef} />
      </section>
    </div>
  )
}
