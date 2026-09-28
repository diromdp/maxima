export const UPLOAD_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024
export const UPLOAD_ACCEPT = UPLOAD_TYPES.join(",")
export const UPLOAD_RULE = "Berkas harus PDF, JPG, atau PNG paling besar 5 MB."
export const UPLOAD_FAILED = "Berkas gagal diunggah. Coba lagi."

export const INTRODUCTION_VIDEO = "video-perkenalan"
export const VIDEO_UPLOAD_TYPES = ["video/mp4", "video/webm"] as const
export const VIDEO_UPLOAD_MAX_BYTES = 100 * 1024 * 1024

export type UploadTarget = { url: string; headers: { "Content-Type": string } }

export const isUploadable = (file: Blob): boolean =>
  (UPLOAD_TYPES as readonly string[]).includes(file.type) && file.size <= UPLOAD_MAX_BYTES

export function putToStorage(
  target: UploadTarget,
  file: Blob,
  onProgress?: (percent: number) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest()
    request.open("PUT", target.url)
    Object.entries(target.headers).forEach(([name, value]) => request.setRequestHeader(name, value))
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () => resolve(request.status >= 200 && request.status < 300)
    request.onerror = () => resolve(false)
    request.onabort = () => resolve(false)
    request.send(file)
  })
}
