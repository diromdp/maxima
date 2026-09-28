import { Avatar } from "@mantine/core"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"

import { PasswordForm } from "./PasswordForm"
import { ProfileForm } from "./ProfileForm"

export default async function StaffProfilePage() {
  const session = await requireSession("staff")
  const accountRows = [
    { label: "Surel", value: session.email },
    { label: "Peran", value: session.role || "Belum punya peran" },
    { label: "Cabang", value: session.branches?.join(", ") ?? "Semua cabang" },
  ]

  return (
    <div className="stack stack-lg">
      <PageHeader title="Profil" subtitle="Nama tampilan dan kata sandi akun Anda." />

      <section className="card row" style={{ gap: 16, minWidth: 0 }}>
        <Avatar radius="xl" size={56} color="dark" variant="filled">
          {session.name.charAt(0).toUpperCase()}
        </Avatar>
        <div className="stack" style={{ gap: 4, minWidth: 0 }}>
          <span className="title">{session.name}</span>
          <span className="caption text-muted">{session.role || "Belum punya peran"}</span>
        </div>
      </section>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <ProfileForm name={session.name} accountRows={accountRows} />
        <PasswordForm isSuperAdmin={session.isSuperAdmin} />
      </div>
    </div>
  )
}
