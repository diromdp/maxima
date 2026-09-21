"use client"

import { NumberInput } from "@mantine/core"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { notify } from "@/src/lib/notify"

import { activeClassCount, DEFAULT_KKM, KKM_BY_LEVEL, type Level, LEVELS } from "./sample"

type KkmMap = Readonly<Record<Level, number | null>>

export function KkmStandardsTab({ readOnly }: { readOnly: boolean }) {
  const [saved, setSaved] = useState<KkmMap>(KKM_BY_LEVEL)
  const [draft, setDraft] = useState<KkmMap>(KKM_BY_LEVEL)

  const changed = LEVELS.filter((level) => draft[level] !== saved[level])
  const incomplete = LEVELS.filter((level) => draft[level] === null)
  const canSave = changed.length > 0 && incomplete.length === 0

  const setLevel = (level: Level, value: number | null) =>
    setDraft((current) => ({ ...current, [level]: value }))

  const resetAll = () =>
    setDraft(Object.fromEntries(LEVELS.map((level) => [level, DEFAULT_KKM])) as KkmMap)

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
          {!readOnly && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetAll}>
              Samakan semua ke {DEFAULT_KKM}
            </button>
          )}
        </div>

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
              {LEVELS.map((level) => {
                const value = draft[level]
                const isChanged = value !== saved[level]
                return (
                  <tr key={level}>
                    <td style={{ fontWeight: 600 }}>Deutsch {level}</td>
                    <td className="numeric" style={{ padding: "6px 16px" }}>
                      {readOnly ? (
                        <span className="tabular">{value ?? "-"}</span>
                      ) : (
                        <span className="relative inline-block">
                          <NumberInput
                            aria-label={`KKM ${level}`}
                            size="xs"
                            w={96}
                            min={0}
                            max={100}
                            clampBehavior="strict"
                            allowDecimal={false}
                            hideControls
                            value={value ?? ""}
                            onChange={(next) => setLevel(level, next === "" ? null : Number(next))}
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
                    <td className="numeric text-muted">{activeClassCount(level)}</td>
                    <td className="wrap text-muted">
                      {value === null
                        ? "KKM belum diisi"
                        : value === saved[level]
                          ? "Berlaku"
                          : `Berubah dari ${saved[level] ?? "-"} ke ${value}, belum disimpan`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <Notice tone="info">
          KKM berlaku untuk nilai Kapitel dan ujian internal pada level itu. Mengubahnya tidak
          menghitung ulang raport yang sudah terbit; nilai yang sudah tercetak tetap memakai KKM
          saat raport dibuat. Perubahan masuk log.
        </Notice>
      </section>

      {!readOnly && (
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
            onClick={() => {
              setSaved(draft)
              notify.success("Standar KKM tersimpan.")
            }}
          >
            Simpan Standar KKM
          </button>
        </div>
      )}
    </div>
  )
}
