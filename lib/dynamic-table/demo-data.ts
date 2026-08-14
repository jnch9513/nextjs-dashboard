import type { ColumnDef, RowData } from "@/lib/dynamic-table/types"

// Column schema defined as JSON — name (label) + type per column.
export const demoColumns: ColumnDef[] = [
  { key: "name", label: "Product", type: "string" },
  { key: "sku", label: "SKU", type: "string" },
  {
    key: "price",
    label: "Price",
    type: "number",
    format: { currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 },
  },
  { key: "stock", label: "In stock", type: "number" },
  { key: "rating", label: "Rating", type: "number", format: { maximumFractionDigits: 1 } },
  { key: "updatedAt", label: "Last updated", type: "date", format: { dateStyle: "medium", withTime: true } },
  { key: "createdAt", label: "Created", type: "date", format: { dateStyle: "medium" } },
]

// Demo rows — plain records keyed by the column keys above.
export const demoRows: RowData[] = [
  { name: "Aeron Chair", sku: "AER-001", price: 1395, stock: 24, rating: 4.8, updatedAt: "2026-07-14T09:24:00Z", createdAt: "2024-01-12T00:00:00Z" },
  { name: "Standing Desk Pro", sku: "DSK-220", price: 749.99, stock: 8, rating: 4.5, updatedAt: "2026-08-01T15:02:00Z", createdAt: "2023-11-03T00:00:00Z" },
  { name: "Monitor Arm", sku: "ARM-045", price: 129.5, stock: 132, rating: 4.2, updatedAt: "2026-06-28T11:47:00Z", createdAt: "2024-05-19T00:00:00Z" },
  { name: "Mechanical Keyboard", sku: "KBD-078", price: 189, stock: 56, rating: 4.7, updatedAt: "2026-08-10T18:30:00Z", createdAt: "2025-02-08T00:00:00Z" },
  { name: "Wireless Mouse", sku: "MSE-012", price: 79.99, stock: 210, rating: 4.1, updatedAt: "2026-07-30T08:12:00Z", createdAt: "2025-06-21T00:00:00Z" },
  { name: "USB-C Hub", sku: "HUB-330", price: 59, stock: 0, rating: 3.9, updatedAt: "2026-05-22T13:05:00Z", createdAt: "2024-09-14T00:00:00Z" },
  { name: "Webcam 4K", sku: "CAM-900", price: 219, stock: 41, rating: 4.4, updatedAt: "2026-08-05T10:41:00Z", createdAt: "2025-01-30T00:00:00Z" },
  { name: "Desk Lamp", sku: "LMP-140", price: 45.25, stock: 88, rating: 4.0, updatedAt: "2026-04-18T07:55:00Z", createdAt: "2023-08-02T00:00:00Z" },
  { name: "Laptop Stand", sku: "STD-060", price: 39.99, stock: 174, rating: 4.3, updatedAt: "2026-07-01T16:20:00Z", createdAt: "2024-12-11T00:00:00Z" },
  { name: "Noise-Cancelling Headset", sku: "HDS-505", price: 299, stock: 33, rating: 4.9, updatedAt: "2026-08-12T09:00:00Z", createdAt: "2025-03-17T00:00:00Z" },
  { name: "Cable Organizer", sku: "ORG-011", price: 19.99, stock: 320, rating: 3.8, updatedAt: "2026-03-09T12:34:00Z", createdAt: "2023-06-28T00:00:00Z" },
  { name: "Ergonomic Footrest", sku: "FTR-070", price: 64.5, stock: 15, rating: 4.2, updatedAt: "2026-06-14T14:48:00Z", createdAt: "2024-04-05T00:00:00Z" },
  { name: "Portable SSD 2TB", sku: "SSD-2TB", price: 179, stock: 62, rating: 4.6, updatedAt: "2026-08-08T19:10:00Z", createdAt: "2025-05-09T00:00:00Z" },
  { name: "Docking Station", sku: "DCK-450", price: 249.99, stock: 27, rating: 4.3, updatedAt: "2026-07-25T11:22:00Z", createdAt: "2024-10-30T00:00:00Z" },
  { name: "Bluetooth Speaker", sku: "SPK-088", price: 99, stock: 105, rating: 4.5, updatedAt: "2026-08-02T08:47:00Z", createdAt: "2025-07-01T00:00:00Z" },
]
