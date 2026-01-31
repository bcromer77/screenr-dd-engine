"use client"

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
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  FileText,
} from "lucide-react"

export default function ExtractionPage() {
  const params = useParams()
  const dealId = params.dealId as string
  const { getDocuments } = useScreenR()
  const documents = getDocuments(dealId)
  const summary = useExtractionSummary(dealId)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step 2</span>
          <span>/</span>
          <span>Extraction Preview</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Extraction Results</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only preview of extracted data. No edits allowed here.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <Card className="border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-green/20">
              <CheckCircle2 className="h-5 w-5 text-status-green" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{summary.found}</div>
              <div className="text-xs text-muted-foreground">Variables Found</div>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-orange/20">
              <AlertTriangle className="h-5 w-5 text-status-orange" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{summary.conflicts}</div>
              <div className="text-xs text-muted-foreground">Conflicts Detected</div>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-red/20">
              <HelpCircle className="h-5 w-5 text-status-red" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{summary.missing}</div>
              <div className="text-xs text-muted-foreground">Missing Variables</div>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{documents.length}</div>
              <div className="text-xs text-muted-foreground">Documents Processed</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Documents processed */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-medium text-foreground">Documents Processed</h2>
        <Card className="border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Document</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.documentId} className="border-border">
                  <TableCell className="font-medium text-foreground">{doc.fileName}</TableCell>
                  <TableCell className="text-muted-foreground">{doc.documentType}</TableCell>
                  <TableCell>
                    <Badge className="bg-status-green/20 text-status-green border-0">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Extracted
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Action required notice */}
      {summary.actionRequired > 0 && (
        <Card className="mb-8 border-status-orange/30 bg-status-orange/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-status-orange" />
            <div>
              <div className="font-medium text-foreground">Action Required</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.conflicts} conflicts and {summary.missing} missing variables need analyst resolution before export.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* CTA */}
      <div className="flex justify-end">
        <Link href={`/deals/${dealId}/variables`}>
          <Button className="gap-2">
            Proceed to Data Resolution
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
