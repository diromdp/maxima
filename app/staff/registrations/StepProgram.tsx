import {
  Group,
  RadioCard,
  RadioGroup,
  RadioIndicator,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core"
import type { UseFormReturnType } from "@mantine/form"

import { INTEREST_FIELDS } from "../../(public)/register/data"
import {
  BRANCHES,
  CONSULTANTS,
  ENTRY_PATHS,
  LEAD_SOURCES,
  type RegistrationValues,
  STAFF_PROGRAMS,
} from "./registration"

export function StepProgram({ form }: { form: UseFormReturnType<RegistrationValues> }) {
  return (
    <div className="stack">
      <div className="stack stack-sm">
        <span className="field-label">Pilih Program Pendidikan</span>
        <RadioGroup {...form.getInputProps("program")}>
          <div className="grid-3">
            {STAFF_PROGRAMS.map((p) => (
              <RadioCard key={p.value} value={p.value}>
                <Group gap="sm" wrap="nowrap" align="flex-start">
                  <RadioIndicator />
                  <div className="stack" style={{ gap: 2 }}>
                    <span className="body-sm" style={{ fontWeight: 600 }}>
                      {p.label}
                    </span>
                    <span className="caption text-muted">{p.note}</span>
                  </div>
                </Group>
              </RadioCard>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="grid-2">
        <Select
          label="Jalur Masuk Program"
          withAsterisk
          placeholder="Reguler / Mandiri"
          data={[...ENTRY_PATHS]}
          {...form.getInputProps("entryPath")}
        />
        <Select
          label="Cabang Kampus Pelatihan"
          withAsterisk
          placeholder="Pilih cabang"
          data={[...BRANCHES]}
          {...form.getInputProps("branch")}
        />
        <Select
          label="Bidang yang Diminati"
          withAsterisk
          placeholder="Pflege, Gastronomie, Logistik"
          data={[...INTEREST_FIELDS]}
          {...form.getInputProps("interestField")}
        />
        <TextInput
          label="Jurusan yang Diminati"
          withAsterisk
          placeholder="Contoh: Perawat Lansia"
          {...form.getInputProps("interestMajor")}
        />
        <Select
          label="Sumber Lead"
          withAsterisk
          description="Pilihan tetap dari Master Data, bukan ketikan bebas."
          placeholder="Pilih sumber lead"
          data={[...LEAD_SOURCES]}
          {...form.getInputProps("infoSource")}
        />
        <Select
          label="PIC Marketing / Konsultan"
          withAsterisk
          description="Wajib. Tanpa PIC, siswa tidak terhitung di Performa Marketing."
          placeholder="Pilih PIC"
          data={[...CONSULTANTS]}
          {...form.getInputProps("consultant")}
        />
      </div>

      <Textarea
        label="Catatan Khusus Akademik / Keuangan"
        description="Opsional. Contoh: minta jadwal kelas sore, cicilan mundur satu bulan."
        placeholder="Tulis catatan untuk Akademik atau Finance"
        autosize
        minRows={3}
        {...form.getInputProps("notes")}
      />
    </div>
  )
}
