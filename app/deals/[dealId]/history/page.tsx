"use client"

import { useParams } from "next/navigation"
import { useScreenR } from "@/lib/screenr/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileSearch,
  CheckCircle,
  Edit3,
  Download,
  FileText,
  User,
} from "lucide-react"
import type { AuditAction } from "@/lib/screenr/types"
import { VARIABLE_LABELS } from "@/lib/screenr/types"

function getActionIcon(action: AuditAction) {
  switch (action) {
    case "UPLOAD_DOCUMENT":
      return Upload
    case "EXTRACTION_COMPLETED":
      return FileSearch
    case "RESOLVE_SELECTED":
      return CheckCircle
    case "RESOLVE_ENTERED":
      return Edit3
    case "EXPORT_PDF":
      return Download
    default:
      return FileText
  }
}

function getActionLabel(action: AuditAction) {
  switch (action) {
    case "UPLOAD_DOCUMENT":
      return "Document Uploaded"
    case "EXTRACTION_COMPLETED":
      return "Extraction Completed"
    case "RESOLVE_SELECTED":
      return "Value Selected"
    case "RESOLVE_ENTERED":
      return "Value Entered"
    case "EXPORT_PDF":
      return "PDF Exported"
    default:
      return action
  }
}

function getActionDescription(entry: { action: AuditAction; meta: Record<string, unknown>; variableKey?: string }) {
  switch (entry.action) {
    case "UPLOAD_DOCUMENT":
      return `Uploaded ${entry.meta.fileName}`
    case "EXTRACTION_COMPLETED":
      return `Processed ${entry.meta.documentsProcessed} documents, extracted ${entry.meta.variablesExtracted} variables`
    case "RESOLVE_SELECTED":
      return `Selected "${entry.meta.selectedValue}" from ${entry.meta.sourceDocument} for ${entry.variableKey ? VARIABLE_LABELS[entry.variableKey as keyof typeof VARIABLE_LABELS] : "variable"}`
    case "RESOLVE_ENTERED":
      return `Entered "${entry.meta.enteredValue}" for ${entry.variableKey ? VARIABLE_LABELS[entry.variableKey as keyof typeof VARIABLE_LABELS] : "variable"} (${entry.meta.sourceType})`
    case "EXPORT_PDF":
      return `Generated ${entry.meta.fileName}`
    default:
      return ""
  }
}

export default function HistoryPage() {
  const params = useParams()
  const dealId = params.dealId as string
  const { getAuditLog, getExports } = useScreenR()
  const auditLog = getAuditLog(dealId)
  const exports = getExports(dealId)

  // Sort audit log by date (most recent first)
  const sortedAuditLog = [...auditLog].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step 6</span>
          <span>/</span>
          <span>History</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Deal History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete audit trail of all actions taken on this deal.
        </p>
      </div>

      {/* Past exports */}
      {exports.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium text-foreground">Past Exports</h2>
          <div className="space-y-2">
            {exports.map((exp) => (
              <Card key={exp.id} className="border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{exp.fileName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(exp.exportedAt).toLocaleString()} by {exp.exportedBy}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Audit log timeline */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-foreground">Audit Log</h2>
        {sortedAuditLog.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
              {sortedAuditLog.map((entry) => {
                const Icon = getActionIcon(entry.action)

                return (
                  <div key={entry.id} className="relative flex gap-4 pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Content */}
                    <Card className="flex-1 border-border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {getActionLabel(entry.action)}
                            </span>
                            {entry.variableKey && (
                              <Badge variant="outline" className="text-xs">
                                {VARIABLE_LABELS[entry.variableKey as keyof typeof VARIABLE_LABELS]}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getActionDescription(entry)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {new Date(entry.at).toLocaleString()}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {entry.actor}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <Card className="border-border bg-card p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">No activity yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Actions will appear here as you work on this deal.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
