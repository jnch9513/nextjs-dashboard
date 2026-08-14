import type { ColumnDef } from "@/lib/dynamic-table/types"
import { SpringDynamicTable } from "@/components/dynamic-table/spring-dynamic-table"
import { CodeBlock } from "@/components/dynamic-table/code-block"
import { Badge } from "@/components/ui/badge"

// The only two things you define per table: the columns (Type) + the endpoint.
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
]

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

const step2 = `// 2. Point it at your Spring Boot endpoint. That's it.
import { SpringDynamicTable } from "@/components/dynamic-table/spring-dynamic-table"

export default function ProductsPage() {
  return (
    <SpringDynamicTable
      columns={productColumns}
      endpoint="https://your-api.com/api/products"
      pageSize={8}
    />
  )
}`

const springShapes = `// Both Spring response shapes work automatically:

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

const typeRef = `export type ColumnType = "string" | "number" | "date"

interface ColumnDef {
  key: string          // property on each row object
  label: string        // header text
  type: ColumnType     // drives formatting + sort comparison
  sortable?: boolean   // default true
  align?: "left" | "right" | "center"
  format?: {
    currency?: string              // number → "USD", "HKD" ...
    minimumFractionDigits?: number // number
    maximumFractionDigits?: number // number
    dateStyle?: "short" | "medium" | "long" // date
    withTime?: boolean             // date → also show time
  }
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

export default function TableReferencePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit">
          Reference
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Dynamic Table + Spring API
        </h1>
        <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
          A reusable pattern for future tables. Define the column Type once, point it at a Spring
          Boot endpoint, and the table fetches, formats, sorts, and paginates on its own.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <SectionHeading step="1" title="Define your Type" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Each column declares a <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">key</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">label</code>, and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">type</code>. The type decides how
          cells are formatted and compared when sorting.
        </p>
        <CodeBlock code={step1} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading step="2" title="Connect the Spring endpoint" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pass the endpoint to <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">SpringDynamicTable</code>.
          It uses SWR under the hood and shows loading and error states for you.
        </p>
        <CodeBlock code={step2} />
        <p className="text-sm text-muted-foreground leading-relaxed">
          The fetcher understands both shapes a Spring controller returns, so no mapping is needed:
        </p>
        <CodeBlock code={springShapes} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading step="3" title="Live example" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          This table is fetching from a mock endpoint at{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/api/products</code> that returns a
          Spring <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">Page&lt;T&gt;</code> response.
        </p>
        <SpringDynamicTable
          columns={productColumns}
          endpoint="/api/products"
          pageSize={6}
          caption="Live example fetching from a Spring-style endpoint"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">ColumnDef type reference</h2>
        <CodeBlock code={typeRef} />
      </section>
    </div>
  )
}
