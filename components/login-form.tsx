"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react"

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

// Participant code format: two letters followed by three digits, e.g. FF278
const PARTICIPANT_CODE_PATTERN = /^[A-Z]{2}[0-9]{3}$/

export function LoginForm() {
  const [participantCode, setParticipantCode] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  const isCodeValid = PARTICIPANT_CODE_PATTERN.test(participantCode)
  const showCodeError = participantCode.length > 0 && !isCodeValid

  // Require code + username before an emailed passcode can be requested.
  const canSendOtp =
    isCodeValid && username.trim().length > 0 && !isSendingOtp && resendIn === 0

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  function handleSendOtp() {
    if (!canSendOtp) return
    setIsSendingOtp(true)
    // Simulate an email delivery request
    setTimeout(() => {
      setIsSendingOtp(false)
      setOtpSent(true)
      setResendIn(30)
      console.log("[v0] OTP requested for:", { participantCode, username })
    }, 1200)
  }

  function handleCodeChange(value: string) {
    // Keep only letters + digits, uppercase, and enforce XX000 ordering.
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const letters = cleaned.replace(/[0-9]/g, "").slice(0, 2)
    const digits = cleaned.replace(/[^0-9]/g, "").slice(0, 3)
    setParticipantCode(letters + digits)
  }

  const isValid =
    isCodeValid &&
    username.trim().length > 0 &&
    password.length > 0 &&
    otp.length === 6

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid || isSubmitting) return
    setIsSubmitting(true)
    // Simulate an auth request
    setTimeout(() => {
      setIsSubmitting(false)
      console.log("[v0] Login submitted:", { participantCode, username, otp })
    }, 1200)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your credentials and one-time passcode to continue.
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

          <div className="space-y-2">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="otp">One-time passcode</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleSendOtp}
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
            <InputOTP
              id="otp"
              maxLength={6}
              value={otp}
              onChange={setOtp}
              containerClassName="justify-between"
            >
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
                : "Enter your code, then request a passcode sent to your email."}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              "Sign in"
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
