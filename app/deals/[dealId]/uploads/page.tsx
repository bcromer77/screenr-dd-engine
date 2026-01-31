"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useScreenR } from "@/lib/screenr/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Presentation,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react"
import type { DocumentType } from "@/lib/screenr/types"

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  TEASER: "Teaser",
  IM: "Information Memorandum",
  MANAGEMENT_DECK: "Management Deck",
  FINANCIALS: "Financials",
  OTHER: "Other",
}

function getDocumentIcon(type: DocumentType) {
  switch (type) {
    case "FINANCIALS":
      return FileSpreadsheet
    case "MANAGEMENT_DECK":
      return Presentation
    default:
      return FileText
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="bg-status-green/20 text-status-green border-0">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      )
    case "PROCESSING":
      return (
        <Badge className="bg-accent/20 text-accent border-0">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Processing
        </Badge>
      )
    default:
      return (
        <Badge className="bg-muted text-muted-foreground border-0">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
  }
}

export default function UploadsPage() {
  const params = useParams()
  const dealId = params.dealId as string
  const { getDocuments, uploadDocument } = useScreenR()
  const documents = getDocuments(dealId)

  const [isOpen, setIsOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [documentType, setDocumentType] = useState<DocumentType>("IM")

  const handleUpload = () => {
    if (!fileName.trim()) return

    uploadDocument(dealId, fileName, documentType, "Bazil Cromer")
    setFileName("")
    setDocumentType("IM")
    setIsOpen(false)
  }

  const allCompleted = documents.length > 0 && documents.every((d) => d.status === "COMPLETED")

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step 1</span>
          <span>/</span>
          <span>Document Upload</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Uploads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload deal documents for extraction. Supported formats: PDF, XLSX, PPTX, DOCX.
        </p>
      </div>

      {/* Upload button */}
      <div className="mb-6">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  placeholder="e.g., Company_IM_2024.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select
                  value={documentType}
                  onValueChange={(v) => setDocumentType(v as DocumentType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!fileName.trim()}>
                  Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents table */}
      {documents.length > 0 ? (
        <Card className="border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">File Name</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Uploaded</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => {
                const Icon = getDocumentIcon(doc.documentType)
                return (
                  <TableRow key={doc.documentId} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{doc.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {DOCUMENT_TYPE_LABELS[doc.documentType]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(doc.uploadedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="border-border bg-card p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-foreground">No documents uploaded</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload deal documents to begin extraction.
            </p>
          </div>
        </Card>
      )}

      {/* Next step CTA */}
      {allCompleted && (
        <div className="mt-6 flex justify-end">
          <Link href={`/deals/${dealId}/extraction`}>
            <Button variant="outline" className="gap-2 bg-transparent">
              View Extraction Results
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
