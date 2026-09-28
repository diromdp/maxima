import dayjs from "dayjs"
import "dayjs/locale/id"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("id")

const WIB = "Asia/Jakarta"

const wib = (value: string | Date) => dayjs(value).tz(WIB)

export const formatDate = (value: string | Date): string => wib(value).format("DD MMM YYYY")

export const formatDateLong = (value: string | Date): string => wib(value).format("DD MMMM YYYY")

export const formatMonthYear = (value: string | Date): string => wib(value).format("MMM YYYY")

export const formatDateTime = (value: string | Date): string =>
  `${wib(value).format("DD MMM YYYY")} · ${wib(value).format("HH.mm")} WIB`

export const formatDateRange = (from: string | Date, to: string | Date): string =>
  `${formatDate(from)} — ${formatDate(to)}`

export const daysOverdue = (due: string | Date): number =>
  wib(new Date()).startOf("day").diff(wib(due).startOf("day"), "day")

export const formatPercent = (ratio: number): string => `${Math.round(ratio * 100)}%`

export const DASH = "—"

export const formatFileSize = (bytes: number): string =>
  bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
