"use client"

import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Group, Skeleton, Text, Title } from "@mantine/core"
import Link from "next/link"

import { DocumentGroupList } from "@/src/components/data/DocumentGroupList"
import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { ownDocumentsQuery } from "@/src/entities/document/queries"
import { applicationBadge } from "@/src/entities/partner/schema"
import {
  ownPartnersQuery,
  ownPlacementQuery,
  portalProgressQuery,
} from "@/src/entities/portal/queries"
import type { PortalProgress, VisaStatus } from "@/src/entities/portal/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"

import { DepartureChecklist } from "./DepartureChecklist"
import { ServiceTable } from "./ServiceTable"

const JOURNEY_SLOTS = 7
const SERVICE_SLOTS = 6

const PRACTICE_BADGE = {
  Dijadwalkan: "badge-berjalan",
  Selesai: "badge-beres",
  Dibatalkan: "badge-tindakan",
} as const

const VISA_BADGE: Readonly<Record<VisaStatus, string>> = {
  "Belum Diajukan": "badge-terkunci",
  Diajukan: "badge-berjalan",
  "Visa Terbit": "badge-beres",
}

const VISA_DETAILS = [
  { field: "visaAppliedOn", label: "Diajukan", isDate: true },
  { field: "visaInterviewOn", label: "Wawancara", isDate: true },
  { field: "visaIssuedOn", label: "Terbit", isDate: true },
  { field: "visaKind", label: "Jenis Visa", isDate: false },
  { field: "visaValidity", label: "Masa Berlaku", isDate: false },
] as const

const rupiah = (amount: number) => formatMoney(idr(amount))

