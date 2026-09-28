import { CHAPTERS } from "@/src/entities/session/schema"
import { DASH } from "@/src/lib/format"

export const SKELETON_ROWS = 5

export const percentText = (value: number | null): string =>
  value === null ? DASH : `${Math.round(value)}%`

export const scoreText = (value: number | null): string =>
  value === null ? DASH : Number.isInteger(value) ? String(value) : value.toFixed(1)

export const averageText = (value: number | null): string =>
  value === null ? DASH : `${scoreText(value)} / 100`

export const chapterText = (chapter: number | null, total: number = CHAPTERS.length): string =>
  chapter === null ? DASH : `Bab ${chapter} / ${total}`
