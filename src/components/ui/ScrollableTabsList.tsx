"use client"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ActionIcon, ScrollArea, Tabs } from "@mantine/core"
import { useCallback, useEffect, useRef, useState } from "react"

const SCROLL_STEP = 240

export function ScrollableTabsList({ children }: { children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [edges, setEdges] = useState({ isAtStart: true, isAtEnd: true })

  const updateEdges = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    setEdges({
      isAtStart: viewport.scrollLeft <= 0,
      isAtEnd: viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1,
    })
  }, [])

  const attachViewport = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node
      node
        ?.querySelector('[aria-selected="true"]')
        ?.scrollIntoView({ block: "nearest", inline: "nearest" })
      updateEdges()
    },
    [updateEdges],
  )

  useEffect(() => {
    window.addEventListener("resize", updateEdges)
    return () => window.removeEventListener("resize", updateEdges)
  }, [updateEdges])

  const scrollBy = (direction: -1 | 1) =>
    viewportRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" })

  const hasOverflow = !(edges.isAtStart && edges.isAtEnd)

  return (
    <div
      className="row"
      style={{ gap: 4, flexWrap: "nowrap", marginBottom: "var(--mantine-spacing-lg)" }}
    >
      {hasOverflow && (
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Geser tab ke kiri"
          disabled={edges.isAtStart}
          onClick={() => scrollBy(-1)}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
        </ActionIcon>
      )}
      <ScrollArea
        type="hover"
        scrollbars="x"
        scrollbarSize={6}
        offsetScrollbars="x"
        viewportRef={attachViewport}
        onScrollPositionChange={updateEdges}
        style={{ flex: 1, minWidth: 0 }}
      >
        <Tabs.List style={{ flexWrap: "nowrap", width: "max-content", minWidth: "100%" }}>
          {children}
        </Tabs.List>
      </ScrollArea>
      {hasOverflow && (
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Geser tab ke kanan"
          disabled={edges.isAtEnd}
          onClick={() => scrollBy(1)}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
        </ActionIcon>
      )}
    </div>
  )
}
