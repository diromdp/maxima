import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Box, Button, Checkbox, Group, ScrollArea, Stack, Text } from "@mantine/core"
import type { UseFormReturnType } from "@mantine/form"
import { useRef, type RefObject } from "react"

import { TERMS_TEXT, type RegistrationValues } from "../data"

export function Step6Review({
  form,
  summary,
  canvasRef,
  hasSignature,
  signatureNote,
  onSignatureChange,
}: {
  form: UseFormReturnType<RegistrationValues>
  summary: readonly (readonly [label: string, value: string])[]
  canvasRef: RefObject<HTMLCanvasElement | null>
  hasSignature: boolean
  signatureNote?: string
  onSignatureChange: (drawn: boolean) => void
}) {
  const drawing = useRef(false)

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    }
  }

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    drawing.current = true
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#101010"
    ctx.lineTo(x, y)
    ctx.stroke()
    onSignatureChange(true)
  }

  const endDraw = () => {
    drawing.current = false
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onSignatureChange(false)
  }

  return (
    <Stack gap="lg">
      <Box className="card-soft" p="lg">
        <Text fw={600} mb="sm">
          Ringkasan Pendaftaran
        </Text>
        <Stack gap="xs">
          {summary.map(([label, value]) => (
            <Group key={label} justify="space-between">
              <Text size="sm" c="dimmed">
                {label}
              </Text>
              <Text fw={500}>{value}</Text>
            </Group>
          ))}
        </Stack>
      </Box>

      <Box className="card" p={0}>
        <Text fw={600} p="md" pb={0}>
          Syarat dan Ketentuan
        </Text>
        <ScrollArea h={160} p="md">
          <Stack gap="sm">
            {TERMS_TEXT.map((t, i) => (
              <Text key={i} size="sm" c="dimmed">
                {i + 1}. {t}
              </Text>
            ))}
          </Stack>
        </ScrollArea>
      </Box>

      <Stack gap="xs">
        <Checkbox
          label="Saya menyatakan bahwa seluruh data yang saya berikan adalah benar, lengkap, dan dapat dipertanggungjawabkan."
          {...form.getInputProps("agreeAccurate", { type: "checkbox" })}
        />
        <Checkbox
          label="Saya bersedia mengikuti proses admission serta mematuhi ketentuan yang berlaku di Maxima Stiftung."
          {...form.getInputProps("agreeAdmission", { type: "checkbox" })}
        />
        <Checkbox
          label="Saya memberikan izin kepada Maxima Stiftung untuk menggunakan data yang saya berikan untuk keperluan proses admission, pembelajaran, penempatan program, dan komunikasi resmi."
          {...form.getInputProps("agreeDataUse", { type: "checkbox" })}
        />
      </Stack>

      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={600}>Tanda Tangan Digital</Text>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />}
            onClick={clearSignature}
          >
            Hapus
          </Button>
        </Group>
        <Box
          className="card"
          style={{ borderStyle: "dashed", touchAction: "none", cursor: "crosshair" }}
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={160}
            style={{ width: "100%", height: 160, display: "block", touchAction: "none" }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              startDraw(e)
            }}
            onPointerMove={draw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
          />
        </Box>
        {signatureNote && (
          <Text size="xs" c="dimmed">
            {signatureNote}
          </Text>
        )}
        {!hasSignature && (
          <Text size="xs" c="tindakan">
            Tanda tangan wajib digambar sebelum mengirim.
          </Text>
        )}
      </Stack>

      <Text size="sm" c="dimmed">
        Setelah dikirim, tagihan DP dikirim ke email Anda. NIS terbit setelah DP diterima dan
        disahkan Finance.
      </Text>
    </Stack>
  )
}
