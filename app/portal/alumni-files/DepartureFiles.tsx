"use client"

import { Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Group, Text, Title } from "@mantine/core"
import Link from "next/link"

import type { DepartureFile } from "@/src/entities/placement/schema"
import { previewPresigned } from "@/src/lib/api/download"

export function DepartureFiles({ files }: { files: readonly DepartureFile[] }) {
  return (
    <section className="card stack stack-lg" aria-labelledby="departure-files-heading">
      <Group justify="space-between" align="baseline" wrap="nowrap">
        <div className="stack" style={{ gap: 2 }}>
          <Title order={5} id="departure-files-heading">
            Berkas Keberangkatan
          </Title>
          <Text size="sm" c="dimmed">
            Diunggah Admission, Anda tinggal mengunduh.
          </Text>
        </div>
        <Link className="link" href="/portal/documents#dari-betrieb">
          Lihat di Dokumen Saya
        </Link>
      </Group>

      <ul className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {files.map((file) => {
          const stored = file.documents.filter((document) => document.objectKey)
          return (
            <li
              key={file.label}
              className="row row-between row-wrap"
              style={{ gap: 12, paddingBlock: 8 }}
            >
              <span className="body-sm">{file.label}</span>
              {stored.length === 0 ? (
                <span className="badge badge-terkunci">Belum ada</span>
              ) : (
                <div className="row row-wrap" style={{ gap: 8, justifyContent: "flex-end" }}>
                  {stored.map((document) => (
                    <button
                      key={document.code}
                      type="button"
                      className="link row"
                      style={{
                        fontSize: 14,
                        gap: 4,
                        background: "none",
                        border: 0,
                        padding: 0,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        void previewPresigned("/downloads/presign", { key: document.objectKey })
                      }
                    >
                      <HugeiconsIcon icon={Download04Icon} size={14} strokeWidth={1.5} />
                      {document.originalName ?? document.name}
                    </button>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
