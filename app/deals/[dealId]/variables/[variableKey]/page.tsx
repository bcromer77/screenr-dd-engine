"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useScreenR } from "@/lib/screenr/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Plus,
} from "lucide-react"
import type { AnalystSourceType, VariableKey, VariableStatus } from "@/lib/screenr/types"
import { ANALYST_SOURCE_LABELS, getOriginBadge } from "@/lib/screenr/types"

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

export default function VariableResolutionPage() {
  const params = useParams()
  const router = useRouter()
  const dealId = params.dealId as string
  const variableKey = params.variableKey as VariableKey

  const { getVariable, resolveBySelection, resolveByEntry } = useScreenR()
  const variable = getVariable(dealId, variableKey)

  const [isAddingValue, setIsAddingValue] = useState(false)
  const [newValue, setNewValue] = useState("")
  const [sourceType, setSourceType] = useState<AnalystSourceType>("MANAGEMENT_CALL")
  const [comment, setComment] = useState("")

  if (!variable) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">Variable not found</h1>
          <Link href={`/deals/${dealId}/variables`} className="mt-4 block text-sm text-accent">
            Back to Variables
          </Link>
        </div>
      </div>
    )
  }

  const handleSelect = (index: number) => {
    resolveBySelection(dealId, variableKey, index, "Bazil Cromer")
  }

  const handleAddValue = () => {
    if (!newValue.trim() || !comment.trim()) return
    resolveByEntry(dealId, variableKey, newValue, sourceType, comment, "Bazil Cromer")
    setIsAddingValue(false)
    setNewValue("")
    setComment("")
  }

  const isConflict = variable.status === "FOUND_CONFLICT"
  const isMissing = variable.status === "NOT_FOUND"
  const isResolved = variable.status === "RESOLVED"
  const origin = getOriginBadge(variable)

  return (
    <div className="p-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/deals/${dealId}/variables`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Variables
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">{variable.label}</h1>
          {getStatusBadge(variable.status)}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isConflict && "Multiple values found across documents. Select the correct value."}
          {isMissing && "No data found in uploaded documents. Add a value manually if available."}
          {isResolved && "This variable has been resolved."}
          {variable.status === "FOUND_SINGLE" && "Single value found. No action required."}
        </p>
      </div>

      {/* Conflict resolution */}
      {isConflict && !isResolved && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium text-foreground">Extracted Values</h2>
          <div className="space-y-3">
            {variable.rawValues.map((raw, index) => (
              <Card key={index} className="border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-foreground">{raw.value}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{raw.source.fileName}</span>
                      {raw.source.pageNumber && (
                        <>
                          <span className="text-muted-foreground/50">·</span>
                          <span>Page {raw.source.pageNumber}</span>
                        </>
                      )}
                    </div>
                    {raw.source.snippet && (
                      <div className="mt-2 rounded bg-muted p-3 text-sm text-muted-foreground italic">
                        "{raw.source.snippet}"
                      </div>
                    )}
                  </div>
                  <Button onClick={() => handleSelect(index)} variant="outline">
                    Select as Resolved
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Missing value entry */}
      {isMissing && !isResolved && (
        <div className="mb-8">
          <Card className="border-border bg-card p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <HelpCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">No data found in documents</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You can add a value manually from another source.
              </p>
              <Dialog open={isAddingValue} onOpenChange={setIsAddingValue}>
                <DialogTrigger asChild>
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Analyst Value
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Value for {variable.label}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="value">Value</Label>
                      <Input
                        id="value"
                        placeholder="Enter the value"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sourceType">Source Type</Label>
                      <Select
                        value={sourceType}
                        onValueChange={(v) => setSourceType(v as AnalystSourceType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ANALYST_SOURCE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comment">Comment (required)</Label>
                      <Textarea
                        id="comment"
                        placeholder="Explain the source and any relevant context..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsAddingValue(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddValue}
                        disabled={!newValue.trim() || !comment.trim()}
                      >
                        Save Value
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </div>
      )}

      {/* Resolved state */}
      {isResolved && variable.resolved && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium text-foreground">Resolved Value</h2>
          <Card className="border-status-green/30 bg-status-green/5 p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold text-foreground">
                    {variable.resolved.value}
                  </div>
                  <Badge variant="outline">{origin}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Resolved by {variable.resolved.resolvedBy} on{" "}
                  {new Date(variable.resolved.resolvedAt).toLocaleString()}
                </div>
                {variable.resolved.analystSourceType && (
                  <div className="text-sm text-muted-foreground">
                    Source: {ANALYST_SOURCE_LABELS[variable.resolved.analystSourceType]}
                  </div>
                )}
                {variable.resolved.comment && (
                  <div className="mt-2 rounded bg-muted p-3 text-sm text-muted-foreground">
                    {variable.resolved.comment}
                  </div>
                )}
              </div>
              <CheckCircle2 className="h-6 w-6 text-status-green" />
            </div>
          </Card>
        </div>
      )}

      {/* Lineage section - always visible */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-foreground">Data Lineage</h2>
        <Card className="border-border bg-card p-5">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Raw Extracted Values ({variable.rawValues.length})
              </div>
              {variable.rawValues.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {variable.rawValues.map((raw, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded bg-muted p-3"
                    >
                      <div>
                        <span className="font-medium text-foreground">{raw.value}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          from {raw.source.fileName}
                          {raw.source.pageNumber && ` (p. ${raw.source.pageNumber})`}
                        </span>
                      </div>
                      {variable.resolved?.selectedFromIndex === index && (
                        <Badge variant="outline" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm text-muted-foreground">
                  No values extracted from documents.
                </div>
              )}
            </div>

            {variable.resolved && (
              <div className="border-t border-border pt-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Resolution
                </div>
                <div className="mt-3 rounded bg-status-green/10 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-status-green" />
                    <span className="font-medium text-foreground">
                      {variable.resolved.value}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {origin}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
