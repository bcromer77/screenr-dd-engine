"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  MOCK_VARIABLES,
  MOCK_CANDIDATES,
  MOCK_ASSESSMENTS,
  MOCK_COMMITTEE_DECISIONS,
  computeStatus,
} from "@/lib/mock-data"
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
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function VariablesPage() {
  const variablesWithStatus = useMemo(() => {
    return MOCK_VARIABLES.map((variable) => {
      const candidates = MOCK_CANDIDATES.filter(
        (c) => c.variableId === variable.id
      )
      const status = computeStatus(candidates)
      const primaryCandidate = candidates[0]
      const assessment = MOCK_ASSESSMENTS.find(
        (a) => a.variableId === variable.id
      )
      const committeeDecision = MOCK_COMMITTEE_DECISIONS.find(
        (d) => d.variableId === variable.id
      )

      const finalValue = assessment
        ? assessment.selectedValue
        : candidates.length === 1
          ? primaryCandidate?.value
          : undefined
      const finalSource = assessment
        ? assessment.selectedSource
        : candidates.length === 1
          ? primaryCandidate?.source
          : undefined

      return {
        ...variable,
        status,
        candidates,
        primaryValue: primaryCandidate?.value,
        primaryUnit: primaryCandidate?.unit,
        primarySource: primaryCandidate?.source,
        assessment,
        committeeDecision,
        finalValue,
        finalSource,
      }
    })
  }, [])

  const formatValue = (
    value: number | string | undefined,
    unit: string | null | undefined
  ) => {
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
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
        15 Variables
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Final values, analyst rationale, and committee decisions.
      </p>

      <Card className="overflow-hidden border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-semibold text-foreground">
                Variable
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Status
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Final Value
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Source
              </TableHead>
              <TableHead className="w-10 text-center font-semibold text-foreground">
                <span className="sr-only">Rationale</span>
                <Eye className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Decision
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variablesWithStatus.map((variable) => (
              <TableRow
                key={variable.id}
                className="border-border transition-colors hover:bg-secondary/10"
              >
                <TableCell className="font-medium text-foreground">
                  {variable.name}
                </TableCell>
                <TableCell>
                  <Link href={`/evidence-map?variable=${variable.id}`}>
                    <StatusPill status={variable.status} />
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-foreground">
                  {variable.finalValue !== undefined
                    ? formatValue(variable.finalValue, variable.primaryUnit)
                    : variable.candidates.length > 1
                      ? `${variable.candidates.length} candidates`
                      : formatValue(
                          variable.primaryValue,
                          variable.primaryUnit
                        )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {variable.finalSource || variable.primarySource || "-"}
                </TableCell>

                {/* Rationale popover */}
                <TableCell className="w-10 text-center">
                  {variable.assessment ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/20 hover:text-accent"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="left"
                        align="center"
                        className="w-80 border-border bg-card p-0"
                      >
                        <div className="border-b border-border px-4 py-3">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Analyst Rationale
                          </div>
                          <div className="mt-1 text-sm font-medium text-foreground">
                            {variable.name}
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-sm leading-relaxed text-foreground">
                            {variable.assessment.analystCommentary}
                          </p>
                        </div>
                        <div className="border-t border-border bg-secondary/30 px-4 py-2.5">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              Selected{" "}
                              <span className="font-mono font-semibold text-foreground">
                                {formatValue(
                                  variable.assessment.selectedValue,
                                  variable.primaryUnit
                                )}
                              </span>{" "}
                              from {variable.assessment.selectedSource}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground/70">
                            {variable.assessment.assessedBy} &middot;{" "}
                            {new Date(
                              variable.assessment.assessedAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span className="text-muted-foreground/30">-</span>
                  )}
                </TableCell>

                {/* Committee decision */}
                <TableCell>
                  {variable.committeeDecision ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          variable.committeeDecision.decision === "Go"
                            ? "bg-status-green/15 text-status-green"
                            : "bg-status-red/15 text-status-red"
                        )}
                      >
                        {variable.committeeDecision.decision}
                      </span>
                      {variable.committeeDecision.reason && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
                            >
                              why?
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="left"
                            className="w-60 border-border bg-card text-sm"
                          >
                            {variable.committeeDecision.reason}
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">
                      Pending
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
