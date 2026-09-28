import {
  Badge,
  Box,
  Grid,
  GridCol,
  Group,
  RadioCard,
  RadioGroup,
  RadioIndicator,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import type { UseFormReturnType } from "@mantine/form"

import type {
  Choice,
  RegistrationContract,
  RegistrationOptions,
} from "@/src/entities/registration/schema"
import { eur, formatMoney, idr } from "@/src/lib/money"

import { choiceLabel, INTEREST_FIELDS, type RegistrationValues } from "../data"

const selectData = (choices: readonly Choice[]) =>
  choices.map((choice) => ({ value: choice.id, label: choice.name }))

export function Step2ProgramPackage({
  form,
  options,
  contract = null,
}: {
  form: UseFormReturnType<RegistrationValues>
  options: RegistrationOptions
  contract?: RegistrationContract | null
}) {
  const packages = options.packages.filter((pkg) => pkg.programId === form.values.program)
  const selected = options.packages.find((pkg) => pkg.id === form.values.packageId) ?? null
  const programName = options.programs.find((program) => program.id === form.values.program)?.name

  return (
    <Stack gap="lg">
      <Grid gap="md">
        <GridCol span={{ base: 12, sm: 6 }}>
          <Select
            label="Cabang"
            withAsterisk
            placeholder="Pilih cabang"
            data={selectData(options.branches)}
            {...form.getInputProps("branchId")}
          />
        </GridCol>
        <GridCol span={{ base: 12, sm: 6 }}>
          <Select
            label="Program"
            withAsterisk
            placeholder="Pilih program"
            data={selectData(options.programs)}
            {...form.getInputProps("program")}
            onChange={(program) => {
              form.setFieldValue("program", program ?? "")
              const isSameProgram = options.packages.some(
                (pkg) => pkg.id === form.values.packageId && pkg.programId === program,
              )
              if (!isSameProgram) form.setFieldValue("packageId", "")
            }}
          />
        </GridCol>
        <GridCol span={{ base: 12, sm: 6 }}>
          <Select
            label="Bidang yang Diminati"
            withAsterisk
            placeholder="Pflege · Gastronomie · Logistik"
            data={[...INTEREST_FIELDS]}
            {...form.getInputProps("interestField")}
          />
        </GridCol>
        <GridCol span={{ base: 12, sm: 6 }}>
          <Select
            label="Jurusan yang Diminati"
            withAsterisk
            placeholder="Pilih jurusan"
            searchable
            data={selectData(options.majors)}
            {...form.getInputProps("interestMajorId")}
          />
        </GridCol>
      </Grid>

      <Box className="card" p="lg">
        <Group justify="space-between" mb="md">
          <Text fw={600}>Cari paket</Text>
          <Text size="sm" c="dimmed">
            {programName ? `${packages.length} paket tersedia untuk program ${programName}` : ""}
          </Text>
        </Group>

        {!programName && (
          <Text size="sm" c="dimmed">
            Pilih program lebih dulu. Paket yang tampil hanya paket milik program itu.
          </Text>
        )}
        {programName && packages.length === 0 && (
          <Text size="sm" c="dimmed">
            Belum ada paket aktif untuk program {programName}. Finance menambahkannya di halaman
            Master Paket & Promo.
          </Text>
        )}

        <RadioGroup {...form.getInputProps("packageId")}>
          <Stack gap="xs">
            {packages.map((pkg) => (
              <RadioCard key={pkg.id} value={pkg.id} p="md" radius="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Group wrap="nowrap" align="flex-start">
                    <RadioIndicator />
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Text fw={600}>{pkg.name}</Text>
                        {pkg.id === form.values.packageId && (
                          <Badge className="badge badge-beres">Dipilih</Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed">
                        {choiceLabel(pkg)}
                      </Text>
                    </Stack>
                  </Group>
                  <Stack gap={2} align="flex-end">
                    <Text size="xs" c="dimmed">
                      Harga paket
                    </Text>
                    <Text fw={600} className="tabular">
                      {formatMoney(idr(pkg.priceIdr))}
                    </Text>
                    <Text size="xs" c="dimmed" className="tabular">
                      {pkg.serviceFeeEurCents === null
                        ? "Tanpa biaya layanan Euro"
                        : `Layanan Euro ${formatMoney(eur(pkg.serviceFeeEurCents))} · tunai`}
                    </Text>
                  </Stack>
                </Group>
              </RadioCard>
            ))}
          </Stack>
        </RadioGroup>
        {form.errors.packageId && (
          <Text size="xs" c="tindakan" mt="xs">
            {form.errors.packageId}
          </Text>
        )}

        <Text size="sm" c="dimmed" mt="md">
          Daftar paket dan harganya milik Finance. Mengganti paket mengubah seluruh estimasi di
          bawahnya. Biaya layanan Euro dibayar tunai di kantor cabang dan ditagih terpisah dari
          angsuran Rupiah.
        </Text>
      </Box>

      <Grid gap="md">
        <GridCol span={{ base: 12, sm: 4 }}>
          <Select
            label="Konsultan"
            withAsterisk
            placeholder="Pilih nama konsultan"
            searchable
            nothingFoundMessage="Belum ada konsultan yang dapat dipilih. Hubungi cabang Maxima."
            data={selectData(options.consultants ?? [])}
            {...form.getInputProps("picUserId")}
          />
        </GridCol>
        <GridCol span={{ base: 12, sm: 4 }}>
          <Select
            label="Sumber Informasi"
            withAsterisk
            placeholder="Instagram / teman / alumni / website"
            data={selectData(options.leadSources)}
            {...form.getInputProps("leadSourceId")}
          />
        </GridCol>
        <GridCol span={{ base: 12, sm: 4 }}>
          <TextInput
            label="Nama Perekomendasi"
            placeholder="Kosongkan jika tidak ada"
            {...form.getInputProps("referrerName")}
          />
        </GridCol>
      </Grid>

      {selected && (
        <Box className="card-soft" p="lg">
          <Text fw={600} mb="sm">
            Ringkasan Paket {selected.name}
          </Text>
          <Stack gap="xs">
            <SummaryRow label="Harga paket" value={formatMoney(idr(selected.priceIdr))} />
            <SummaryRow
              label="Harga layanan Euro"
              value={
                selected.serviceFeeEurCents === null
                  ? "Tidak ada"
                  : formatMoney(eur(selected.serviceFeeEurCents))
              }
            />
            <SummaryRow label="Estimasi DP" value={formatMoney(idr(selected.dpIdr))} />
            <SummaryRow label="Jumlah angsuran" value={`${selected.installments} kali`} />
            <SummaryRow
              label="Perkiraan per bulan"
              value={selected.monthlyIdr === null ? "-" : formatMoney(idr(selected.monthlyIdr))}
            />
          </Stack>
        </Box>
      )}

      <Grid gap="md" align="flex-end">
        <GridCol span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Kode Promo"
            placeholder="Masukkan kode promo"
            description="Diperiksa saat langkah ini disimpan."
            {...form.getInputProps("promoCode")}
          />
        </GridCol>
      </Grid>

      {contract && contract.package.id === form.values.packageId && contract.discountIdr > 0 && (
        <Group justify="flex-end">
          <Text size="sm" c="dimmed">
            Harga setelah promo {contract.promoCode}:
          </Text>
          <Text fw={600} className="tabular">
            {formatMoney(idr(contract.finalPriceIdr))}
          </Text>
        </Group>
      )}
    </Stack>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text className="tabular">{value}</Text>
    </Group>
  )
}
