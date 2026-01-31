"use client"

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type {
  VariableRecord,
  VariableKey,
  AuditLogEntry,
  Document,
  ExportRecord,
  AnalystSourceType,
  ResolvedValue,
} from "./types"
import {
  mockVariables,
  mockDocuments,
  mockAuditLog,
} from "./mock-data"

// Store State
interface ScreenRState {
  // Variables per deal (keyed by dealId)
  variables: Record<string, VariableRecord[]>
  // Documents per deal
  documents: Record<string, Document[]>
  // Audit log per deal
  auditLog: Record<string, AuditLogEntry[]>
  // Export records per deal
  exports: Record<string, ExportRecord[]>
}

// Store Actions
interface ScreenRActions {
  // Resolve a conflict by selecting from raw values
  resolveBySelection: (
    dealId: string,
    variableKey: VariableKey,
    selectedIndex: number,
    actor: string
  ) => void

  // Resolve a missing value by analyst entry
  resolveByEntry: (
    dealId: string,
    variableKey: VariableKey,
    value: string,
    sourceType: AnalystSourceType,
    comment: string,
    actor: string
  ) => void

  // Upload a document (mock)
  uploadDocument: (
    dealId: string,
    fileName: string,
    documentType: Document["documentType"],
    actor: string
  ) => void

  // Complete document processing (mock)
  completeDocumentProcessing: (dealId: string, documentId: string) => void

  // Create export record
  createExport: (dealId: string, actor: string) => ExportRecord

  // Get variables for a deal
  getVariables: (dealId: string) => VariableRecord[]

  // Get a single variable
  getVariable: (dealId: string, variableKey: VariableKey) => VariableRecord | undefined

  // Get documents for a deal
  getDocuments: (dealId: string) => Document[]

  // Get audit log for a deal
  getAuditLog: (dealId: string) => AuditLogEntry[]

  // Get exports for a deal
  getExports: (dealId: string) => ExportRecord[]
}

type ScreenRContextValue = ScreenRState & ScreenRActions

