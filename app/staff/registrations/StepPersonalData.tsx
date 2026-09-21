import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { PasswordInput, Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import type { UseFormReturnType } from "@mantine/form"

import { GENDER_OPTIONS } from "../../(public)/register/data"
import type { RegistrationValues } from "./registration"

export function StepPersonalData({ form }: { form: UseFormReturnType<RegistrationValues> }) {
  return (
    <div className="grid-2">
      <TextInput
        label="Email Aktif"
        withAsterisk
        type="email"
        placeholder="nama@email.com"
        autoComplete="off"
        {...form.getInputProps("email")}
      />
      <PasswordInput
        label="Password Akun"
        withAsterisk
        placeholder="Minimal 8 karakter"
        autoComplete="new-password"
        {...form.getInputProps("password")}
      />
      <TextInput
        label="Nama Lengkap"
        withAsterisk
        placeholder="Sesuai KTP"
        {...form.getInputProps("fullName")}
      />
      <TextInput
        label="Nama Panggilan"
        placeholder="Nama yang dipakai sehari-hari"
        {...form.getInputProps("nickname")}
      />
      <TextInput
        label="NIK"
        withAsterisk
        placeholder="16 digit"
        inputMode="numeric"
        maxLength={16}
        {...form.getInputProps("nik")}
      />
      <TextInput
        label="Nomor WhatsApp"
        withAsterisk
        placeholder="08xxxxxxxxxx"
        inputMode="tel"
        {...form.getInputProps("whatsapp")}
      />
      <TextInput
        label="Tempat Lahir"
        withAsterisk
        placeholder="Kota kelahiran"
        {...form.getInputProps("birthPlace")}
      />
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
            form.setFieldValue("birthDate", value ? new Date(value).toISOString().slice(0, 10) : "")
          }
          error={form.errors.birthDate}
        />
      </DatesProvider>
      <Select
        label="Jenis Kelamin"
        withAsterisk
        placeholder="Pilih"
        data={[...GENDER_OPTIONS]}
        {...form.getInputProps("gender")}
      />
      <TextInput
        label="Nomor HP Pribadi"
        withAsterisk
        placeholder="08xxxxxxxxxx"
        inputMode="tel"
        {...form.getInputProps("phonePersonal")}
      />
      <TextInput
        label="Tinggi Badan (cm)"
        withAsterisk
        placeholder="Contoh: 170"
        inputMode="numeric"
        {...form.getInputProps("height")}
      />
      <TextInput
        label="Berat Badan (kg)"
        withAsterisk
        placeholder="Contoh: 60"
        inputMode="numeric"
        {...form.getInputProps("weight")}
      />
      <TextInput
        label="Alamat Lengkap"
        withAsterisk
        placeholder="Jalan, nomor rumah, RT/RW"
        {...form.getInputProps("address")}
      />
      <TextInput
        label="Kelurahan"
        withAsterisk
        placeholder="Contoh: Cipaganti"
        {...form.getInputProps("village")}
      />
      <TextInput
        label="Kecamatan"
        withAsterisk
        placeholder="Contoh: Coblong"
        {...form.getInputProps("district")}
      />
      <TextInput
        label="Kota / Kabupaten"
        withAsterisk
        placeholder="Contoh: Bandung"
        {...form.getInputProps("city")}
      />
      <TextInput
        label="Provinsi"
        withAsterisk
        placeholder="Contoh: Jawa Barat"
        {...form.getInputProps("province")}
      />
      <TextInput
        label="Kode Pos"
        withAsterisk
        placeholder="5 digit"
        inputMode="numeric"
        maxLength={5}
        {...form.getInputProps("postalCode")}
      />
    </div>
  )
}
