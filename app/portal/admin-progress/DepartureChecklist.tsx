"use client"

import { Checkbox, Group, Text, Title } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"

import { DEPARTURE_CHECKLIST } from "./data"

/** Satu kunci untuk dua tempat centang (layar 3 dan layar 7) — satu daftar, satu jawaban. */
const STORAGE_KEY = "maxima.departure-checklist"

/**
 * Checklist Keberangkatan. Dipakai di Progres Administrasi dan Pemberkasan
 * Alumni; centangnya disimpan di localStorage dengan satu kunci supaya
 * keduanya selalu sama. Pindah ke API portal saat Admission perlu membacanya.
 */
export function DepartureChecklist({ title = "Checklist Keberangkatan" }: { title?: string }) {
  const [checked, setChecked] = useLocalStorage<readonly string[]>({
    key: STORAGE_KEY,
    defaultValue: [],
    getInitialValueInEffect: true,
  })

  return (
    <section className="card" aria-labelledby="checklist-heading">
      <Group justify="space-between" align="baseline" wrap="nowrap" mb="md">
        <div className="stack" style={{ gap: 2 }}>
          <Title order={5} id="checklist-heading">
            {title}
          </Title>
          <Text size="sm" c="dimmed">
            Centang yang sudah Anda siapkan.
          </Text>
        </div>
        <Text size="sm" c="dimmed" className="tabular" style={{ whiteSpace: "nowrap" }}>
          {checked.length} dari {DEPARTURE_CHECKLIST.length}
        </Text>
      </Group>

      <Checkbox.Group value={[...checked]} onChange={setChecked}>
        {/* 15 butir satu kolom terlalu panjang di samping kartu yang pendek. */}
        <div className="grid-2" style={{ rowGap: 12 }}>
          {DEPARTURE_CHECKLIST.map((item) => (
            <Checkbox key={item} value={item} label={item} />
          ))}
        </div>
      </Checkbox.Group>
    </section>
  )
}
