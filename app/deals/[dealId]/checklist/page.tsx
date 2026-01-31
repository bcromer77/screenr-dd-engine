"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useScreenR, useExtractionSummary } from "@/lib/screenr/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  FileText,
  MessageSquare,
} from "lucide-react"
import { getOriginBadge, ANALYST_SOURCE_LABELS } from "@/lib/screenr/types"
import type { VariableRecord } from "@/lib/screenr/types"
import { cn } from "@/lib/utils"

function VariableRow({ variable, dealId }: { variable: VariableRecord; dealId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const isResolved = variable.status === "RESOLVED" || variable.status === "FOUND_SINGLE"
  const origin = getOriginBadge(variable)

  const displayValue =
    variable.resolved?.value ||
    (variable.status === "FOUND_SINGLE" ? variable.rawValues[0]?.value : null)

  const source =
    variable.resolved?.resolutionType === "ANALYST_ENTERED"
      ? {
          type: "analyst",
          sourceType: variable.resolved.analystSourceType,
          comment: variable.resolved.comment,
        }
      : variable.rawValues[variable.resolved?.selectedFromIndex ?? 0]?.source || null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="border-border">
        <TableCell>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-left">
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
              <span className="font-medium text-foreground">{variable.label}</span>
            </button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell>
          {isResolved ? (
            <span className="text-foreground">{displayValue}</span>
          ) : (
            <Link
              href={`/deals/${dealId}/variables/${variable.variableKey}`}
              className="text-status-orange hover:underline"
            >
              Unresolved
            </Link>
          )}
        </TableCell>
        <TableCell>
          {origin ? (
            <Badge variant="outline" className="text-xs">
              {origin}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <TableRow className="border-border bg-muted/30">
          <TableCell colSpan={3} className="p-0">
            <div className="p-4">
              {source && (
                <div className="space-y-2 text-sm">
                  {"type" in source && source.type === "analyst" ? (
                    <>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>
                          Source: {source.sourceType && ANALYST_SOURCE_LABELS[source.sourceType]}
                        </span>
                      </div>
                      {source.comment && (
                        <div className="rounded bg-muted p-3 text-muted-foreground italic">
                          "{source.comment}"
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>
                          {(source as { fileName: string }).fileName}
                          {(source as { pageNumber?: number }).pageNumber &&
                            ` (p. ${(source as { pageNumber: number }).pageNumber})`}
                        </span>
                      </div>
                      {(source as { snippet?: string }).snippet && (
                        <div className="rounded bg-muted p-3 text-muted-foreground italic">
                          "{(source as { snippet: string }).snippet}"
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              {!source && !isResolved && (
                <div className="text-sm text-muted-foreground">
                  No data available. Please resolve this variable.
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function ChecklistPage() {
  const params = useParams()
  const dealId = params.dealId as string
  const { getVariables } = useScreenR()
  const variables = getVariables(dealId)
  const summary = useExtractionSummary(dealId)

  const hasUnresolved = summary.actionRequired > 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step 4</span>
          <span>/</span>
          <span>Checklist Preview</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">One-Page Checklist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review all variables before export. Click a row to expand details.
        </p>
      </div>

      {/* Warning banner */}
      {hasUnresolved && (
        <Card className="mb-6 border-status-orange/30 bg-status-orange/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-status-orange" />
            <div>
              <div className="font-medium text-foreground">Unresolved Variables</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.actionRequired} variables still need resolution before export.
                {summary.conflicts > 0 && ` ${summary.conflicts} conflicts.`}
                {summary.missing > 0 && ` ${summary.missing} missing.`}
              </p>
              <Link href={`/deals/${dealId}/variables`}>
                <Button variant="outline" size="sm" className="mt-3 gap-2 bg-transparent">
                  Go to Variables
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Checklist table */}
      <Card className="border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Variable</TableHead>
              <TableHead className="text-muted-foreground">Value</TableHead>
              <TableHead className="text-muted-foreground">Origin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variables.map((variable) => (
              <VariableRow key={variable.variableKey} variable={variable} dealId={dealId} />
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Export CTA */}
      <div className="mt-6 flex justify-end">
        <Link href={`/deals/${dealId}/export`}>
          <Button className="gap-2">
            Proceed to Export
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
