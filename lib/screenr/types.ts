"use client"

// ScreenR Data Types - PE/M&A Deal Screening

// Document Types
export type DocumentType = "TEASER" | "IM" | "MANAGEMENT_DECK" | "FINANCIALS" | "OTHER"

export type DocumentStatus = "PENDING" | "PROCESSING" | "COMPLETED"

export interface Document {
  documentId: string
  dealId: string
  documentType: DocumentType
  fileName: string
  uploadedAt: string // ISO
  status: DocumentStatus
}

// Variable Keys - MVP list of 15 variables
export type VariableKey =
  | "REVENUE_LTM"
  | "EBITDA_LTM"
  | "NET_DEBT"
  | "NET_DEBT_TO_EBITDA"
  | "CUSTOMER_CONCENTRATION_TOP1"
  | "CUSTOMER_CONCENTRATION_TOP5"
  | "GROSS_MARGIN"
  | "EBIT_MARGIN"
  | "GEO_REVENUE_SPLIT"
  | "EMPLOYEES"
  | "HQ_COUNTRY"
  | "ARR"
  | "CHURN"
  | "CAPEX"
  | "WORKING_CAPITAL"

export const VARIABLE_LABELS: Record<VariableKey, string> = {
  REVENUE_LTM: "Revenue (LTM)",
  EBITDA_LTM: "EBITDA (LTM)",
  NET_DEBT: "Net Debt",
  NET_DEBT_TO_EBITDA: "Net Debt / EBITDA",
  CUSTOMER_CONCENTRATION_TOP1: "Top 1 Customer (%)",
  CUSTOMER_CONCENTRATION_TOP5: "Top 5 Customers (%)",
  GROSS_MARGIN: "Gross Margin (%)",
  EBIT_MARGIN: "EBIT Margin (%)",
  GEO_REVENUE_SPLIT: "Geographic Revenue Split",
  EMPLOYEES: "Employees (FTE)",
  HQ_COUNTRY: "HQ Country",
  ARR: "ARR (SaaS)",
  CHURN: "Churn Rate (%)",
  CAPEX: "CapEx",
  WORKING_CAPITAL: "Working Capital",
}

export const ALL_VARIABLE_KEYS: VariableKey[] = [
  "REVENUE_LTM",
  "EBITDA_LTM",
  "NET_DEBT",
  "NET_DEBT_TO_EBITDA",
  "CUSTOMER_CONCENTRATION_TOP1",
  "CUSTOMER_CONCENTRATION_TOP5",
  "GROSS_MARGIN",
  "EBIT_MARGIN",
  "GEO_REVENUE_SPLIT",
  "EMPLOYEES",
  "HQ_COUNTRY",
  "ARR",
  "CHURN",
  "CAPEX",
  "WORKING_CAPITAL",
]

// Variable Status
export type VariableStatus =
  | "FOUND_SINGLE"
  | "FOUND_CONFLICT"
  | "NOT_FOUND"
  | "RESOLVED"

// Source Pointer - links to document location
export interface SourcePointer {
  documentId: string
  documentType: DocumentType
  fileName: string
  pageNumber?: number
  snippet?: string
}

// Raw Extracted Value - IMMUTABLE
export interface RawExtractedValue {
  value: string
  normalizedValue?: string
  source: SourcePointer
}

// Resolution Types
export type ResolutionType = "ANALYST_SELECTED" | "ANALYST_ENTERED"

// Analyst Source Type (for missing values)
export type AnalystSourceType =
  | "MANAGEMENT_CALL"
  | "BROKER_EMAIL"
  | "PUBLIC_SOURCE"
  | "ASSUMPTION"

export const ANALYST_SOURCE_LABELS: Record<AnalystSourceType, string> = {
  MANAGEMENT_CALL: "Management Call",
  BROKER_EMAIL: "Broker Email",
  PUBLIC_SOURCE: "Public Source",
  ASSUMPTION: "Assumption",
}

// Resolved Value - created by analyst action
export interface ResolvedValue {
  value: string
  resolutionType: ResolutionType
  analystSourceType?: AnalystSourceType // required if ANALYST_ENTERED
  comment?: string // required if ANALYST_ENTERED
  resolvedBy: string // mock user
  resolvedAt: string // ISO
  selectedFromIndex?: number // if ANALYST_SELECTED
}

// Variable Record - the core data structure
export interface VariableRecord {
  variableKey: VariableKey
  label: string
  status: VariableStatus
  rawValues: RawExtractedValue[] // IMMUTABLE list
  resolved?: ResolvedValue
}

// Audit Log Actions
export type AuditAction =
  | "UPLOAD_DOCUMENT"
  | "EXTRACTION_COMPLETED"
  | "RESOLVE_SELECTED"
  | "RESOLVE_ENTERED"
  | "EXPORT_PDF"

// Audit Log Entry
export interface AuditLogEntry {
  id: string
  dealId: string
  variableKey?: VariableKey
  action: AuditAction
  actor: string
  at: string // ISO
  meta: Record<string, unknown>
}

// Deal
export interface Deal {
  id: string
  name: string
  targetCompany: string
  sector?: string
  country?: string
  createdAt: string // ISO
  updatedAt: string // ISO
}

// Export Record
export interface ExportRecord {
  id: string
  dealId: string
  exportedAt: string // ISO
  exportedBy: string
  fileName: string
}

// Origin Badge type for display
export type OriginBadge = "Extracted" | "Analyst selected" | "Analyst provided"

// Helper to determine origin badge
export function getOriginBadge(variable: VariableRecord): OriginBadge | null {
  if (!variable.resolved) {
    if (variable.status === "FOUND_SINGLE") {
      return "Extracted"
    }
    return null
  }

  if (variable.resolved.resolutionType === "ANALYST_SELECTED") {
    return "Analyst selected"
  }

  if (variable.resolved.resolutionType === "ANALYST_ENTERED") {
    return "Analyst provided"
  }

  return null
}
