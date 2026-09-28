import { Grid, GridCol, TextInput } from "@mantine/core"
import type { UseFormReturnType } from "@mantine/form"

import { PhoneInput } from "@/src/components/ui/PhoneInput"

import type { RegistrationValues } from "../data"

export function Step3ContactAddress({ form }: { form: UseFormReturnType<RegistrationValues> }) {
  return (
    <Grid gap="md">
      <GridCol span={{ base: 12, sm: 6 }}>
        <PhoneInput label="Nomor HP Ibu" withAsterisk {...form.getInputProps("phoneMother")} />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <PhoneInput label="Nomor HP Ayah" withAsterisk {...form.getInputProps("phoneFather")} />
      </GridCol>

      <GridCol span={12}>
        <TextInput
          label="Alamat Lengkap"
          withAsterisk
          placeholder="Jalan, nomor rumah, RT/RW"
          {...form.getInputProps("address")}
        />
      </GridCol>

      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Kelurahan"
          withAsterisk
          placeholder="Contoh: Cipaganti"
          {...form.getInputProps("village")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Kecamatan"
          withAsterisk
          placeholder="Contoh: Coblong"
          {...form.getInputProps("district")}
        />
      </GridCol>

      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Kota atau Kabupaten"
          withAsterisk
          placeholder="Contoh: Kota Bandung"
          {...form.getInputProps("city")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Provinsi"
          withAsterisk
          placeholder="Contoh: Jawa Barat"
          {...form.getInputProps("province")}
        />
      </GridCol>

      <GridCol span={{ base: 12, sm: 4 }}>
        <TextInput
          label="Kode Pos"
          withAsterisk
          placeholder="5 digit, contoh: 40131"
          {...form.getInputProps("postalCode")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 4 }}>
        <TextInput
          label="Nama Kontak Darurat"
          withAsterisk
          placeholder="Beserta hubungan keluarga, contoh: Siti Aminah - kakak"
          {...form.getInputProps("emergencyContact")}
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 4 }}>
        <PhoneInput
          label="Nomor Kontak Darurat"
          withAsterisk
          {...form.getInputProps("emergencyContactPhone")}
        />
      </GridCol>
    </Grid>
  )
}
