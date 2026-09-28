"use client"

import { Avatar } from "@mantine/core"
import Link from "next/link"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { portalProfileQuery } from "@/src/entities/portal/queries"
import {
  CHANGE_REQUEST_TONE,
  identitySpecOf,
  type OwnChangeRequest,
  PORTAL_STATUS_TONE,
  type PortalProfile,
  type PortalStatus,
} from "@/src/entities/portal/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"

import { ChangePasswordModal } from "./ChangePasswordModal"
import { ON_LEAVE_BLOCK, profileSectionsOf, type ProfileSection } from "./profile"
import { ProfileSkeleton } from "./ProfileSkeleton"

const PAGE_SUBTITLE =
  "Data diri tidak bisa diubah sendiri. Ajukan perubahannya, cabang yang menyetujui."

type HeadProps = { status: PortalStatus; packageName: string | null }

function SectionCard({ section }: { section: ProfileSection }) {
  return (
    <section className="card stack stack-sm" aria-labelledby={`${section.id}-heading`}>
      <h2 className="h5" id={`${section.id}-heading`}>
        {section.title}
      </h2>
      <dl style={{ margin: 0 }}>
        {section.rows.map(({ label, value }) => (
          <div key={label} className="spec-row">
            <dt className="spec-name">{label}</dt>
            <dd className="body-sm" style={{ margin: 0, fontWeight: 600 }}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function ChangeRequestButton({ isOnLeave }: { isOnLeave: boolean }) {
  if (!isOnLeave) {
    return (
      <Link className="btn btn-secondary" href="/portal/profile/change-request">
        Ajukan Perubahan Data
      </Link>
    )
  }
  return (
    <div className="stack" style={{ gap: 4, alignItems: "flex-end" }}>
      <button type="button" className="btn btn-secondary" disabled>
        Ajukan Perubahan Data
      </button>
      <span className="caption text-muted" style={{ maxWidth: 320, textAlign: "right" }}>
        {ON_LEAVE_BLOCK}
      </span>
    </div>
  )
}

function ProfileHead({ profile, status, packageName }: HeadProps & { profile: PortalProfile }) {
  const numbers = [
    profile.nis ? `NIS ${profile.nis}` : "NIS terbit setelah DP disahkan",
    profile.contractNumber && `Kontrak ${profile.contractNumber}`,
  ].filter(Boolean)

  return (
    <section className="card row row-between row-wrap" style={{ gap: 16 }}>
      <div className="row" style={{ gap: 16, minWidth: 0 }}>
        <Avatar radius="xl" size={56} color="dark" variant="filled">
          {profile.identity.fullName?.charAt(0)}
        </Avatar>
        <div className="stack" style={{ gap: 6, minWidth: 0 }}>
          <span className="title">{profile.identity.fullName}</span>
          <span className="caption text-muted">{numbers.join(" · ")}</span>
          <div className="row row-wrap" style={{ gap: 8 }}>
            <span className={`badge badge-${PORTAL_STATUS_TONE[status]}`}>{status}</span>
            {packageName && <span className="badge badge-terbuka">Paket {packageName}</span>}
          </div>
        </div>
      </div>
      <ChangeRequestButton isOnLeave={status === "Cuti"} />
    </section>
  )
}

function ChangeRequests({ requests }: { requests: readonly OwnChangeRequest[] }) {
  if (requests.length === 0) return null

  return (
    <section className="card stack" aria-labelledby="change-requests-heading">
      <div className="section-head">
        <h2 className="h5" id="change-requests-heading">
          Pengajuan Perubahan
        </h2>
        <span className="caption text-muted">{requests.length} pengajuan</span>
      </div>
      <ul className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {requests.map((request) => (
          <li key={request.id} className="stack stack-sm">
            <div className="row row-between row-wrap" style={{ gap: 8 }}>
              <span className="body-sm" style={{ fontWeight: 600 }}>
                {identitySpecOf(request.field).label}
              </span>
              <span className={`badge badge-${CHANGE_REQUEST_TONE[request.status]}`}>
                {request.status}
              </span>
            </div>
            <dl className="grid-3" style={{ margin: 0 }}>
              <div className="stack" style={{ gap: 2 }}>
                <dt className="spec-name">Nilai Baru</dt>
                <dd className="body-sm" style={{ margin: 0 }}>
                  {request.proposedValue}
                </dd>
              </div>
              <div className="stack" style={{ gap: 2 }}>
                <dt className="spec-name">Alasan</dt>
                <dd className="body-sm" style={{ margin: 0 }}>
                  {request.reason ?? "-"}
                </dd>
              </div>
              <div className="stack" style={{ gap: 2 }}>
                <dt className="spec-name">Diajukan</dt>
                <dd className="body-sm" style={{ margin: 0 }}>
                  {formatDate(request.createdAt)}
                  {request.decidedAt && ` · diputuskan ${formatDate(request.decidedAt)}`}
                </dd>
              </div>
            </dl>
            {request.status === "Ditolak" && request.decisionReason && (
              <span className="body-sm text-tindakan">
                Alasan penolakan: {request.decisionReason}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProfileBody({ profile, ...head }: HeadProps & { profile: PortalProfile }) {
  const sections = profileSectionsOf(profile)

  return (
    <>
      <ProfileHead profile={profile} {...head} />

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="stack stack-lg">
          <SectionCard section={sections.personal} />
          <SectionCard section={sections.education} />
        </div>

        <div className="stack stack-lg">
          <SectionCard section={sections.contact} />
          <SectionCard section={sections.companions} />

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

      <ChangeRequests requests={profile.changeRequests} />
    </>
  )
}

export function ProfileView(head: HeadProps) {
  const profile = useRead(portalProfileQuery())

  return (
    <div className="stack stack-lg">
      <PageHeader title="Profil" subtitle={PAGE_SUBTITLE} />

      {profile.isError ? (
        <QueryError message={profile.error.message} onRetry={() => void profile.refetch()} />
      ) : profile.isPending ? (
        <ProfileSkeleton />
      ) : (
        <ProfileBody profile={profile.data} {...head} />
      )}
    </div>
  )
}
