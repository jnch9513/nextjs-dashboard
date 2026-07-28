"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const participantCode = searchParams.get("code") ?? ""
  const username = searchParams.get("username") ?? ""

  const [otp, setOtp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  const canSendOtp = !isSendingOtp && resendIn === 0
  const autoSentRef = useRef(false)

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  // Automatically send the passcode once when the user lands on this step,
  // and immediately start the resend countdown.
  useEffect(() => {
    if (autoSentRef.current) return
    autoSentRef.current = true
    sendOtp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function sendOtp() {
    setIsSendingOtp(true)
    // Simulate an email delivery request
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (otp.length !== 6 || isSubmitting) return
    setIsSubmitting(true)
    // Simulate final verification
    setTimeout(() => {
      setIsSubmitting(false)
      console.log("[v0] Login2 verified:", { participantCode, username, otp })
    }, 1200)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl">Verify it&apos;s you</CardTitle>
        <CardDescription>
          Step 2 of 2 &middot; Enter the one-time passcode sent to your email.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {username ? (
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Signing in as{" "}
              <span className="font-medium text-foreground">{username}</span>
              {participantCode ? (
                <>
                  {" "}
                  &middot;{" "}
                  <span className="font-medium text-foreground">{participantCode}</span>
                </>
              ) : null}
            </div>
          ) : null}

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
            <InputOTP
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
                : "Tap “Send code” to receive a passcode by email."}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={otp.length !== 6 || isSubmitting}
          >
            {isSubmitting ? (
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
            onClick={() => router.push("/login2")}
            className="inline-flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </button>
        </CardFooter>
      </form>
    </Card>
  )
}
