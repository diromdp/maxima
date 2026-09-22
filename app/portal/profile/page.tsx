import Link from "next/link"
import { Avatar } from "@mantine/core"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"

import { ChangePasswordModal } from "./ChangePasswordModal"
import { STUDENT as DASHBOARD_STUDENT, deriveIdentity } from "../dashboard/dashboard"
import { COMPANIONS, CONTACT, EDUCATION, PERSONAL, STUDENT, type ProfileSection } from "./profile"

function SpecRows({ rows }: { rows: readonly { label: string; value: string }[] }) {
  return (
    <dl style={{ margin: 0 }}>
      {rows.map(({ label, value }) => (
        <div key={label} className="spec-row">
          <dt className="spec-name">{label}</dt>
          <dd className="body-sm" style={{ margin: 0, fontWeight: 600 }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function SectionCard({ section }: { section: ProfileSection }) {
  return (
    <section className="card stack stack-sm" aria-labelledby={`${section.id}-heading`}>
      <h2 className="h5" id={`${section.id}-heading`}>
        {section.title}
      </h2>
      <SpecRows rows={section.fields} />
    </section>
  )
}

export default async function ProfilePage() {
  await requireSession("student")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Profil"
        subtitle="Data diri tidak bisa diubah sendiri. Ajukan perubahannya, cabang yang menyetujui."
      />

      <section className="card row row-between row-wrap" style={{ gap: 16 }}>
        <div className="row" style={{ gap: 16, minWidth: 0 }}>
          <Avatar radius="xl" size={56} color="dark" variant="filled">
            {STUDENT.fullName.charAt(0)}
          </Avatar>
          <div className="stack" style={{ gap: 6, minWidth: 0 }}>
            <span className="title">{STUDENT.fullName}</span>
            <span className="caption text-muted">{deriveIdentity(DASHBOARD_STUDENT)}</span>
            <span className="badge badge-beres" style={{ alignSelf: "flex-start" }}>
              {STUDENT.status}
            </span>
          </div>
        </div>
        <Link className="btn btn-secondary" href="/portal/profile/change-request">
          Ajukan Perubahan Data
        </Link>
      </section>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="stack stack-lg">
          <SectionCard section={PERSONAL} />
          <SectionCard section={EDUCATION} />
        </div>

        <div className="stack stack-lg">
          <SectionCard section={CONTACT} />

          <section className="card stack stack-sm" aria-labelledby="companions-heading">
            <h2 className="h5" id="companions-heading">
              Pendamping Anda
            </h2>
            <SpecRows rows={COMPANIONS} />
          </section>

          <section className="card stack" aria-labelledby="security-heading">
            <div className="stack" style={{ gap: 2 }}>
              <h2 className="h5" id="security-heading">
                Keamanan
              </h2>
              <span className="caption text-muted">
                Kata sandi satu-satunya yang bisa Anda ubah langsung.
              </span>
            </div>
            <div className="row">
              <ChangePasswordModal />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
