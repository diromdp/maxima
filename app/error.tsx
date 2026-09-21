"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ErrorScreen } from "@/src/components/layout/ErrorScreen"

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const pathname = usePathname()
  const href = pathname.startsWith("/staff") ? "/staff/dashboard" : "/portal/dashboard"

  return (
    <ErrorScreen
      code="500"
      title="Ada yang tidak beres di sisi kami."
      description="Halaman ini gagal dimuat. Coba lagi sebentar; kalau masih sama, hubungi staf Maxima."
      actions={
        <>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Coba lagi
          </button>
          <Link className="btn btn-secondary" href={href}>
            Kembali ke beranda
          </Link>
        </>
      }
    />
  )
}
