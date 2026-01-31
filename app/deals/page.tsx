"use client"

import Link from "next/link"
import { mockDeals } from "@/lib/screenr/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, Calendar, MapPin, Briefcase, ChevronLeft, Home } from "lucide-react"

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            <Home className="h-4 w-4" />
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-foreground">ScreenR</span>
            <span className="text-sm text-muted-foreground">Deal Screening</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Home className="h-4 w-4" />
              ProofLines
            </Button>
          </Link>
          <Link href="/compare">
            <Button variant="outline" size="sm">
              Compare Deals
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Deals</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mockDeals.length} deals in archive
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Deal
          </Button>
        </div>

        {/* Deals grid */}
        <div className="space-y-4">
          {mockDeals.map((deal) => (
            <Link key={deal.id} href={`/deals/${deal.id}/uploads`}>
              <Card className="border-border bg-card p-5 transition-colors hover:bg-secondary/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-medium text-foreground">
                          {deal.name}
                        </h2>
                        <Badge variant="outline" className="text-xs">
                          {deal.sector || "Unclassified"}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{deal.targetCompany}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {deal.country && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{deal.country}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Created {new Date(deal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
