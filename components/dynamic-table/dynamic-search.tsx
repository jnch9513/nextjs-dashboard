"use client"

import { useState } from "react"
import { RotateCcw, Search } from "lucide-react"

import type {
  DynamicSearchField,
  DynamicSearchValue,
  DynamicSearchValues,
} from "@/lib/dynamic-table/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function initialValues(fields: DynamicSearchField[]): DynamicSearchValues {
  const values: DynamicSearchValues = {}
  for (const field of fields) {
    if (field.type === "dateRange") {
      values[`${field.key}From`] = ""
      values[`${field.key}To`] = ""
    } else {
      values[field.key] = field.type === "boolean" ? false : ""
    }
  }
  return values
}

export function DynamicSearch({
  fields,
  onSearch,
}: {
  fields: DynamicSearchField[]
  onSearch: (values: DynamicSearchValues) => void
}) {
  const [values, setValues] = useState<DynamicSearchValues>(() => initialValues(fields))

  function setValue(key: string, value: DynamicSearchValue) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function reset() {
    const empty = initialValues(fields)
    setValues(empty)
    onSearch(empty)
  }

  return (
    <form
      className="rounded-lg border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch(values)
      }}
    >
      <FieldGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((field) => {
          if (field.type === "dateRange") {
            return (
              <Field key={field.key} className="sm:col-span-2">
                <FieldLabel>{field.label}</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    aria-label={`${field.label} from`}
                    value={String(values[`${field.key}From`] ?? "")}
                    onChange={(event) => setValue(`${field.key}From`, event.target.value)}
                  />
                  <Input
                    type="date"
                    aria-label={`${field.label} to`}
                    value={String(values[`${field.key}To`] ?? "")}
                    onChange={(event) => setValue(`${field.key}To`, event.target.value)}
                  />
                </div>
              </Field>
            )
          }

          if (field.type === "select") {
            return (
              <Field key={field.key}>
                <FieldLabel>{field.label}</FieldLabel>
                <Select
                  value={String(values[field.key] ?? "")}
                  onValueChange={(value) => setValue(field.key, value ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.placeholder ?? `Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )
          }

          if (field.type === "boolean") {
            return (
              <Field key={field.key} orientation="horizontal" className="self-end pb-2">
                <Checkbox
                  id={`search-${field.key}`}
                  checked={Boolean(values[field.key])}
                  onCheckedChange={(checked) => setValue(field.key, checked === true)}
                />
                <FieldLabel htmlFor={`search-${field.key}`}>{field.label}</FieldLabel>
              </Field>
            )
          }

          return (
            <Field key={field.key}>
              <FieldLabel htmlFor={`search-${field.key}`}>{field.label}</FieldLabel>
              <Input
                id={`search-${field.key}`}
                type={field.type}
                placeholder={field.placeholder}
                value={String(values[field.key] ?? "")}
                onChange={(event) =>
                  setValue(
                    field.key,
                    field.type === "number" && event.target.value !== ""
                      ? Number(event.target.value)
                      : event.target.value,
                  )
                }
              />
            </Field>
          )
        })}
      </FieldGroup>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={reset}>
          <RotateCcw data-icon="inline-start" />
          Reset
        </Button>
        <Button type="submit">
          <Search data-icon="inline-start" />
          Search
        </Button>
      </div>
    </form>
  )
}
