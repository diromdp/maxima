import {
  Alert02Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  SquareLock02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export type NoticeTone = "info" | "success" | "warning" | "danger" | "neutral"

const ICON: Readonly<Record<NoticeTone, typeof InformationCircleIcon>> = {
  info: InformationCircleIcon,
  success: CheckmarkCircle02Icon,
  warning: Alert02Icon,
  danger: AlertCircleIcon,
  neutral: SquareLock02Icon,
}

export function Notice({
  tone = "info",
  title,
  actions,
  className,
  children,
}: {
  tone?: NoticeTone
  title?: string
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`notice notice-${tone}${className ? ` ${className}` : ""}`}
      role={tone === "danger" ? "alert" : "status"}
    >
      <span className="notice-icon" aria-hidden>
        <HugeiconsIcon icon={ICON[tone]} size={18} strokeWidth={1.5} />
      </span>
      <div className="notice-body">
        {title && <span className="notice-title">{title}</span>}
        <div>{children}</div>
      </div>
      {actions && <div className="notice-actions">{actions}</div>}
    </div>
  )
}
