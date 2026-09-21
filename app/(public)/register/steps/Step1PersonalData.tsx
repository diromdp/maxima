import { Grid, GridCol, PasswordInput, Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import type { UseFormReturnType } from "@mantine/form"
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { ANREDE_OPTIONS, GENDER_OPTIONS, type RegistrationValues } from "../data"

export function Step1PersonalData({ form }: { form: UseFormReturnType<RegistrationValues> }) {
  return (
    <Grid gap="md">
      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Email"
          withAsterisk
          placeholder="Input Email"
          type="email"
          autoComplete="email"
          {...form.getInputProps("email")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <PasswordInput
          label="Password"
          withAsterisk
          placeholder="Input Password"
          autoComplete="new-password"
          {...form.getInputProps("password")}
        />
      </GridCol>

      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Nama Lengkap"
          withAsterisk
          placeholder="Sesuai KTP"
          {...form.getInputProps("fullName")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <Select
          label="Panggilan / Anrede"
          withAsterisk
          placeholder="Pilih panggilan"
          data={[...ANREDE_OPTIONS]}
          {...form.getInputProps("anrede")}
        />
      </GridCol>

      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="NIK"
          withAsterisk
          placeholder="16 digit"
          inputMode="numeric"
          maxLength={16}
          {...form.getInputProps("nik")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <Select
          label="Jenis Kelamin"
          withAsterisk
          placeholder="Laki-laki / Perempuan"
          data={[...GENDER_OPTIONS]}
          {...form.getInputProps("gender")}
        />
      </GridCol>

      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Tempat Lahir"
          withAsterisk
          placeholder="Kota kelahiran"
          {...form.getInputProps("birthPlace")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <DatesProvider settings={{ locale: "id" }}>
          <DateInput
            label="Tanggal Lahir"
            withAsterisk
            placeholder="Pilih tanggal"
            valueFormat="DD MMM YYYY"
            maxDate={new Date()}
            leftSection={<HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.5} />}
            value={form.values.birthDate ? new Date(form.values.birthDate) : null}
            onChange={(value) =>
              form.setFieldValue(
                "birthDate",
                value ? new Date(value).toISOString().slice(0, 10) : "",
              )
            }
            error={form.errors.birthDate}
          />
        </DatesProvider>
      </GridCol>

      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Tinggi Badan (dalam cm)"
          withAsterisk
          placeholder="contoh : 170"
          inputMode="numeric"
          {...form.getInputProps("height")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Berat Badan (dalam kg)"
          withAsterisk
          placeholder="contoh : 60"
          inputMode="numeric"
          {...form.getInputProps("weight")}
        />
      </GridCol>

      <GridCol span={12}>
        <TextInput
          label="Nomor HP Pribadi"
          withAsterisk
          placeholder="08xxxxxxxxx"
          {...form.getInputProps("phonePersonal")}
        />
      </GridCol>
    </Grid>
  )
}
