import Link from "next/link"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"

import { COMPANIONS, NOT_CHANGEABLE_HERE } from "../profile"
import { ChangeRequestForm } from "./ChangeRequestForm"

const STEPS = [
  "Ketik ulang data yang ingin diubah, lalu kirim beserta alasannya.",
  "Marketing atau Admission memeriksa, tergantung datanya. Data resmi butuh berkas pendukung.",
  "Kalau disetujui, Profil ikut berubah dan tercatat di log aktivitas.",
] as const

export default async function ChangeRequestPage() {
  await requireSession("student")

  const consultant = COMPANIONS[0].value

  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm">
        <nav aria-label="Remah" className="caption text-muted">
          <Link href="/portal/profile" className="text-muted" style={{ textDecoration: "none" }}>
            Profil
          </Link>{" "}
          / Ajukan perubahan
        </nav>

        <PageHeader
          title="Ajukan Perubahan Data"
          subtitle="Ketik ulang data yang ingin diubah, sisanya biarkan. Data hanya berubah setelah cabang menyetujuinya."
        />
      </div>

      <div className="grid-main-aside">
        <ChangeRequestForm />

        <div className="stack stack-lg" style={{ alignSelf: "start" }}>
          <section className="card stack">
            <div className="section-head">
              <h2 className="h5">Cara kerjanya</h2>
            </div>
            <ol className="stack" style={{ margin: 0, paddingInlineStart: 20 }}>
              {STEPS.map((step) => (
                <li key={step} className="body-sm">
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="card stack">
            <div className="section-head">
              <h2 className="h5">Tidak bisa diajukan dari sini</h2>
            </div>
            <ul className="stack stack-sm" style={{ margin: 0, paddingInlineStart: 20 }}>
              {NOT_CHANGEABLE_HERE.map((item) => (
                <li key={item} className="body-sm">
                  {item}
                </li>
              ))}
            </ul>
            <p className="body-sm text-muted">
              Ketiganya milik Finance dan Marketing. Bicarakan dengan PIC Anda, {consultant}.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