function Journey({ nodes }: { nodes: PortalProgress["journey"] }) {
  return (
    <section className="card" aria-labelledby="journey-heading">
      <Title order={5} id="journey-heading" mb="lg">
        Garis Perjalanan
      </Title>
      <ol className="journey" aria-label="Tahapan menuju keberangkatan">
        {nodes.map((node, index) => (
          <li key={node.code} className="journey-node" data-state={node.state.toLowerCase()}>
            <span className="journey-dot" aria-hidden>
              {node.state === "Selesai" ? (
                <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} />
              ) : (
                index + 1
              )}
            </span>
            <span className="stack" style={{ gap: 2 }}>
              <span className="body-sm" style={{ fontWeight: 600 }}>
                {node.name}
              </span>
              <span className="caption text-muted">{node.state}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function PartnerCard() {
  const partners = useRead(ownPartnersQuery())

  return (
    <section className="card" aria-labelledby="partners-heading">
      <Group justify="space-between" align="baseline" wrap="nowrap" mb="md">
        <Title order={5} id="partners-heading">
          Proses Partner
        </Title>
        {partners.isSuccess && (
          <Text size="sm" c="dimmed">
            {partners.data.applications.length} pengajuan
          </Text>
        )}
      </Group>

      {partners.isError ? (
        <QueryError message={partners.error.message} onRetry={() => void partners.refetch()} />
      ) : partners.isPending ? (
        <div className="stack stack-sm" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          <Skeleton height={56} radius="md" aria-hidden />
          <Skeleton height={56} radius="md" aria-hidden />
        </div>
      ) : (
        <>
          <div className="stack stack-sm">
            {partners.data.applications.length === 0 && (
              <Text size="sm" c="dimmed">
                Anda belum diajukan ke partner. Admission yang mengajukan setelah syaratnya lengkap.
              </Text>
            )}
            {partners.data.applications.map((application) => (
              <div key={application.id} className="row-soft">
                <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                  <Text size="sm" fw={600}>
                    {application.partner.name}
                    {application.position ? ` — ${application.position}` : ""}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Diajukan {formatDate(application.appliedOn)}
                  </Text>
                </div>
                <span className={`badge whitespace-nowrap ${applicationBadge(application.status)}`}>
                  {application.status}
                </span>
              </div>
            ))}
          </div>

          <Group justify="space-between" align="baseline" wrap="nowrap" mt="lg" mb="md">
            <Title order={6}>Latihan Wawancara</Title>
            <Text size="sm" c="dimmed">
              dijadwalkan Admission
            </Text>
          </Group>

          <div className="stack stack-sm">
            {partners.data.practices.length === 0 && (
              <Text size="sm" c="dimmed">
                Belum ada latihan wawancara yang dijadwalkan.
              </Text>
            )}
            {partners.data.practices.map((practice) => (
              <div key={practice.id} className="row-soft">
                <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                  <Text size="sm" fw={600}>
                    Latihan {practice.round}
                    {practice.partner ? ` — ${practice.partner.name}` : ""}
                    {practice.position ? `, ${practice.position}` : ""}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatDate(practice.date)}
                    {practice.startsAt ? ` - ${practice.startsAt}` : ""}
                    {practice.result ? ` · Hasil: ${practice.result}` : ""}
                  </Text>
                  {practice.evaluation && (
                    <Text size="xs" c="dimmed">
                      {practice.evaluation}
                    </Text>
                  )}
                </div>
                <span className={`badge ${PRACTICE_BADGE[practice.status]}`}>
                  {practice.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function VisaProgress() {
  const placement = useRead(ownPlacementQuery())

  if (placement.isError) {
    return <QueryError message={placement.error.message} onRetry={() => void placement.refetch()} />
  }
  if (placement.isPending) {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">
          Memuat
        </span>
        <Skeleton height={120} radius="md" aria-hidden />
      </div>
    )
  }
  const { visaStatus, values } = placement.data
  return (
    <div className="stack stack-sm">
      <span className={`badge ${VISA_BADGE[visaStatus]}`} style={{ alignSelf: "flex-start" }}>
        {visaStatus}
      </span>
      <dl className="stack stack-sm" style={{ margin: 0 }}>
        {VISA_DETAILS.map(({ field, label, isDate }) => {
          const value = values[field]
          return (
            <div key={field} className="row row-between">
              <dt className="body-sm text-muted">{label}</dt>
              <dd className="body-sm" style={{ margin: 0, fontWeight: 600 }}>
                {value ? (isDate ? formatDate(value) : value) : DASH}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

function VisaCard({ visa }: { visa: PortalProgress["visa"] }) {
  const isOpen = visa.hasVertrag && visa.gate !== null && visa.gate.status !== "Belum Terbuka"

  return (
    <section className="card" aria-labelledby="visa-heading">
      <Title order={5} id="visa-heading" mb="md">
        Proses Visa
      </Title>
      {!visa.gate ? (
        <Text size="sm" c="dimmed">
          Paket Anda tidak memuat layanan Pengajuan Visa.
        </Text>
      ) : isOpen ? (
        <VisaProgress />
      ) : (
        <Notice tone="danger">
          Belum dimulai. Pengajuan visa terbuka setelah{" "}
          {[
            !visa.hasVertrag && "Vertrag terbit",
            visa.gate.status === "Belum Terbuka" &&
              `pembayaran mencapai ${rupiah(visa.gate.thresholdIdr)}, kurang ${rupiah(visa.gate.shortfallIdr)} lagi`,
          ]
            .filter(Boolean)
            .join(" dan ")}
          .
        </Notice>
      )}
    </section>
  )
}

function DocumentsCard() {
  const documents = useRead(ownDocumentsQuery())

  return (
    <section className="card stack" aria-labelledby="documents-heading">
      <Group justify="space-between" align="baseline" wrap="nowrap">
        <Title order={5} id="documents-heading">
          Kelengkapan Berkas
        </Title>
        {documents.isSuccess && (
          <Text size="sm" c="dimmed">
            {documents.data.summary.complete} dari {documents.data.summary.total} lengkap
          </Text>
        )}
      </Group>
      {documents.isError ? (
        <QueryError message={documents.error.message} onRetry={() => void documents.refetch()} />
      ) : documents.isPending ? (
        <div className="stack stack-sm" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          <Skeleton height={120} radius="md" aria-hidden />
        </div>
      ) : (
        <DocumentGroupList groups={documents.data.groups} />
      )}
      <Link className="btn btn-secondary btn-block" href="/portal/documents">
        Buka Dokumen Saya
      </Link>
    </section>
  )
}

export function ProgressSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="40%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </div>
      <div className="card" aria-hidden>
        <Skeleton height={20} width="30%" radius="xl" mb="lg" />
        <Group justify="space-between" wrap="nowrap">
          {Array.from({ length: JOURNEY_SLOTS }, (_, index) => (
            <Skeleton key={index} height={32} circle />
          ))}
        </Group>
      </div>
      <div className="card stack stack-sm" aria-hidden>
        <Skeleton height={20} width="30%" radius="xl" />
        {Array.from({ length: SERVICE_SLOTS }, (_, index) => (
          <Skeleton key={index} height={20} radius="xl" />
        ))}
      </div>
      <div className="grid-2" aria-hidden>
        <Skeleton height={320} radius="md" />
        <Skeleton height={320} radius="md" />
      </div>
    </div>
  )
}

export function ProgressView({ isOnLeave }: { isOnLeave: boolean }) {
  const progress = useRead(portalProgressQuery())

  if (progress.isError) {
    return <QueryError message={progress.error.message} onRetry={() => void progress.refetch()} />
  }
  if (progress.isPending) return <ProgressSkeleton />

  const { journey, services, nextService, showsPartnerSections, visa } = progress.data

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Progres Administrasi"
        subtitle="Pantau status layanan dan proses administrasi Anda menuju keberangkatan ke Jerman."
      />

      <Journey nodes={journey} />

      <section className="card stack" aria-labelledby="services-heading">
        <Title order={5} id="services-heading">
          Detail Layanan
        </Title>
        <ServiceTable services={services} />
        {nextService && (
          <Notice tone="warning">
            Layanan berikutnya ({nextService.name}) terbuka setelah pembayaran mencapai{" "}
            {rupiah(nextService.thresholdIdr)}. Kurang{" "}
            <strong className="text-danger">{rupiah(nextService.shortfallIdr)}</strong> lagi.
          </Notice>
        )}
      </section>

      <div className="grid-2">
        {showsPartnerSections && <PartnerCard />}
        <div className="stack stack-lg">
          {showsPartnerSections && <VisaCard visa={visa} />}
          <DocumentsCard />
          <DepartureChecklist isOnLeave={isOnLeave} />
        </div>
      </div>
    </div>
  )
}
