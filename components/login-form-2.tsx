"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react"

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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

// Participant code format: two letters followed by three digits, e.g. FF278
const PARTICIPANT_CODE_PATTERN = /^[A-Z]{2}[0-9]{3}$/

type Step = "credentials" | "otp"

export function LoginForm2() {
  const [step, setStep] = useState<Step>("credentials")

  // Step 1 fields
  const [participantCode, setParticipantCode] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 2 fields
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const autoSentRef = useRef(false)

  const isCodeValid = PARTICIPANT_CODE_PATTERN.test(participantCode)
  const showCodeError = participantCode.length > 0 && !isCodeValid
  const isCredentialsValid = isCodeValid && username.trim().length > 0 && password.length > 0
  const canSendOtp = !isSendingOtp && resendIn === 0

  function handleCodeChange(value: string) {
    // Keep only letters + digits, uppercase, and enforce XX000 ordering.
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const letters = cleaned.replace(/[0-9]/g, "").slice(0, 2)
    const digits = cleaned.replace(/[^0-9]/g, "").slice(0, 3)
    setParticipantCode(letters + digits)
  }

  // Resend countdown tick.
  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  // Auto-send the passcode once, the first time we enter the OTP step.
  useEffect(() => {
    if (step !== "otp" || autoSentRef.current) return
    autoSentRef.current = true
    sendOtp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // --- Backend hooks: replace these mock timeouts with Spring Boot calls ---
  // Step 1: POST credentials. On success the server marks the session as
  // OTP_PENDING and emails the code; we simply flip to the OTP step.
  function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isCredentialsValid || isSubmitting) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      console.log("[v0] Login2 credentials submitted:", { participantCode, username })
      setStep("otp")
    }, 800)
  }

  // Ask the server to (re)send the passcode to the session's email.
  function sendOtp() {
    setIsSendingOtp(true)
    setTimeout(() => {
      setIsSendingOtp(false)
      setOtpSent(true)
      setResendIn(30)
      console.log("[v0] OTP requested for:", { participantCode, username })
    }, 1200)
  }

  function handleResend() {
    if (!canSendOtp) return
    sendOtp()
  }

  // Step 2: POST the OTP; server validates against the session and authenticates.
  function handleVerifySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (otp.length !== 6 || isVerifying) return
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      console.log("[v0] Login2 verified:", { participantCode, username, otp })
    }, 1200)
  }

  // Return to step 1 and reset the passcode state so a fresh code is sent.
  function handleBack() {
    setStep("credentials")
    setOtp("")
    setOtpSent(false)
    setResendIn(0)
    autoSentRef.current = false
  }

  return (
    <Card className="w-full max-w-md">
      {step === "credentials" ? (
        <>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Step 1 of 2 &middot; Enter your credentials to continue.</CardDescription>
          </CardHeader>

          <form onSubmit={handleCredentialsSubmit}>
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
                  className={showCodeError ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
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
              <Button type="submit" className="w-full" disabled={!isCredentialsValid || isSubmitting}>
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
                <a href="#" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Forgot password?
                </a>
                <span className="text-muted-foreground" aria-hidden="true">
                  &middot;
                </span>
                <a href="#" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Forgot username?
                </a>
              </div>
            </CardFooter>
          </form>
        </>
      ) : (
        <>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">Verify it&apos;s you</CardTitle>
            <CardDescription>Step 2 of 2 &middot; Enter the one-time passcode sent to your email.</CardDescription>
          </CardHeader>

          <form onSubmit={handleVerifySubmit}>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Signing in as <span className="font-medium text-foreground">{username}</span> &middot;{" "}
                <span className="font-medium text-foreground">{participantCode}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">One-time passcode</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={handleResend}
                    disabled={!canSendOtp}
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                        Sending...
                      </>
                    ) : resendIn > 0 ? (
                      `Resend in ${resendIn}s`
                    ) : (
                      <>
                        <Mail className="size-3.5" aria-hidden="true" />
                        {otpSent ? "Resend code" : "Send code"}
                      </>
                    )}
                  </Button>
                </div>
                <InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="justify-between">
                  <InputOTPGroup className="w-full justify-between gap-2">
                    <InputOTPSlot index={0} className="h-11 flex-1 rounded-md border" />
                    <InputOTPSlot index={1} className="h-11 flex-1 rounded-md border" />
                    <InputOTPSlot index={2} className="h-11 flex-1 rounded-md border" />
                    <InputOTPSlot index={3} className="h-11 flex-1 rounded-md border" />
                    <InputOTPSlot index={4} className="h-11 flex-1 rounded-md border" />
                    <InputOTPSlot index={5} className="h-11 flex-1 rounded-md border" />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-xs text-muted-foreground">
                  {otpSent
                    ? "We emailed you a 6-digit passcode. Enter it above."
                    : "Tap “Send code” to receive a passcode by email."}
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={otp.length !== 6 || isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Verifying...
                  </>
                ) : (
                  "Verify & sign in"
                )}
              </Button>
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to sign in
              </button>
            </CardFooter>
          </form>
        </>
      )}
    </Card>
  )
}
