"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useScreenR } from "@/lib/screenr/store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, AlertTriangle, HelpCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VariableStatus } from "@/lib/screenr/types"
import { getOriginBadge } from "@/lib/screenr/types"

function getStatusBadge(status: VariableStatus) {
  switch (status) {
    case "FOUND_SINGLE":
      return (
        <Badge className="bg-status-green/20 text-status-green border-0">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Found
        </Badge>
      )
    case "FOUND_CONFLICT":
      return (
        <Badge className="bg-status-orange/20 text-status-orange border-0">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Conflict
        </Badge>
      )
    case "NOT_FOUND":
      return (
        <Badge className="bg-status-red/20 text-status-red border-0">
          <HelpCircle className="mr-1 h-3 w-3" />
          Missing
        </Badge>
      )
    case "RESOLVED":
      return (
        <Badge className="bg-primary/20 text-primary border-0">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Resolved
        </Badge>
      )
    default:
      return null
  }
}

function needsAction(status: VariableStatus): boolean {
  return status === "FOUND_CONFLICT" || status === "NOT_FOUND"
}

export default function VariablesPage() {
  const params = useParams()
  const dealId = params.dealId as string
  const { getVariables } = useScreenR()
  const variables = getVariables(dealId)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step 3</span>
          <span>/</span>
          <span>Variable Overview</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Variables</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and resolve extracted variables. Click a row to view details and resolve conflicts.
        </p>
      </div>

      {/* Variables table */}
      <Card className="border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Variable</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Value</TableHead>
              <TableHead className="text-muted-foreground">Origin</TableHead>
              <TableHead className="text-muted-foreground text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variables.map((variable) => {
              const actionRequired = needsAction(variable.status)
              const origin = getOriginBadge(variable)
              const displayValue =
                variable.resolved?.value ||
                (variable.status === "FOUND_SINGLE" ? variable.rawValues[0]?.value : null)

              return (
                <TableRow
                  key={variable.variableKey}
                  className={cn(
                    "border-border cursor-pointer transition-colors",
                    actionRequired && "bg-status-orange/5"
                  )}
                >
                  <TableCell>
                    <Link
                      href={`/deals/${dealId}/variables/${variable.variableKey}`}
                      className="block"
                    >
                      <span className="font-medium text-foreground">{variable.label}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/deals/${dealId}/variables/${variable.variableKey}`}
                      className="block"
                    >
                      {getStatusBadge(variable.status)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/deals/${dealId}/variables/${variable.variableKey}`}
                      className="block"
                    >
                      {displayValue ? (
                        <span className="text-foreground">{displayValue}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/deals/${dealId}/variables/${variable.variableKey}`}
                      className="block"
                    >
                      {origin ? (
                        <Badge variant="outline" className="text-xs">
                          {origin}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/deals/${dealId}/variables/${variable.variableKey}`}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {actionRequired ? (
                        <span className="text-status-orange">Resolve</span>
                      ) : (
                        <span>View</span>
                      )}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
