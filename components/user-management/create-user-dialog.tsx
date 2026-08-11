"use client"

import type React from "react"
import { useState } from "react"
import { UserPlus } from "lucide-react"

import {
  ROLE_LABELS,
  assignableRoles,
  isParticipantScoped,
  type RoleCode,
  type SessionUser,
} from "@/lib/user-management/types"
import type { CreateUserInput } from "@/lib/user-management/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PARTICIPANT_PATTERN = /^[A-Z]{2}[0-9]{3}$/

export function CreateUserDialog({
  session,
  onCreate,
}: {
  session: SessionUser
  onCreate: (input: CreateUserInput) => void
}) {
  const roles = assignableRoles(session.roleCode)
  const scoped = isParticipantScoped(session.roleCode)

  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [roleCode, setRoleCode] = useState<RoleCode>(roles[roles.length - 1] ?? "MLN")
  const [participantCode, setParticipantCode] = useState("")

  const emailValid = EMAIL_PATTERN.test(email)
  // PO must supply a valid participant code; ML admins inherit their own.
  const participantValid = scoped || PARTICIPANT_PATTERN.test(participantCode)
  const isValid =
    fullName.trim().length > 1 &&
    username.trim().length > 1 &&
    emailValid &&
    participantValid

  function resetForm() {
    setFullName("")
    setUsername("")
    setEmail("")
    setRoleCode(roles[roles.length - 1] ?? "MLN")
    setParticipantCode("")
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid) return
    onCreate({
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      roleCode,
      participantCode: scoped ? session.participantCode : participantCode,
    })
    resetForm()
    setOpen(false)
  }

  const roleItems = roles.map((r) => ({ label: ROLE_LABELS[r], value: r }))

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger render={<Button />}>
        <UserPlus className="size-4" aria-hidden="true" />
        Create user
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>
              New users require approval from a different admin before they become active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Full name</Label>
              <Input
                id="new-name"
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-username">Username</Label>
              <Input
                id="new-username"
                placeholder="e.g. jane.doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="e.g. jane.doe@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={email.length > 0 && !emailValid}
                autoComplete="off"
                required
              />
              {email.length > 0 && !emailValid ? (
                <p className="text-xs text-destructive">Enter a valid email address.</p>
              ) : null}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-role">Role</Label>
                <Select
                  value={roleCode}
                  onValueChange={(v) => setRoleCode(v as RoleCode)}
                  items={roleItems}
                >
                  <SelectTrigger id="new-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {scoped ? (
                <div className="flex-1 space-y-2">
                  <Label htmlFor="new-participant-fixed">Participant</Label>
                  <Input
                    id="new-participant-fixed"
                    value={session.participantCode}
                    className="font-mono"
                    readOnly
                    disabled
                  />
                </div>
              ) : (
                <div className="flex-1 space-y-2">
                  <Label htmlFor="new-participant">Participant code</Label>
                  <Input
                    id="new-participant"
                    placeholder="e.g. FF278"
                    value={participantCode}
                    onChange={(e) =>
                      setParticipantCode(
                        e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 5),
                      )
                    }
                    aria-invalid={participantCode.length > 0 && !PARTICIPANT_PATTERN.test(participantCode)}
                    className="font-mono uppercase"
                    autoComplete="off"
                    required
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Requested by {session.fullName}. Another admin must approve this request.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Submit for approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
