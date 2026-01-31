import type {
  Deal,
  Document,
  VariableRecord,
  AuditLogEntry,
  VariableKey,
  RawExtractedValue,
} from "./types"
import { VARIABLE_LABELS, ALL_VARIABLE_KEYS } from "./types"

// Mock Deals
export const mockDeals: Deal[] = [
  {
    id: "deal-1",
    name: "Project Alpha",
    targetCompany: "TechCorp Industries",
    sector: "Technology",
    country: "Germany",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "deal-2",
    name: "Project Beta",
    targetCompany: "ManuCo GmbH",
    sector: "Manufacturing",
    country: "Austria",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T11:00:00Z",
  },
  {
    id: "deal-3",
    name: "Project Gamma",
    targetCompany: "HealthServ Ltd",
    sector: "Healthcare",
    country: "UK",
    createdAt: "2023-12-01T08:00:00Z",
    updatedAt: "2024-01-05T16:00:00Z",
  },
]

// Mock Documents per deal
export const mockDocuments: Record<string, Document[]> = {
  "deal-1": [
    {
      documentId: "doc-1a",
      dealId: "deal-1",
      documentType: "TEASER",
      fileName: "TechCorp_Teaser_2024.pdf",
      uploadedAt: "2024-01-15T10:05:00Z",
      status: "COMPLETED",
    },
    {
      documentId: "doc-1b",
      dealId: "deal-1",
      documentType: "IM",
      fileName: "TechCorp_IM_Final.pdf",
      uploadedAt: "2024-01-15T10:10:00Z",
      status: "COMPLETED",
    },
    {
      documentId: "doc-1c",
      dealId: "deal-1",
      documentType: "FINANCIALS",
      fileName: "TechCorp_Financials_2023.xlsx",
      uploadedAt: "2024-01-15T10:15:00Z",
      status: "COMPLETED",
    },
  ],
  "deal-2": [
    {
      documentId: "doc-2a",
      dealId: "deal-2",
      documentType: "TEASER",
      fileName: "ManuCo_Teaser.pdf",
      uploadedAt: "2024-01-10T09:05:00Z",
      status: "COMPLETED",
    },
    {
      documentId: "doc-2b",
      dealId: "deal-2",
      documentType: "MANAGEMENT_DECK",
      fileName: "ManuCo_Management_Presentation.pptx",
      uploadedAt: "2024-01-10T09:10:00Z",
      status: "COMPLETED",
    },
  ],
  "deal-3": [
    {
      documentId: "doc-3a",
      dealId: "deal-3",
      documentType: "IM",
      fileName: "HealthServ_IM.pdf",
      uploadedAt: "2023-12-01T08:05:00Z",
      status: "COMPLETED",
    },
  ],
}

// Helper to create raw extracted values
function createRawValue(
  value: string,
  docId: string,
  fileName: string,
  docType: Document["documentType"],
  page?: number,
  snippet?: string
): RawExtractedValue {
  return {
    value,
    source: {
      documentId: docId,
      documentType: docType,
      fileName,
      pageNumber: page,
      snippet,
    },
  }
}

