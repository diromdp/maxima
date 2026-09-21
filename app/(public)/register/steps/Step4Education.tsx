import { Grid, GridCol, Select, Text, TextInput } from "@mantine/core"
import type { UseFormReturnType } from "@mantine/form"

import { EDUCATION_LEVELS, GERMAN_LEVELS, type RegistrationValues } from "../data"

export function Step4Education({ form }: { form: UseFormReturnType<RegistrationValues> }) {
  return (
    <Grid gap="md">
      <GridCol span={{ base: 12, sm: 6 }}>
        <Select
          label="Jenjang Pendidikan Terakhir"
          withAsterisk
          placeholder="SMA / SMK / D3 / S1"
          data={[...EDUCATION_LEVELS]}
          {...form.getInputProps("lastEducationLevel")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Asal Sekolah atau Kampus"
          withAsterisk
          placeholder="Contoh: SMKN 4 Bandung"
          {...form.getInputProps("schoolName")}
        />
      </GridCol>

      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Jurusan"
          withAsterisk
          placeholder="Contoh: Keperawatan"
          {...form.getInputProps("major")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Tahun Lulus"
          withAsterisk
          placeholder="Contoh: 2023"
          inputMode="numeric"
          {...form.getInputProps("graduationYear")}
        />
      </GridCol>

      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Nilai Rata-rata Rapor"
          withAsterisk
          placeholder="Contoh: 85"
          {...form.getInputProps("averageGrade")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <Select
          label="Kemampuan Bahasa Jerman Saat Ini"
          withAsterisk
          placeholder="Belum pernah / A1 / A2"
          data={[...GERMAN_LEVELS]}
          {...form.getInputProps("germanLevel")}
        />
      </GridCol>

      <GridCol span={12}>
        <TextInput
          label="Pengalaman Kerja"
          placeholder="Kosongkan jika belum pernah bekerja"
          {...form.getInputProps("workExperience")}
        />
      </GridCol>

      <GridCol span={12}>
        <Text size="sm" c="dimmed">
          Jurusan dan pengalaman kerja dipakai Admission untuk mencocokkan calon dengan pekerjaan
          yang sesuai.
        </Text>
      </GridCol>
    </Grid>
  )
}
