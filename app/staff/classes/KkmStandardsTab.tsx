"use client"

import { NumberInput, Skeleton } from "@mantine/core"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import { saveKkmStandards } from "@/src/entities/class/actions"
import { kkmStandardsQuery } from "@/src/entities/class/queries"
import type { KkmRow } from "@/src/entities/class/schema"
import { useRead } from "@/src/lib/api/use-read"
import { notify } from "@/src/lib/notify"

const DEFAULT_KKM = 80
const SKELETON_LEVELS = 5

type KkmDraft = Readonly<Record<string, number | null>>

const draftOf = (rows: readonly KkmRow[]): KkmDraft =>
  Object.fromEntries(rows.map((row) => [row.levelId, row.kkm]))

export function KkmStandardsTab({ readOnly }: { readOnly: boolean }) {
  const standards = useRead(kkmStandardsQuery())

  if (standards.isError) {
    return <QueryError message={standards.error.message} onRetry={() => void standards.refetch()} />
  }
  if (standards.isPending) {
    return (
      <section className="card stack" aria-busy="true">
        <span className="sr-only" role="status">
          Memuat
        </span>
        <Skeleton height={40} width="40%" radius="xl" aria-hidden />
        {Array.from({ length: SKELETON_LEVELS }, (_, index) => (
          <Skeleton key={index} height={44} radius="sm" aria-hidden />
        ))}
      </section>
    )
  }

  const rows = standards.data.data
  return (
    <KkmStandardsForm
      key={rows.map((row) => `${row.levelId}:${row.kkm}`).join()}
      rows={rows}
      readOnly={readOnly}
    />
  )
}

function KkmStandardsForm({ rows, readOnly }: { rows: readonly KkmRow[]; readOnly: boolean }) {
  const queryClient = useQueryClient()
  const saved = draftOf(rows)
  const [draft, setDraft] = useState<KkmDraft>(saved)
  const save = useMutation({ mutationFn: saveKkmStandards })

  const changed = rows.filter((row) => draft[row.levelId] !== saved[row.levelId])
  const incomplete = rows.filter((row) => draft[row.levelId] === null)
  const canSave = changed.length > 0 && incomplete.length === 0 && !save.isPending

  const setLevel = (levelId: string, value: number | null) =>
    setDraft((current) => ({ ...current, [levelId]: value }))

  const resetAll = () => setDraft(Object.fromEntries(rows.map((row) => [row.levelId, DEFAULT_KKM])))

  async function submit() {
    const values = Object.fromEntries(
      rows.map((row) => [row.levelId, draft[row.levelId] ?? DEFAULT_KKM]),
    )
    const result = await save.mutateAsync(values)
    if (!result.ok) return notify.error(result.message)
    notify.success("Standar KKM tersimpan.")
    await queryClient.invalidateQueries({ queryKey: ["kkm-standards"] })
  }

  return (
    <div className="stack">
      <section className="card stack">
        <div className="row row-between row-wrap">
          <div className="stack" style={{ gap: 2 }}>
            <h2 className="h5">Standar KKM per Level</h2>
            <span className="caption text-muted">
              Nilai minimum kelulusan yang dipakai Penilaian, Raport, dan portal siswa.
            </span>
          </div>
          {!readOnly && rows.length > 0 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetAll}>
              Samakan semua ke {DEFAULT_KKM}
            </button>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="body-sm text-muted">
            Belum ada level aktif. Tambahkan level di Master Data halaman Pengaturan.
          </p>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th style={{ textAlign: "right" }}>KKM</th>
                  <th style={{ textAlign: "right" }}>Kelas Aktif</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const value = draft[row.levelId] ?? null
                  const before = saved[row.levelId] ?? null
                  const isChanged = value !== before
                  return (
                    <tr key={row.levelId}>
                      <td style={{ fontWeight: 600 }}>Deutsch {row.levelName}</td>
                      <td className="numeric" style={{ padding: "6px 16px" }}>
                        {readOnly ? (
                          <span className="tabular">{value ?? "-"}</span>
                        ) : (
                          <span className="relative inline-block">
                            <NumberInput
                              aria-label={`KKM ${row.levelName}`}
                              size="xs"
                              w={96}
                              min={0}
                              max={100}
                              clampBehavior="strict"
                              allowDecimal={false}
                              hideControls
                              value={value ?? ""}
                              onChange={(next) =>
                                setLevel(row.levelId, next === "" ? null : Number(next))
                              }
                              styles={{ input: { textAlign: "right" } }}
                            />
                            {isChanged && (
                              <span
                                aria-hidden
                                className="bg-warning-solid absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full"
                              />
                            )}
                          </span>
                        )}
                      </td>
                      <td className="numeric text-muted">{row.activeClasses}</td>
                      <td className="wrap text-muted">
                        {value === null
                          ? "KKM belum diisi"
                          : !isChanged
                            ? "Berlaku"
                            : `Berubah dari ${before ?? "-"} ke ${value}, belum disimpan`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Notice tone="info">
          KKM berlaku untuk nilai Kapitel dan ujian internal pada level itu. Mengubahnya tidak
          menghitung ulang raport yang sudah terbit; nilai yang sudah tercetak tetap memakai KKM
          saat raport dibuat. Perubahan masuk log.
        </Notice>
      </section>

      {!readOnly && rows.length > 0 && (
        <div className="row row-wrap" style={{ justifyContent: "flex-end", gap: 12 }}>
          <span className={`caption ${changed.length > 0 ? "text-warning" : "text-muted"}`}>
            {incomplete.length > 0
              ? `${incomplete.length} level belum punya KKM`
              : changed.length > 0
                ? `${changed.length} level berubah, belum disimpan`
                : "Tidak ada perubahan"}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canSave}
            title={
              incomplete.length > 0
                ? "Isi KKM semua level dulu"
                : changed.length === 0
                  ? "Belum ada yang berubah"
                  : undefined
            }
            onClick={() => void submit()}
          >
            {save.isPending ? "Menyimpan..." : "Simpan Standar KKM"}
          </button>
        </div>
      )}
    </div>
  )
}
