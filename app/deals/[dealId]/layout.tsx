"use client"

import React from "react"

import { useParams } from "next/navigation"
import { ScreenRProvider } from "@/lib/screenr/store"
import { DealSidebar } from "@/components/screenr/deal-sidebar"
import { getDealById } from "@/lib/screenr/mock-data"

export default function DealLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const dealId = params.dealId as string
  const deal = getDealById(dealId)

  if (!deal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">Deal not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The deal you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScreenRProvider>
      <div className="flex min-h-screen bg-background">
        <DealSidebar dealId={dealId} dealName={deal.name} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ScreenRProvider>
  )
}
