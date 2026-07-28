"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Participant code format: two letters followed by three digits, e.g. FF278
const PARTICIPANT_CODE_PATTERN = /^[A-Z]{2}[0-9]{3}$/

export function LoginForm2() {
  const router = useRouter()
  const [participantCode, setParticipantCode] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isCodeValid = PARTICIPANT_CODE_PATTERN.test(participantCode)
  const showCodeError = participantCode.length > 0 && !isCodeValid

  function handleCodeChange(value: string) {
    // Keep only letters + digits, uppercase, and enforce XX000 ordering.
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const letters = cleaned.replace(/[0-9]/g, "").slice(0, 2)
    const digits = cleaned.replace(/[^0-9]/g, "").slice(0, 3)
    setParticipantCode(letters + digits)
  }

  const isValid =
    isCodeValid && username.trim().length > 0 && password.length > 0

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid || isSubmitting) return
    setIsSubmitting(true)
    // Simulate credential check, then move to the passcode step.
    setTimeout(() => {
      console.log("[v0] Login2 step 1 submitted:", { participantCode, username })
      const params = new URLSearchParams({ code: participantCode, username })
      router.push(`/login2/verify?${params.toString()}`)
    }, 800)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Step 1 of 2 &middot; Enter your credentials to continue.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participant-code">Participant code</Label>
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="participant-code"
                placeholder="e.g. FF278"
                autoComplete="off"
                inputMode="text"
                maxLength={5}
                className="pl-9 uppercase"
                value={participantCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                aria-invalid={showCodeError}
                aria-describedby="participant-code-hint"
                required
              />
            </div>
            <p
              id="participant-code-hint"
              className={
                showCodeError ? "text-xs text-destructive" : "text-xs text-muted-foreground"
              }
            >
              {showCodeError
                ? "Code must be 2 letters followed by 3 digits (e.g. FF278)."
                : "Format: 2 letters + 3 digits, e.g. FF278."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="username"
                placeholder="your.username"
                autoComplete="username"
                className="pl-9"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4 space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="px-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Continuing...
              </>
            ) : (
              "Continue"
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 text-sm">
            <a
              href="#"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </a>
            <span className="text-muted-foreground" aria-hidden="true">
              &middot;
            </span>
            <a
              href="#"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Forgot username?
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
