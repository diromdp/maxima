import {
  APPLICATION_STATUSES,
  applicationBadge,
  statusNumber,
  type ApplicationStatus,
} from "@/src/entities/partner/schema"

export const STATUS_OPTIONS = APPLICATION_STATUSES.map((status) => ({
  value: status,
  label: status,
}))

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`badge whitespace-nowrap ${applicationBadge(status)}`}>
      {statusNumber(status)}. {status}
    </span>
  )
}
