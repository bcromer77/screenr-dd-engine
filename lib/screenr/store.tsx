"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { mockDeals, type Deal, type Variable, type AuditLogEntry, type ExportRecord } from "./mock-data"

interface ScreenRContextType {
  deals: Deal[]
  getVariables: (dealId: string) => Variable[]
  updateVariable: (dealId: string, variableKey: string, updates: Partial<Variable>) => void
  createExport: (dealId: string, analyst: string) => void
  getAuditLog: (dealId: string) => AuditLogEntry[]
  getExports: (dealId: string) => ExportRecord[]
}

const ScreenRContext = createContext<ScreenRContextType | undefined>(undefined)

export function ScreenRProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(mockDeals)

  const getVariables = (dealId: string): Variable[] => {
    const deal = deals.find((d) => d.id === dealId)
    return deal?.variables || []
  }

  const updateVariable = (
    dealId: string,
    variableKey: string,
    updates: Partial<Variable>
  ) => {
    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.id !== dealId) return deal
        return {
          ...deal,
          variables: deal.variables.map((v) =>
            v.key === variableKey ? { ...v, ...updates } : v
          ),
        }
      })
    )
  }

  const createExport = (dealId: string, analyst: string) => {
    const timestamp = new Date().toISOString()
    
    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.id !== dealId) return deal
        
        const newExport: ExportRecord = {
          id: `export-${Date.now()}`,
          dealId,
          exportedAt: timestamp,
          exportedBy: analyst,
          format: "pdf",
          variableCount: deal.variables.length,
        }
        
        const newAuditEntry: AuditLogEntry = {
          id: `audit-${Date.now()}`,
          timestamp,
          action: "EXPORT_CREATED",
          user: analyst,
          details: `Created PDF export with ${deal.variables.length} variables`,
        }
        
        return {
          ...deal,
          exports: [...(deal.exports || []), newExport],
          auditLog: [...(deal.auditLog || []), newAuditEntry],
        }
      })
    )
  }

  const getAuditLog = (dealId: string): AuditLogEntry[] => {
    const deal = deals.find((d) => d.id === dealId)
    return deal?.auditLog || []
  }

  const getExports = (dealId: string): ExportRecord[] => {
    const deal = deals.find((d) => d.id === dealId)
    return deal?.exports || []
  }

  return (
    <ScreenRContext.Provider
      value={{
        deals,
        getVariables,
        updateVariable,
        createExport,
        getAuditLog,
        getExports,
      }}
    >
      {children}
    </ScreenRContext.Provider>
  )
}

export function useScreenR() {
  const context = useContext(ScreenRContext)
  if (!context) {
    throw new Error("useScreenR must be used within ScreenRProvider")
  }
  return context
}

export function useExtractionSummary(dealId: string) {
  const { getVariables } = useScreenR()
  const variables = getVariables(dealId)

  const total = variables.length
  const extracted = variables.filter((v) => 
    v.status === "FOUND_SINGLE" || v.status === "RESOLVED"
  ).length
  const conflicts = variables.filter((v) => v.status === "CONFLICT").length
  const missing = variables.filter((v) => v.status === "NOT_FOUND").length

  return {
    total,
    extracted,
    conflicts,
    missing,
    completionRate: total > 0 ? Math.round((extracted / total) * 100) : 0,
  }
}