// Mock Variables per deal - with examples of all statuses
export const mockVariables: Record<string, VariableRecord[]> = {
  "deal-1": [
    // FOUND_SINGLE examples
    {
      variableKey: "REVENUE_LTM",
      label: VARIABLE_LABELS.REVENUE_LTM,
      status: "FOUND_SINGLE",
      rawValues: [
        createRawValue(
          "€45.2m",
          "doc-1b",
          "TechCorp_IM_Final.pdf",
          "IM",
          12,
          "LTM Revenue of €45.2 million as of December 2023"
        ),
      ],
    },
    {
      variableKey: "HQ_COUNTRY",
      label: VARIABLE_LABELS.HQ_COUNTRY,
      status: "FOUND_SINGLE",
      rawValues: [
        createRawValue(
          "Germany",
          "doc-1a",
          "TechCorp_Teaser_2024.pdf",
          "TEASER",
          2,
          "Headquartered in Munich, Germany"
        ),
      ],
    },
    {
      variableKey: "EMPLOYEES",
      label: VARIABLE_LABELS.EMPLOYEES,
      status: "FOUND_SINGLE",
      rawValues: [
        createRawValue(
          "245",
          "doc-1b",
          "TechCorp_IM_Final.pdf",
          "IM",
          8,
          "Current headcount: 245 FTEs"
        ),
      ],
    },
    // FOUND_CONFLICT examples
    {
      variableKey: "EBITDA_LTM",
      label: VARIABLE_LABELS.EBITDA_LTM,
      status: "FOUND_CONFLICT",
      rawValues: [
        createRawValue(
          "€8.3m",
          "doc-1a",
          "TechCorp_Teaser_2024.pdf",
          "TEASER",
          5,
          "Adjusted EBITDA: €8.3m"
        ),
        createRawValue(
          "€7.9m",
          "doc-1c",
          "TechCorp_Financials_2023.xlsx",
          "FINANCIALS",
          undefined,
          "P&L Tab, Cell F22: EBITDA €7.9m"
        ),
      ],
    },
    {
      variableKey: "GROSS_MARGIN",
      label: VARIABLE_LABELS.GROSS_MARGIN,
      status: "FOUND_CONFLICT",
      rawValues: [
        createRawValue(
          "62%",
          "doc-1a",
          "TechCorp_Teaser_2024.pdf",
          "TEASER",
          6,
          "Gross margin of 62%"
        ),
        createRawValue(
          "58.5%",
          "doc-1b",
          "TechCorp_IM_Final.pdf",
          "IM",
          15,
          "Gross margin: 58.5% (audited)"
        ),
        createRawValue(
          "59.2%",
          "doc-1c",
          "TechCorp_Financials_2023.xlsx",
          "FINANCIALS",
          undefined,
          "Calculated gross margin: 59.2%"
        ),
      ],
    },
    // NOT_FOUND examples
    {
      variableKey: "NET_DEBT",
      label: VARIABLE_LABELS.NET_DEBT,
      status: "NOT_FOUND",
      rawValues: [],
    },
    {
      variableKey: "NET_DEBT_TO_EBITDA",
      label: VARIABLE_LABELS.NET_DEBT_TO_EBITDA,
      status: "NOT_FOUND",
      rawValues: [],
    },
    {
      variableKey: "CUSTOMER_CONCENTRATION_TOP1",
      label: VARIABLE_LABELS.CUSTOMER_CONCENTRATION_TOP1,
      status: "NOT_FOUND",
      rawValues: [],
    },
    {
      variableKey: "CUSTOMER_CONCENTRATION_TOP5",
      label: VARIABLE_LABELS.CUSTOMER_CONCENTRATION_TOP5,
      status: "FOUND_SINGLE",
      rawValues: [
        createRawValue(
          "35%",
          "doc-1b",
          "TechCorp_IM_Final.pdf",
          "IM",
          22,
          "Top 5 customers represent 35% of revenue"
        ),
      ],
    },
    {
      variableKey: "EBIT_MARGIN",
      label: VARIABLE_LABELS.EBIT_MARGIN,
      status: "FOUND_SINGLE",
      rawValues: [
        createRawValue(
          "12.4%",
          "doc-1c",
          "TechCorp_Financials_2023.xlsx",
          "FINANCIALS",
          undefined,
          "EBIT margin: 12.4%"
        ),
      ],
    },
    {
      variableKey: "GEO_REVENUE_SPLIT",
      label: VARIABLE_LABELS.GEO_REVENUE_SPLIT,
      status: "FOUND_SINGLE",
      rawValues: [
        createRawValue(
          "DACH 65%, RoW 35%",
          "doc-1b",
          "TechCorp_IM_Final.pdf",
          "IM",
          18,
          "Geographic split: DACH region 65%, Rest of World 35%"
        ),
      ],
    },
    {
      variableKey: "ARR",
      label: VARIABLE_LABELS.ARR,
      status: "NOT_FOUND",
      rawValues: [],
    },
    {
      variableKey: "CHURN",
      label: VARIABLE_LABELS.CHURN,
      status: "NOT_FOUND",
      rawValues: [],
    },
    {
      variableKey: "CAPEX",
      label: VARIABLE_LABELS.CAPEX,
      status: "FOUND_SINGLE",
      rawValues: [
        createRawValue(
          "€2.1m",
          "doc-1c",
          "TechCorp_Financials_2023.xlsx",
          "FINANCIALS",
          undefined,
          "Annual CapEx: €2.1m"
        ),
      ],
    },
    {
      variableKey: "WORKING_CAPITAL",
      label: VARIABLE_LABELS.WORKING_CAPITAL,
      status: "FOUND_CONFLICT",
      rawValues: [
        createRawValue(
          "€4.5m",
          "doc-1b",
          "TechCorp_IM_Final.pdf",
          "IM",
          25,
          "Net working capital: €4.5m"
        ),
        createRawValue(
          "€5.2m",
          "doc-1c",
          "TechCorp_Financials_2023.xlsx",
          "FINANCIALS",
          undefined,
          "NWC per balance sheet: €5.2m"
        ),
      ],
    },
  ],
  "deal-2": ALL_VARIABLE_KEYS.map((key) => ({
    variableKey: key,
    label: VARIABLE_LABELS[key],
    status: key === "REVENUE_LTM" || key === "EBITDA_LTM" ? "FOUND_SINGLE" : "NOT_FOUND",
    rawValues:
      key === "REVENUE_LTM"
        ? [
            createRawValue(
              "€28.5m",
              "doc-2a",
              "ManuCo_Teaser.pdf",
              "TEASER",
              3,
              "Revenue: €28.5m"
            ),
          ]
        : key === "EBITDA_LTM"
          ? [
              createRawValue(
                "€4.2m",
                "doc-2a",
                "ManuCo_Teaser.pdf",
                "TEASER",
                3,
                "EBITDA: €4.2m"
              ),
            ]
          : [],
  })) as VariableRecord[],
  "deal-3": ALL_VARIABLE_KEYS.map((key) => ({
    variableKey: key,
    label: VARIABLE_LABELS[key],
    status: "FOUND_SINGLE",
    rawValues: [
      createRawValue(
        key === "REVENUE_LTM"
          ? "£12.8m"
          : key === "EBITDA_LTM"
            ? "£2.1m"
            : key === "HQ_COUNTRY"
              ? "United Kingdom"
              : key === "EMPLOYEES"
                ? "85"
                : "N/A",
        "doc-3a",
        "HealthServ_IM.pdf",
        "IM",
        10,
        `Extracted value for ${VARIABLE_LABELS[key]}`
      ),
    ],
  })) as VariableRecord[],
}