const ScreenRContext = createContext<ScreenRContextValue | null>(null)

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Provider Component
export function ScreenRProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScreenRState>({
    variables: { ...mockVariables },
    documents: { ...mockDocuments },
    auditLog: { ...mockAuditLog },
    exports: {},
  })

  // Resolve by selection (for conflicts)
  const resolveBySelection = useCallback(
    (dealId: string, variableKey: VariableKey, selectedIndex: number, actor: string) => {
      setState((prev) => {
        const dealVariables = prev.variables[dealId] || []
        const variableIndex = dealVariables.findIndex((v) => v.variableKey === variableKey)

        if (variableIndex === -1) return prev

        const variable = dealVariables[variableIndex]
        if (!variable.rawValues[selectedIndex]) return prev

        const resolved: ResolvedValue = {
          value: variable.rawValues[selectedIndex].value,
          resolutionType: "ANALYST_SELECTED",
          resolvedBy: actor,
          resolvedAt: new Date().toISOString(),
          selectedFromIndex: selectedIndex,
        }

        const updatedVariable: VariableRecord = {
          ...variable,
          status: "RESOLVED",
          resolved,
        }

        const updatedVariables = [...dealVariables]
        updatedVariables[variableIndex] = updatedVariable

        // Create audit entry
        const auditEntry: AuditLogEntry = {
          id: generateId(),
          dealId,
          variableKey,
          action: "RESOLVE_SELECTED",
          actor,
          at: new Date().toISOString(),
          meta: {
            selectedValue: resolved.value,
            sourceDocument: variable.rawValues[selectedIndex].source.fileName,
          },
        }

        const dealAudit = prev.auditLog[dealId] || []

        return {
          ...prev,
          variables: {
            ...prev.variables,
            [dealId]: updatedVariables,
          },
          auditLog: {
            ...prev.auditLog,
            [dealId]: [auditEntry, ...dealAudit],
          },
        }
      })
    },
    []
  )

  // Resolve by entry (for missing values)
  const resolveByEntry = useCallback(
    (
      dealId: string,
      variableKey: VariableKey,
      value: string,
      sourceType: AnalystSourceType,
      comment: string,
      actor: string
    ) => {
      setState((prev) => {
        const dealVariables = prev.variables[dealId] || []
        const variableIndex = dealVariables.findIndex((v) => v.variableKey === variableKey)

        if (variableIndex === -1) return prev

        const variable = dealVariables[variableIndex]

        const resolved: ResolvedValue = {
          value,
          resolutionType: "ANALYST_ENTERED",
          analystSourceType: sourceType,
          comment,
          resolvedBy: actor,
          resolvedAt: new Date().toISOString(),
        }

        const updatedVariable: VariableRecord = {
          ...variable,
          status: "RESOLVED",
          resolved,
        }

        const updatedVariables = [...dealVariables]
        updatedVariables[variableIndex] = updatedVariable

        // Create audit entry
        const auditEntry: AuditLogEntry = {
          id: generateId(),
          dealId,
          variableKey,
          action: "RESOLVE_ENTERED",
          actor,
          at: new Date().toISOString(),
          meta: {
            enteredValue: value,
            sourceType,
            comment,
          },
        }

        const dealAudit = prev.auditLog[dealId] || []

        return {
          ...prev,
          variables: {
            ...prev.variables,
            [dealId]: updatedVariables,
          },
          auditLog: {
            ...prev.auditLog,
            [dealId]: [auditEntry, ...dealAudit],
          },
        }
      })
    },
    []
  )

  // Upload document (mock)
  const uploadDocument = useCallback(
    (
      dealId: string,
      fileName: string,
      documentType: Document["documentType"],
      actor: string
    ) => {
      const newDoc: Document = {
        documentId: generateId(),
        dealId,
        documentType,
        fileName,
        uploadedAt: new Date().toISOString(),
        status: "PROCESSING",
      }

      const auditEntry: AuditLogEntry = {
        id: generateId(),
        dealId,
        action: "UPLOAD_DOCUMENT",
        actor,
        at: new Date().toISOString(),
        meta: { fileName, documentType },
      }

      setState((prev) => {
        const dealDocs = prev.documents[dealId] || []
        const dealAudit = prev.auditLog[dealId] || []

        return {
          ...prev,
          documents: {
            ...prev.documents,
            [dealId]: [...dealDocs, newDoc],
          },
          auditLog: {
            ...prev.auditLog,
            [dealId]: [auditEntry, ...dealAudit],
          },
        }
      })

      // Simulate processing completion after delay
      setTimeout(() => {
        setState((prev) => {
          const dealDocs = prev.documents[dealId] || []
          const docIndex = dealDocs.findIndex((d) => d.documentId === newDoc.documentId)
          if (docIndex === -1) return prev

          const updatedDocs = [...dealDocs]
          updatedDocs[docIndex] = { ...updatedDocs[docIndex], status: "COMPLETED" }

          // Calculate extraction summary for the audit log
          const dealVariables = prev.variables[dealId] || []
          const variablesFound = dealVariables.filter(
            (v) => v.status === "FOUND_SINGLE" || v.status === "FOUND_CONFLICT" || v.status === "RESOLVED"
          ).length
          const conflictsDetected = dealVariables.filter((v) => v.status === "FOUND_CONFLICT").length
          const missingDetected = dealVariables.filter((v) => v.status === "NOT_FOUND").length

          // Create EXTRACTION_COMPLETED audit entry
          const extractionAuditEntry: AuditLogEntry = {
            id: generateId(),
            dealId,
            action: "EXTRACTION_COMPLETED",
            actor: "System",
            at: new Date().toISOString(),
            meta: {
              documentsProcessed: updatedDocs.filter((d) => d.status === "COMPLETED").length,
              variablesFound,
              conflictsDetected,
              missingDetected,
              documentId: newDoc.documentId,
              fileName: newDoc.fileName,
            },
          }

          const dealAudit = prev.auditLog[dealId] || []

          return {
            ...prev,
            documents: {
              ...prev.documents,
              [dealId]: updatedDocs,
            },
            auditLog: {
              ...prev.auditLog,
              [dealId]: [extractionAuditEntry, ...dealAudit],
            },
          }
        })
      }, 2000)
    },
    []
  )

  // Complete document processing
  const completeDocumentProcessing = useCallback((dealId: string, documentId: string) => {
    setState((prev) => {
      const dealDocs = prev.documents[dealId] || []
      const docIndex = dealDocs.findIndex((d) => d.documentId === documentId)
      if (docIndex === -1) return prev

      const updatedDocs = [...dealDocs]
      updatedDocs[docIndex] = { ...updatedDocs[docIndex], status: "COMPLETED" }

      return {
        ...prev,
        documents: {
          ...prev.documents,
          [dealId]: updatedDocs,
        },
      }
    })
  }, [])

  // Create export
  const createExport = useCallback((dealId: string, actor: string): ExportRecord => {
    const exportRecord: ExportRecord = {
      id: generateId(),
      dealId,
      exportedAt: new Date().toISOString(),
      exportedBy: actor,
      fileName: `ScreenR_${dealId}_${new Date().toISOString().split("T")[0]}.pdf`,
    }

    const auditEntry: AuditLogEntry = {
      id: generateId(),
      dealId,
      action: "EXPORT_PDF",
      actor,
      at: new Date().toISOString(),
      meta: { fileName: exportRecord.fileName },
    }

    setState((prev) => {
      const dealExports = prev.exports[dealId] || []
      const dealAudit = prev.auditLog[dealId] || []

      return {
        ...prev,
        exports: {
          ...prev.exports,
          [dealId]: [exportRecord, ...dealExports],
        },
        auditLog: {
          ...prev.auditLog,
          [dealId]: [auditEntry, ...dealAudit],
        },
      }
    })

    return exportRecord
  }, [])

  // Getters
  const getVariables = useCallback(
    (dealId: string): VariableRecord[] => {
      return state.variables[dealId] || []
    },
    [state.variables]
  )

  const getVariable = useCallback(
    (dealId: string, variableKey: VariableKey): VariableRecord | undefined => {
      const dealVariables = state.variables[dealId] || []
      return dealVariables.find((v) => v.variableKey === variableKey)
    },
    [state.variables]
  )

  const getDocuments = useCallback(
    (dealId: string): Document[] => {
      return state.documents[dealId] || []
    },
    [state.documents]
  )

  const getAuditLog = useCallback(
    (dealId: string): AuditLogEntry[] => {
      return state.auditLog[dealId] || []
    },
    [state.auditLog]
  )

  const getExports = useCallback(
    (dealId: string): ExportRecord[] => {
      return state.exports[dealId] || []
    },
    [state.exports]
  )

  const value: ScreenRContextValue = {
    ...state,
    resolveBySelection,
    resolveByEntry,
    uploadDocument,
    completeDocumentProcessing,
    createExport,
    getVariables,
    getVariable,
    getDocuments,
    getAuditLog,
    getExports,
  }

  return <ScreenRContext.Provider value={value}>{children}</ScreenRContext.Provider>
}

// Hook to use the store
export function useScreenR() {
  const context = useContext(ScreenRContext)
  if (!context) {
    throw new Error("useScreenR must be used within a ScreenRProvider")
  }
  return context
}

// Hook for extraction summary
export function useExtractionSummary(dealId: string) {
  const { getVariables } = useScreenR()
  const variables = getVariables(dealId)

  return {
    total: variables.length,
    found: variables.filter(
      (v) => v.status === "FOUND_SINGLE" || v.status === "RESOLVED"
    ).length,
    conflicts: variables.filter((v) => v.status === "FOUND_CONFLICT").length,
    missing: variables.filter((v) => v.status === "NOT_FOUND").length,
    resolved: variables.filter((v) => v.status === "RESOLVED").length,
    actionRequired: variables.filter(
      (v) => v.status === "FOUND_CONFLICT" || v.status === "NOT_FOUND"
    ).length,
  }
}
