"use client"

import { Skeleton, Switch } from "@mantine/core"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { setPaymentGatewayEnabled } from "@/src/entities/settings/actions"
import { systemSettingsQuery } from "@/src/entities/settings/queries"
import { useRead } from "@/src/lib/api/use-read"
import { notify } from "@/src/lib/notify"

export function PaymentGatewaySetting({ canEdit }: { canEdit: boolean }) {
  const settings = useRead(systemSettingsQuery())
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  if (settings.isError) {
    return <QueryError message={settings.error.message} onRetry={() => void settings.refetch()} />
  }

  if (settings.isPending) return <PaymentGatewaySettingSkeleton />

  const isEnabled = settings.data.paymentGatewayEnabled

  async function toggle(enabled: boolean) {
    setIsSaving(true)
    const result = await setPaymentGatewayEnabled(enabled)
    if (result.ok) {
      queryClient.setQueryData(systemSettingsQuery().queryKey, result.data)
      notify.success(enabled ? "Payment Gateway diaktifkan." : "Payment Gateway dinonaktifkan.")
    } else {
      notify.error(result.message)
    }
    setIsSaving(false)
  }

  return (
    <section className="card stack">
      <div className="row row-between" style={{ gap: 16, alignItems: "flex-start" }}>
        <div className="stack stack-sm">
          <h2 className="h6">Pembayaran online siswa</h2>
          <span className="body-sm text-muted">
            {isEnabled
              ? "Aktif. Siswa dapat memilih Payment Gateway atau Transfer Bank saat membayar."
              : "Nonaktif. Siswa hanya dapat membayar lewat Transfer Bank ke rekening di Master Data."}
          </span>
        </div>

        {canEdit ? (
          <Switch
            aria-label="Payment Gateway aktif"
            checked={isEnabled}
            disabled={isSaving}
            onChange={(event) => void toggle(event.currentTarget.checked)}
          />
        ) : (
          <span className="body-sm">{isEnabled ? "Aktif" : "Nonaktif"}</span>
        )}
      </div>

      <span className="caption text-muted">
        Pembayaran online yang sudah dibuka siswa sebelum dinonaktifkan tetap tercatat otomatis
        begitu dibayar. Setiap perubahan tercatat di Log Aktivitas.
      </span>
    </section>
  )
}

export function PaymentGatewaySettingSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <Skeleton height={140} radius="md" aria-hidden />
    </div>
  )
}
