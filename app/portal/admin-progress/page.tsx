import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Box, Group, Stack, Text, Title } from "@mantine/core"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"
import { formatDate, formatDateTime } from "@/src/lib/format"
import { formatMoney, shortfall } from "@/src/lib/money"
import { Notice } from "@/src/components/ui/Notice"

import { DepartureChecklist } from "./DepartureChecklist"
import { ServiceTable } from "./ServiceTable"
import {
  INTERVIEWS,
  JOURNEY,
  NEXT_GATE,
  PAID_IDR,
  PARTNERS,
  PLACEMENT_STARTED,
  VISA_GATE,
} from "./data"

const NODE_STATE_LABEL = {
  selesai: "Selesai",
  dikerjakan: "Dikerjakan",
  menunggu: "Menunggu",
} as const

export default async function AdminProgressPage() {
  await requireSession("student")

  const gateShortfall = shortfall(NEXT_GATE.threshold, PAID_IDR)

  return (
    <Stack gap="lg">
      <PageHeader
        title="Progres Administrasi"
        subtitle="Pantau status layanan dan proses administrasi Anda menuju keberangkatan ke Jerman."
      />

      <section className="card" aria-labelledby="journey-heading">
        <Title order={5} id="journey-heading" mb="lg">
          Garis Perjalanan
        </Title>

        <ol className="journey" aria-label="Tahapan menuju keberangkatan">
          {JOURNEY.map((node, i) => (
            <li key={node.label} className="journey-node" data-state={node.state}>
              <span className="journey-dot" aria-hidden>
                {node.state === "selesai" ? (
                  <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} />
                ) : (
                  i + 1
                )}
              </span>
              <span className="stack" style={{ gap: 2 }}>
                <span className="body-sm" style={{ fontWeight: 600 }}>
                  {node.label}
                </span>
                <span className="caption text-muted">{NODE_STATE_LABEL[node.state]}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card" aria-labelledby="services-heading">
        <Title order={5} id="services-heading" mb="md">
          Detail Layanan
        </Title>

        <ServiceTable />

        <Notice tone="warning" className="mt-4">
          Layanan berikutnya ({NEXT_GATE.service}) terbuka setelah pembayaran mencapai{" "}
          {formatMoney(NEXT_GATE.threshold)}. Kurang{" "}
          <strong className="text-danger">{formatMoney(gateShortfall)}</strong> lagi.
        </Notice>
      </section>

      <div className="grid-2">
        {PLACEMENT_STARTED && (
          <Stack gap="lg">
            <section className="card" aria-labelledby="partners-heading">
              <Group justify="space-between" align="baseline" wrap="nowrap" mb="md">
                <Title order={5} id="partners-heading">
                  Proses Partner
                </Title>
                <Text size="sm" c="dimmed">
                  {PARTNERS.length} pengajuan
                </Text>
              </Group>

              <Stack gap="sm">
                {PARTNERS.map((p) => (
                  <Box key={`${p.partner}-${p.position}`} className="row-soft">
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600}>
                        {p.partner} — {p.position}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Diajukan {formatDate(p.submittedAt)} · {p.latest}
                      </Text>
                    </Stack>
                    <span className="badge badge-berjalan">{p.status}</span>
                  </Box>
                ))}
              </Stack>

              <Group justify="space-between" align="baseline" wrap="nowrap" mt="lg" mb="md">
                <Title order={6}>Latihan Wawancara</Title>
                <Text size="sm" c="dimmed">
                  dijadwalkan Admission
                </Text>
              </Group>

              <Stack gap="sm">
                {INTERVIEWS.map((s) => (
                  <Box key={s.at} className="row-soft">
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600}>
                        {s.title}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {formatDateTime(s.at)}
                      </Text>
                    </Stack>
                    <span
                      className={`badge ${s.status === "Selesai" ? "badge-beres" : "badge-berjalan"}`}
                    >
                      {s.status}
                    </span>
                  </Box>
                ))}
              </Stack>
            </section>
          </Stack>
        )}

        <Stack gap="lg">
          {PLACEMENT_STARTED && (
            <section className="card" aria-labelledby="visa-heading">
              <Title order={5} id="visa-heading" mb="md">
                Proses Visa
              </Title>
              {!VISA_GATE.contractIssued && (
                <Notice tone="danger">
                  Belum dimulai. Pengajuan visa terbuka setelah Vertrag terbit dan pembayaran
                  mencapai {formatMoney(VISA_GATE.threshold)}.
                </Notice>
              )}
            </section>
          )}

          <DepartureChecklist />
        </Stack>
      </div>
    </Stack>
  )
}
