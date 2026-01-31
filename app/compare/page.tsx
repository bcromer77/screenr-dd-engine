"use client"

import { useState } from "react"
import Link from "next/link"
import { mockDeals } from "@/lib/screenr/mock-data"
import { ScreenRProvider, useScreenR } from "@/lib/screenr/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, Plus, X, Home } from "lucide-react"
import { ALL_VARIABLE_KEYS, VARIABLE_LABELS } from "@/lib/screenr/types"

function CompareContent() {
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const { getVariables } = useScreenR()

  const addDeal = (dealId: string) => {
    if (selectedDeals.length < 3 && !selectedDeals.includes(dealId)) {
      setSelectedDeals([...selectedDeals, dealId])
    }
  }

  const removeDeal = (dealId: string) => {
    setSelectedDeals(selectedDeals.filter((id) => id !== dealId))
  }

  const getValueForDeal = (dealId: string, variableKey: string): string | null => {
    const variables = getVariables(dealId)
    const variable = variables.find((v) => v.variableKey === variableKey)

    if (!variable) return null

    // Use resolved value if present
    if (variable.resolved) {
      return variable.resolved.value
    }

    // Fall back to FOUND_SINGLE raw value only if unresolved
    if (variable.status === "FOUND_SINGLE" && variable.rawValues[0]) {
      return variable.rawValues[0].value
    }

    // Leave blank if unresolved and NOT_FOUND
    return null
  }

  const availableDeals = mockDeals.filter((d) => !selectedDeals.includes(d.id))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link
            href="/deals"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Deals
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium text-foreground">Deal Comparison</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Home className="h-4 w-4" />
              ProofLines
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">ScreenR</span>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Deal Comparison</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select 2-3 deals to compare their resolved values side by side.
          </p>
        </div>

        {/* Deal selection */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {selectedDeals.map((dealId) => {
              const deal = mockDeals.find((d) => d.id === dealId)
              return (
                <div
                  key={dealId}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <span className="text-sm font-medium text-foreground">
                    {deal?.name || dealId}
                  </span>
                  <button
                    onClick={() => removeDeal(dealId)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            })}

            {selectedDeals.length < 3 && availableDeals.length > 0 && (
              <Select onValueChange={addDeal}>
                <SelectTrigger className="w-48">
                  <Plus className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Add deal..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDeals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Comparison table */}
        {selectedDeals.length >= 2 ? (
          <Card className="border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Variable</TableHead>
                  {selectedDeals.map((dealId) => {
                    const deal = mockDeals.find((d) => d.id === dealId)
                    return (
                      <TableHead key={dealId} className="text-muted-foreground">
                        {deal?.name || dealId}
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALL_VARIABLE_KEYS.map((variableKey) => (
                  <TableRow key={variableKey} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {VARIABLE_LABELS[variableKey]}
                    </TableCell>
                    {selectedDeals.map((dealId) => {
                      const value = getValueForDeal(dealId, variableKey)
                      return (
                        <TableCell key={dealId}>
                          {value ? (
                            <span className="text-foreground">{value}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="border-border bg-card p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">
                Select at least 2 deals
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the dropdown above to add deals for comparison.
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function ComparePage() {
  return (
    <ScreenRProvider>
      <CompareContent />
    </ScreenRProvider>
  )
}
