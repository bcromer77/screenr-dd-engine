"use client"

import { useMemo } from "react"
import Link from "next/link"
import { MOCK_VARIABLES, MOCK_CANDIDATES, computeStatus } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusPill } from "@/components/status-pill"

export default function VariablesPage() {
  const variablesWithStatus = useMemo(() => {
    return MOCK_VARIABLES.map((variable) => {
      const candidates = MOCK_CANDIDATES.filter(
        (c) => c.variableId === variable.id
      )
      const status = computeStatus(candidates)
      const primaryCandidate = candidates[0]

      return {
        ...variable,
        status,
        candidates,
        primaryValue: primaryCandidate?.value,
        primaryUnit: primaryCandidate?.unit,
        primarySource: primaryCandidate?.source,
        primaryLocation: primaryCandidate?.location,
        primarySnippet: primaryCandidate?.snippet,
      }
    })
  }, [])

  const formatValue = (value: number | string | undefined, unit: string | null | undefined) => {
    if (value === undefined) return "-"
    if (typeof value === "number") {
      const millions = value / 1_000_000
      if (millions >= 1) {
        return `${millions.toFixed(1)}m${unit ? ` ${unit}` : ""}`
      }
      return `${value}${unit ? ` ${unit}` : ""}`
    }
    return `${value}${unit ? ` ${unit}` : ""}`
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-2 text-4xl font-light tracking-tight text-zinc-900">
        15 Variables
      </h1>
      <p className="mb-8 text-zinc-600">
        All extracted variables with their status and primary source.
      </p>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead className="font-semibold text-zinc-900">
                Variable
              </TableHead>
              <TableHead className="font-semibold text-zinc-900">
                Status
              </TableHead>
              <TableHead className="font-semibold text-zinc-900">
                Value
              </TableHead>
              <TableHead className="font-semibold text-zinc-900">
                Source
              </TableHead>
              <TableHead className="font-semibold text-zinc-900">
                Location
              </TableHead>
              <TableHead className="font-semibold text-zinc-900">
                Snippet
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variablesWithStatus.map((variable) => (
              <TableRow key={variable.id} className="hover:bg-zinc-50">
                <TableCell className="font-medium text-zinc-900">
                  {variable.name}
                </TableCell>
                <TableCell>
                  <Link href={`/evidence-map?variable=${variable.id}`}>
                    <StatusPill status={variable.status} />
                  </Link>
                </TableCell>
                <TableCell className="font-mono">
                  {variable.candidates.length > 1
                    ? `${variable.candidates.length} candidates`
                    : formatValue(variable.primaryValue, variable.primaryUnit)}
                </TableCell>
                <TableCell className="text-zinc-600">
                  {variable.primarySource || "-"}
                </TableCell>
                <TableCell className="font-mono text-sm text-zinc-600">
                  {variable.primaryLocation || "-"}
                </TableCell>
                <TableCell className="max-w-xs truncate text-zinc-500">
                  {variable.primarySnippet || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
