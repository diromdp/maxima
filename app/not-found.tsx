import type { Metadata } from "next"
import Link from "next/link"

import { ErrorScreen } from "@/src/components/layout/ErrorScreen"
import { getSession } from "@/src/lib/auth/session"
import { homePath, STUDENT_LOGIN } from "@/src/lib/auth/tokens"

export const metadata: Metadata = { title: "Halaman tidak ditemukan · Maxima Stiftung" }

export default async function NotFoundPage() {
  const session = await getSession()
  const href = session ? homePath(session.kind) : STUDENT_LOGIN

  return (
    <ErrorScreen
      code="404"
      title="Halaman tidak ditemukan."
      description="Alamatnya salah ketik, atau halamannya sudah dipindahkan. Kembali ke beranda dan mulai lagi dari sana."
      actions={
        <Link className="btn btn-primary" href={href}>
          Kembali ke beranda
        </Link>
      }
    />
  )
}
