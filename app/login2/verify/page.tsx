import { Suspense } from "react"

import { VerifyOtpForm } from "@/components/verify-otp-form"

export default function Login2VerifyPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Suspense fallback={null}>
        <VerifyOtpForm />
      </Suspense>
    </main>
  )
}
