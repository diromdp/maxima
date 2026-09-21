import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { notifications } from "@mantine/notifications"

type Tone = "success" | "error" | "info"

const TONES: Readonly<
  Record<Tone, { title: string; icon: typeof CheckmarkCircle02Icon; autoClose: number }>
> = {
  success: { title: "Berhasil", icon: CheckmarkCircle02Icon, autoClose: 4000 },
  error: { title: "Gagal", icon: AlertCircleIcon, autoClose: 7000 },
  info: { title: "Info", icon: InformationCircleIcon, autoClose: 4000 },
}

function show(tone: Tone, message: string, title?: string) {
  const t = TONES[tone]
  notifications.show({
    className: `toast toast-${tone}`,
    title: title ?? t.title,
    message,
    icon: <HugeiconsIcon icon={t.icon} size={18} strokeWidth={1.5} />,
    autoClose: t.autoClose,
  })
}

export const notify = {
  success: (message: string, title?: string) => show("success", message, title),
  error: (message: string, title?: string) => show("error", message, title),
  info: (message: string, title?: string) => show("info", message, title),
}
