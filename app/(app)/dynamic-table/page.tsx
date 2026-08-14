import { DynamicTable } from "@/components/dynamic-table/dynamic-table"
import { demoColumns, demoRows } from "@/lib/dynamic-table/demo-data"

export default function DynamicTablePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dynamic Table</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Columns are defined as JSON (name + type). The table renders, formats, and sorts each
          column based on its declared type.
        </p>
      </div>

      <DynamicTable
        columns={demoColumns}
        data={demoRows}
        pageSize={8}
        caption="Demo product inventory rendered from a JSON column schema"
      />
    </div>
  )
}