// Mock Audit Log
export const mockAuditLog: Record<string, AuditLogEntry[]> = {
  "deal-1": [
    {
      id: "audit-1",
      dealId: "deal-1",
      action: "UPLOAD_DOCUMENT",
      actor: "Bazil Cromer",
      at: "2024-01-15T10:05:00Z",
      meta: { fileName: "TechCorp_Teaser_2024.pdf" },
    },
    {
      id: "audit-2",
      dealId: "deal-1",
      action: "UPLOAD_DOCUMENT",
      actor: "Bazil Cromer",
      at: "2024-01-15T10:10:00Z",
      meta: { fileName: "TechCorp_IM_Final.pdf" },
    },
    {
      id: "audit-3",
      dealId: "deal-1",
      action: "UPLOAD_DOCUMENT",
      actor: "Bazil Cromer",
      at: "2024-01-15T10:15:00Z",
      meta: { fileName: "TechCorp_Financials_2023.xlsx" },
    },
    {
      id: "audit-4",
      dealId: "deal-1",
      action: "EXTRACTION_COMPLETED",
      actor: "System",
      at: "2024-01-15T10:20:00Z",
      meta: { documentsProcessed: 3, variablesExtracted: 15 },
    },
  ],
  "deal-2": [
    {
      id: "audit-5",
      dealId: "deal-2",
      action: "UPLOAD_DOCUMENT",
      actor: "Bazil Cromer",
      at: "2024-01-10T09:05:00Z",
      meta: { fileName: "ManuCo_Teaser.pdf" },
    },
  ],
  "deal-3": [],
}

// Helper to get variables by deal
export function getVariablesByDeal(dealId: string): VariableRecord[] {
  return mockVariables[dealId] || []
}

// Helper to get documents by deal
export function getDocumentsByDeal(dealId: string): Document[] {
  return mockDocuments[dealId] || []
}

// Helper to get audit log by deal
export function getAuditLogByDeal(dealId: string): AuditLogEntry[] {
  return mockAuditLog[dealId] || []
}

// Helper to get deal by ID
export function getDealById(dealId: string): Deal | undefined {
  return mockDeals.find((d) => d.id === dealId)
}

// Summary helpers
export function getExtractionSummary(dealId: string) {
  const variables = getVariablesByDeal(dealId)
  return {
    total: variables.length,
    found: variables.filter((v) => v.status === "FOUND_SINGLE" || v.status === "RESOLVED").length,
    conflicts: variables.filter((v) => v.status === "FOUND_CONFLICT").length,
    missing: variables.filter((v) => v.status === "NOT_FOUND").length,
    resolved: variables.filter((v) => v.status === "RESOLVED").length,
  }
}
