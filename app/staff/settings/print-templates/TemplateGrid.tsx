"use client"

import { Skeleton } from "@mantine/core"

import { QueryError } from "@/src/components/data/QueryError"
import { previewHref, printTemplatesQuery } from "@/src/entities/print-template/queries"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"

export const TEMPLATE_COUNT = 4
const PAPER_LINES = 5

export function TemplateGrid() {
  const templates = useRead(printTemplatesQuery())

  if (templates.isError) {
    return <QueryError message={templates.error.message} onRetry={() => void templates.refetch()} />
  }

  if (templates.isPending) return <TemplateGridSkeleton />

  return (
    <div className="grid-3">
      {templates.data.data.map((template) => (
        <article key={template.code} className="card stack">
          <Paper title={template.name} />

          <div className="stack" style={{ gap: 2 }}>
            <h2 className="h6">{template.name}</h2>
            <span className="caption text-muted">{template.fileName}</span>
            <span className="caption text-faint">Diubah {formatDate(template.updatedOn)}</span>
          </div>

          <a
            className="btn btn-secondary btn-sm"
            href={previewHref(template.code)}
            target="_blank"
            rel="noopener"
          >
            Preview
          </a>
        </article>
      ))}
    </div>
  )
}

export function TemplateGridSkeleton() {
  return (
    <div className="grid-3" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      {Array.from({ length: TEMPLATE_COUNT }, (_, index) => (
        <Skeleton key={index} height={320} radius="md" aria-hidden />
      ))}
    </div>
  )
}

function Paper({ title }: { title: string }) {
  return (
    <div
      className="card-soft row"
      style={{
        justifyContent: "center",
        aspectRatio: "16 / 10",
        border: "1px dashed var(--color-hairline)",
        padding: 16,
      }}
      aria-hidden
    >
      <div
        className="stack"
        style={{
          gap: 6,
          width: "56%",
          height: "100%",
          padding: 12,
          background: "var(--color-canvas)",
          border: "1px solid var(--color-hairline-soft)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <span className="caption text-faint" style={{ fontSize: 8, letterSpacing: 1 }}>
          MAXIMA STIFTUNG
        </span>
        <span className="text-ink" style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.2 }}>
          {title}
        </span>
        {Array.from({ length: PAPER_LINES }, (_, line) => (
          <span
            key={line}
            style={{
              height: 4,
              width: `${90 - ((line * 23) % 40)}%`,
              background: "var(--color-hairline)",
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
