<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import Message from 'primevue/message'

const props = defineProps<{
  uploading?: boolean
  progress?: number
  error?: string | null
  currentImageUrl?: string | null
}>()

const emit = defineEmits<{
  select: [file: File]
  remove: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const dragOver = ref(false)

const displayUrl = computed(() => previewUrl.value || props.currentImageUrl)

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function openFilePicker() {
  inputRef.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && validateFile(file)) {
    previewUrl.value = URL.createObjectURL(file)
    emit('select', file)
  }
  // Reset input
  target.value = ''
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false

  const file = event.dataTransfer?.files?.[0]
  if (file && validateFile(file)) {
    previewUrl.value = URL.createObjectURL(file)
    emit('select', file)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function handleDragLeave() {
  dragOver.value = false
}

function validateFile(file: File): boolean {
  if (!acceptedTypes.includes(file.type)) {
    return false
  }
  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return false
  }
  return true
}

function removeImage() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = null
  emit('remove')
}
</script>

<template>
  <div class="image-uploader">
    <input
      ref="inputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="hidden-input"
      @change="handleFileSelect"
    />

    <Message v-if="error" severity="error" :closable="false" class="upload-error">
      {{ error }}
    </Message>

    <div v-if="uploading" class="upload-progress">
      <ProgressBar :value="progress" :showValue="true" class="progress-bar" />
      <p class="progress-text">Enviando imagem...</p>
    </div>

    <div v-else-if="displayUrl" class="image-preview">
      <img :src="displayUrl" alt="Preview" class="preview-image" />
      <div class="preview-overlay">
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          rounded
          aria-label="Trocar imagem"
          @click="openFilePicker"
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          rounded
          aria-label="Remover imagem"
          @click="removeImage"
        />
      </div>
    </div>

    <div
      v-else
      class="drop-zone"
      :class="{ 'drag-over': dragOver }"
      @click="openFilePicker"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <i class="pi pi-cloud-upload upload-icon"></i>
      <p class="upload-text">
        Arraste uma imagem ou <span class="upload-link">clique para selecionar</span>
      </p>
      <p class="upload-hint">PNG, JPG, WebP ou GIF (máx. 10MB)</p>
    </div>
  </div>
</template>

<style scoped>
.image-uploader {
  width: 100%;
}

.hidden-input {
  display: none;
}

.upload-error {
  margin-bottom: 1rem;
}

.upload-progress {
  padding: 2rem;
  text-align: center;
}

.progress-bar {
  margin-bottom: 1rem;
}

.progress-text {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0;
}

.image-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-preview:hover .preview-overlay {
  opacity: 1;
}

.drop-zone {
  border: 2px dashed rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.05);
}

.upload-icon {
  font-size: 2.5rem;
  color: #64748b;
  margin-bottom: 1rem;
  display: block;
}

.drop-zone:hover .upload-icon,
.drop-zone.drag-over .upload-icon {
  color: #22d3ee;
}

.upload-text {
  color: #94a3b8;
  font-size: 0.95rem;
  margin: 0 0 0.5rem 0;
}

.upload-link {
  color: #22d3ee;
  font-weight: 500;
}

.upload-hint {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0;
}
</style>

