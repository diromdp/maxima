import Image from "next/image"

const SRC = "/logo.webp"
const ALT = "Maxima Stiftung"

export function Logo({
  height = 40,
  priority = false,
  className,
}: {
  height?: number
  priority?: boolean
  className?: string
}) {
  return (
    <span style={{ display: "block", lineHeight: 0, flexShrink: 0 }}>
      <Image
        className={className}
        src={SRC}
        alt={ALT}
        width={1595}
        height={701}
        priority={priority}
        style={{ display: "block", height, width: "auto" }}
      />
    </span>
  )
}
