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
} from "lucide-react"
import { getOriginBadge } from "@/lib/screenr/types"

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

  const hasUnresolved = summary.actionRequired > 0

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)

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
        throw new Error("Failed to generate PDF")
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
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
      // Reset success message after delay
      setTimeout(() => setExportSuccess(false), 3000)
    }
  }

  // Variables that have values (resolved or found single)
  const exportableVariables = variables.filter(
    (v) => v.status === "RESOLVED" || v.status === "FOUND_SINGLE"
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step 5</span>
          <span>/</span>
          <span>Export</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Generate One-Page PDF</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Export resolved variables as a committee-ready PDF document.
        </p>
      </div>

      {/* Warning */}
      {hasUnresolved && (
        <Card className="mb-6 border-status-orange/30 bg-status-orange/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-status-orange" />
            <div>
              <div className="font-medium text-foreground">Incomplete Data</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.actionRequired} variables are unresolved. They will appear blank in the export.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Export preview */}
      <Card className="mb-6 border-border bg-card">
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Export Preview</div>
              <div className="text-xs text-muted-foreground">
                {exportableVariables.length} of {variables.length} variables will be included
              </div>
            </div>
            <Badge variant="outline">PDF</Badge>
          </div>
        </div>

        <div className="p-5">
          {/* Mock PDF preview */}
          <div className="rounded-lg border border-border bg-background p-6">
            <div className="mb-6 border-b border-border pb-4">
              <div className="text-lg font-semibold text-foreground">
                {deal?.name || "Deal"} - Screening Summary
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {deal?.targetCompany} | Generated by ScreenR
              </div>
            </div>

            <div className="space-y-3">
              {exportableVariables.slice(0, 8).map((variable) => {
                const displayValue =
                  variable.resolved?.value ||
                  (variable.status === "FOUND_SINGLE" ? variable.rawValues[0]?.value : "—")
                const origin = getOriginBadge(variable)

                return (
                  <div
                    key={variable.variableKey}
                    className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                  >
                    <div className="text-sm text-muted-foreground">{variable.label}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{displayValue}</span>
                      {origin && (
                        <span className="text-xs text-muted-foreground">({origin})</span>
                      )}
                    </div>
                  </div>
                )
              })}
              {exportableVariables.length > 8 && (
                <div className="text-center text-xs text-muted-foreground">
                  + {exportableVariables.length - 8} more variables
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
              Generated by ScreenR | {new Date().toLocaleDateString()} | Analyst: Bazil Cromer
            </div>
          </div>
        </div>
      </Card>

      {/* Export actions */}
      <div className="flex items-center gap-4">
        <Button onClick={handleExport} disabled={isExporting} className="gap-2">
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Generate PDF
            </>
          )}
        </Button>

        {exportSuccess && (
          <div className="flex items-center gap-2 text-sm text-status-green">
            <CheckCircle2 className="h-4 w-4" />
            Export created successfully
          </div>
        )}
      </div>

      {/* Past exports */}
      {exports.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-medium text-foreground">Recent Exports</h2>
          <div className="space-y-2">
            {exports.map((exp) => (
              <Card key={exp.id} className="border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{exp.fileName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(exp.exportedAt).toLocaleString()} by {exp.exportedBy}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="h-3 w-3" />
                    Download
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
