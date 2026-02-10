"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, ArrowRight, AlertCircle } from "lucide-react"

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Check if already authenticated via cookie
  useEffect(() => {
    fetch("/api/auth/check").then((res) => {
      setIsAuthenticated(res.ok)
    }).catch(() => {
      setIsAuthenticated(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        setError("Incorrect password")
        setPassword("")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-accent" />
      </div>
    )
  }

  // Authenticated - show app
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Password form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Tally R</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="Password"
              autoFocus
              className="border-border bg-input text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:ring-accent"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={!password.trim() || isLoading}
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
          >
            {isLoading ? "Verifying..." : "Continue"}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
