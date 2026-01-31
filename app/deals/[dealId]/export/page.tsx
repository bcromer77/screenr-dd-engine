"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useScreenR, useExtractionSummary } from "@/lib/screenr/store"
import { getDealById } from "@/lib/screenr/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Download,
  FileText,
  CheckCircle2,
  Loader2,
  Clock,
  FileCheck,
  ArrowRight,
} from "lucide-react"
import { getOriginBadge } from "@/lib/screenr/types"
import { cn } from "@/lib/utils"

export default function ExportPage() {
  const params = useParams()
  const dealId = params.dealId as string
  const deal = getDealById(dealId)
  const { getVariables, createExport, getExports } = useScreenR()
  const variables = getVariables(dealId)
  const exports = getExports(dealId)
  const summary = useExtractionSummary(dealId)

  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // Calculate exportable variables BEFORE handleExport
  const exportableVariables = variables.filter(
    (v) => v.status === "RESOLVED" || v.status === "FOUND_SINGLE"
  )

  const hasUnresolved = summary.actionRequired > 0
  const completionPercentage = Math.round((exportableVariables.length / variables.length) * 100)

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)
    setExportError(null)

    try {
      // Prepare variables for PDF
      const pdfVariables = exportableVariables.map((v) => {
        const displayValue =
          v.resolved?.value ||
          (v.status === "FOUND_SINGLE" ? v.rawValues[0]?.value : "—")
        const origin = getOriginBadge(v) || "Extracted"

        return {
          label: v.label,
          value: displayValue,
          origin,
        }
      })

      // Call the PDF API route
      const response = await fetch(`/api/deals/${dealId}/export.pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealName: deal?.name || `Deal ${dealId}`,
          targetCompany: deal?.targetCompany || "Target Company",
          variables: pdfVariables,
          analyst: "Bazil Cromer",
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.status}`)
      }

      // Get the PDF blob and trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ScreenR_${dealId}_${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Log the export in the store
      createExport(dealId, "Bazil Cromer")

      setExportSuccess(true)
      
      // Reset success message after delay
      setTimeout(() => setExportSuccess(false), 5000)
    } catch (error) {
      console.error("Export failed:", error)
      setExportError(error instanceof Error ? error.message : "Export failed")
      setTimeout(() => setExportError(null), 5000)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step 6</span>
          <span>/</span>
          <span>Export</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Generate One-Page PDF</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Export resolved variables as a committee-ready PDF document with full audit trail.
        </p>
      </div>

      {/* Completion Status */}
      <Card className="mb-6 border-border bg-card">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Export Readiness</div>
              <div className="text-xs text-muted-foreground">
                {exportableVariables.length} of {variables.length} variables ready
              </div>
            </div>
            <Badge 
              variant={completionPercentage === 100 ? "default" : "secondary"}
              className={cn(
                completionPercentage === 100 && "bg-status-green text-white"
              )}
            >
              {completionPercentage}% Complete
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full transition-all duration-500",
                completionPercentage === 100 ? "bg-status-green" : "bg-accent"
              )}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Stats grid */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-status-green">
                {summary.resolved}
              </div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">
                {summary.found}
              </div>
              <div className="text-xs text-muted-foreground">Auto-extracted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-status-orange">
                {summary.conflicts}
              </div>
              <div className="text-xs text-muted-foreground">Conflicts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-muted-foreground">
                {summary.missing}
              </div>
              <div className="text-xs text-muted-foreground">Missing</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Warning for unresolved */}
      {hasUnresolved && (
        <Card className="mb-6 border-status-orange/30 bg-status-orange/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-status-orange" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Incomplete Data</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.actionRequired} {summary.actionRequired === 1 ? 'variable is' : 'variables are'} unresolved and will be omitted from the export. 
                Resolve conflicts and missing values to include all data.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 whitespace-nowrap"
              onClick={() => window.location.href = `/deals/${dealId}/variables`}
            >
              Review Variables
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      )}

      {/* Success message */}
      {exportSuccess && (
        <Card className="mb-6 border-status-green/30 bg-status-green/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-status-green" />
            <div>
              <div className="font-medium text-foreground">Export Created Successfully</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Your PDF has been downloaded and logged in the audit trail.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Error message */}
      {exportError && (
        <Card className="mb-6 border-status-red/30 bg-status-red/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-status-red" />
            <div>
              <div className="font-medium text-foreground">Export Failed</div>
              <p className="mt-1 text-sm text-muted-foreground">{exportError}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Export preview */}
      <Card className="mb-6 border-border bg-card">
        <div className="border-b border-border bg-secondary/30 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">Export Preview</div>
              <div className="text-xs text-muted-foreground">
                One-page PDF with resolved values and origin badges
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <FileText className="h-3 w-3" />
              PDF Format
            </Badge>
          </div>
        </div>

        <div className="p-6">
          {/* Mock PDF preview */}
          <div className="rounded-lg border-2 border-border bg-white p-8 shadow-sm">
            {/* PDF Header */}
            <div className="mb-6 border-b-2 border-border pb-4">
              <div className="text-xl font-bold text-foreground">
                {deal?.name || "Deal"} - Screening Summary
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Target: {deal?.targetCompany || "Target Company"} | Generated by ScreenR
              </div>
            </div>

            {/* Variables table */}
            <div className="space-y-2.5">
              {exportableVariables.slice(0, 10).map((variable) => {
                const displayValue =
                  variable.resolved?.value ||
                  (variable.status === "FOUND_SINGLE" ? variable.rawValues[0]?.value : "—")
                const origin = getOriginBadge(variable)

                return (
                  <div
                    key={variable.variableKey}
                    className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0"
                  >
                    <div className="text-sm font-medium text-muted-foreground">
                      {variable.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {displayValue}
                      </span>
                      {origin && (
                        <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          {origin}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
              {exportableVariables.length > 10 && (
                <div className="pt-2 text-center text-xs text-muted-foreground">
                  + {exportableVariables.length - 10} more {exportableVariables.length - 10 === 1 ? 'variable' : 'variables'}
                </div>
              )}
            </div>

            {/* PDF Footer */}
            <div className="mt-8 border-t-2 border-border pt-4 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Generated by ScreenR | {new Date().toLocaleDateString()}</span>
                <span>Analyst: Bazil Cromer</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Export actions */}
      <div className="mb-8 flex items-center gap-4">
        <Button 
          onClick={handleExport} 
          disabled={isExporting || exportableVariables.length === 0}
          size="lg"
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Generate & Download PDF
            </>
          )}
        </Button>

        {exportableVariables.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No variables available to export. Please resolve at least one variable.
          </p>
        )}
      </div>

      {/* Past exports */}
      {exports.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Export History</h2>
            <Badge variant="secondary" className="ml-auto">
              {exports.length} {exports.length === 1 ? 'export' : 'exports'}
            </Badge>
          </div>
          <div className="space-y-2">
            {exports.map((exp, index) => (
              <Card 
                key={exp.id} 
                className={cn(
                  "border-border bg-card p-4 transition-all hover:border-accent/50",
                  index === 0 && "border-accent/30 bg-accent/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      index === 0 ? "bg-accent/20" : "bg-secondary"
                    )}>
                      <FileCheck className={cn(
                        "h-5 w-5",
                        index === 0 ? "text-accent" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {exp.fileName}
                        {index === 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(exp.exportedAt).toLocaleString()} by {exp.exportedBy}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    disabled
                    title="Re-export to download again"
                  >
                    <Download className="h-3 w-3" />
                    Re-export
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
