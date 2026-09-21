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

import { formatMoney, subtract } from "@/src/lib/money"
import { Notice } from "@/src/components/ui/Notice"

import {
  CONSULTANTS,
  DEFAULT_PACKAGE_ID,
  INFO_SOURCES,
  INTEREST_FIELDS,
  monthlyEstimate,
  PACKAGES,
  packageLabel,
  PROGRAMS,
  BRANCHES,
  resolvePromo,
  type RegistrationValues,
} from "../data"

export function Step2ProgramPackage({ form }: { form: UseFormReturnType<RegistrationValues> }) {
  const selectedPackage =
    PACKAGES.find((p) => p.id === form.values.packageId) ??
    PACKAGES.find((p) => p.id === DEFAULT_PACKAGE_ID)!

  const promo = resolvePromo(form.values.promoCode)
  const priceAfterPromo = promo.valid
    ? subtract(selectedPackage.price, promo.discount)
    : selectedPackage.price

  return (
    <Stack gap="lg">
      <Grid gap="md">
        <GridCol span={{ base: 12, sm: 6 }}>
          <Select
            label="Cabang"
            withAsterisk
            placeholder="Pilih cabang"
            data={[...BRANCHES]}
            {...form.getInputProps("branch")}
          />
        </GridCol>
        <GridCol span={{ base: 12, sm: 6 }}>
          <Select
            label="Program"
            withAsterisk
            placeholder="Pilih program"
            data={[...PROGRAMS]}
            {...form.getInputProps("program")}
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
          <TextInput
            label="Jurusan yang Diminati"
            withAsterisk
            placeholder="Contoh: Perawat Lansia"
            {...form.getInputProps("interestMajor")}
          />
        </GridCol>
      </Grid>

      <Box className="card" p="lg">
        <Group justify="space-between" mb="md">
          <Text fw={600}>Cari paket</Text>
          <Text size="sm" c="dimmed">
            {PACKAGES.length} paket tersedia untuk program {form.values.program || "Ausbildung"}
          </Text>
        </Group>

        <RadioGroup {...form.getInputProps("packageId")}>
          <Stack gap="xs">
            {PACKAGES.map((pkg) => (
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
                        {packageLabel(pkg)}
                      </Text>
                    </Stack>
                  </Group>
                  <Stack gap={2} align="flex-end">
                    <Text size="xs" c="dimmed">
                      Harga paket
                    </Text>
                    <Text fw={600} className="tabular">
                      {formatMoney(pkg.price)}
                    </Text>
                    {pkg.serviceFeeEur ? (
                      <Text size="xs" c="dimmed" className="tabular">
                        Layanan Euro {formatMoney(pkg.serviceFeeEur)} · tunai
                      </Text>
                    ) : (
                      <Text size="xs" c="dimmed">
                        Tanpa biaya layanan Euro
                      </Text>
                    )}
                  </Stack>
                </Group>
              </RadioCard>
            ))}
          </Stack>
        </RadioGroup>

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
            data={[...CONSULTANTS]}
            {...form.getInputProps("consultant")}
          />
        </GridCol>
        <GridCol span={{ base: 12, sm: 4 }}>
          <Select
            label="Sumber Informasi"
            withAsterisk
            placeholder="Instagram / teman / alumni / website"
            data={[...INFO_SOURCES]}
            {...form.getInputProps("infoSource")}
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

      <Box className="card-soft" p="lg">
        <Text fw={600} mb="sm">
          Ringkasan Paket {selectedPackage.name}
        </Text>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Harga paket
            </Text>
            <Text className="tabular">{formatMoney(selectedPackage.price)}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Harga layanan Euro
            </Text>
            <Text className="tabular">
              {selectedPackage.serviceFeeEur
                ? formatMoney(selectedPackage.serviceFeeEur)
                : "Tidak ada"}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Estimasi DP
            </Text>
            <Text className="tabular">{formatMoney(selectedPackage.dp)}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Jumlah angsuran
            </Text>
            <Text className="tabular">{selectedPackage.installments} kali</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Perkiraan per bulan
            </Text>
            <Text className="tabular">{formatMoney(monthlyEstimate(selectedPackage))}</Text>
          </Group>
        </Stack>
      </Box>

      <Grid gap="md" align="flex-end">
        <GridCol span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Kode Promo"
            placeholder="Masukkan kode promo"
            {...form.getInputProps("promoCode")}
          />
        </GridCol>
        <GridCol span={{ base: 12, sm: 6 }}>
          {form.values.promoCode.trim() && (
            <Notice tone={promo.valid ? "success" : "danger"}>{promo.message}</Notice>
          )}
        </GridCol>
      </Grid>

      {promo.valid && (
        <Group justify="flex-end">
          <Text size="sm" c="dimmed">
            Harga setelah promo:{" "}
          </Text>
          <Text fw={600} className="tabular">
            {formatMoney(priceAfterPromo)}
          </Text>
        </Group>
      )}
    </Stack>
  )
}
