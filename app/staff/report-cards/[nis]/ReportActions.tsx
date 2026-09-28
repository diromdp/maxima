"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

import { sendReportCard } from "@/src/entities/report-card/actions"
import type { ReportCardDetail } from "@/src/entities/report-card/schema"
import { openRenderedFile } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { notify } from "@/src/lib/notify"

const PRINT_BLOCKED =
  "Raport dicetak dari berkas terbitnya. Terbitkan raport ini dulu dari antrian penerbitan."

export function ReportActions({ report, canEdit }: { report: ReportCardDetail; canEdit: boolean }) {
  const queryClient = useQueryClient()
  const send = useMutation({ mutationFn: sendReportCard })
  const { issued, header } = report

  const blockedReason = !canEdit
    ? "Peran Anda hanya dapat melihat raport."
    : !issued
      ? "Terbitkan raport ini dulu dari antrian penerbitan."
      : issued.sentAt
        ? "Raport ini sudah dikirim ke siswa."
        : undefined

  async function print() {
    if (!issued) return
    try {
      await openRenderedFile(`/report-cards/${issued.id}/pdf`)
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
      notify.error(error.message)
    }
  }

  async function submit() {
    if (!issued) return
    const result = await send.mutateAsync(issued.id)
    if (!result.ok) return notify.error(result.message)
    notify.success(`Raport dikirim ke halaman Pembelajaran ${header.name}.`)
    await queryClient.invalidateQueries({ queryKey: ["report-card"] })
  }

  return (
    <>
      <Link
        className="btn btn-secondary btn-sm"
        href={`/staff/assessments?tab=notes&period=${header.period.id}`}
      >
        Edit Catatan
      </Link>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={!issued}
        title={issued ? undefined : PRINT_BLOCKED}
        onClick={() => void print()}
      >
        Cetak Raport
      </button>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        disabled={blockedReason !== undefined || send.isPending}
        title={blockedReason}
        onClick={() => void submit()}
      >
        {send.isPending ? "Mengirim..." : "Kirim ke Siswa"}
      </button>
    </>
  )
}
