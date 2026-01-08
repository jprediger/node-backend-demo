import { ref } from 'vue'
import { productsApi } from '@/api/products'

export function useImageUpload() {
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  async function uploadImage(
    productId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; objectPath?: string }> {
    uploading.value = true
    progress.value = 0
    error.value = null

    try {
      // Get signed upload URL
      const { uploadUrl, objectPath } = await productsApi.getUploadUrl(
        productId,
        file.type
      )

      // Upload using XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            progress.value = percent
            onProgress?.(percent)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      return { success: true, objectPath }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro no upload'
      error.value = message
      return { success: false }
    } finally {
      uploading.value = false
    }
  }

  function reset() {
    uploading.value = false
    progress.value = 0
    error.value = null
  }

  return {
    uploading,
    progress,
    error,
    uploadImage,
    reset,
  }
}

