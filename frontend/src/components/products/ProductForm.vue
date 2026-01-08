<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Product, CreateProductInput, UpdateProductInput } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import ImageUploader from './ImageUploader.vue'

const props = defineProps<{
  product?: Product | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateProductInput | UpdateProductInput]
  fileChange: [file: File | null]
  cancel: []
}>()

const authStore = useAuthStore()
const productsStore = useProductsStore()

const name = ref('')
const category = ref('')
const description = ref('')
const selectedFile = ref<File | null>(null)
const currentImageUrl = ref<string | null>(null)

const isEditing = computed(() => !!props.product)

const canSubmit = computed(() => {
  return name.value.trim() !== '' && category.value.trim() !== ''
})

// Watch for product changes (when editing)
watch(
  () => props.product,
  async (product) => {
    if (product) {
      name.value = product.name
      category.value = product.category
      description.value = product.description || ''
      // Load current image
      if (product.imagePath) {
        currentImageUrl.value = await productsStore.getProductImageUrl(product.id)
      } else {
        currentImageUrl.value = null
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

function resetForm() {
  name.value = ''
  category.value = ''
  description.value = ''
  selectedFile.value = null
  currentImageUrl.value = null
  emit('fileChange', null)
}

function handleFileSelect(file: File) {
  selectedFile.value = file
  emit('fileChange', file)
}

function handleFileRemove() {
  selectedFile.value = null
  emit('fileChange', null)
}

async function handleSubmit() {
  const baseData = {
    name: name.value.trim(),
    category: category.value.trim(),
    description: description.value.trim() || undefined,
  }

  if (isEditing.value) {
    // Update product
    const updateData: UpdateProductInput = { ...baseData }
    emit('submit', updateData)
  } else {
    // Create product
    const createData: CreateProductInput = {
      ...baseData,
      authorId: authStore.user!.id,
    }
    emit('submit', createData)
  }
}
</script>

<template>
  <form class="product-form" @submit.prevent="handleSubmit">
    <div class="form-field">
      <label for="name" class="form-label">Nome *</label>
      <InputText
        id="name"
        v-model="name"
        placeholder="Nome do produto"
        class="form-input"
        :disabled="loading || uploading"
      />
    </div>

    <div class="form-field">
      <label for="category" class="form-label">Categoria *</label>
      <InputText
        id="category"
        v-model="category"
        placeholder="Ex: Eletrônicos, Roupas, etc."
        class="form-input"
        :disabled="loading || uploading"
      />
    </div>

    <div class="form-field">
      <label for="description" class="form-label">Descrição</label>
      <Textarea
        id="description"
        v-model="description"
        placeholder="Descrição do produto (opcional)"
        class="form-input"
        :disabled="loading || uploading"
        rows="3"
        autoResize
      />
    </div>

    <div class="form-field">
      <label class="form-label">Imagem</label>
      <ImageUploader
        :uploading="false"
        :progress="0"
        :error="null"
        :current-image-url="currentImageUrl"
        @select="handleFileSelect"
        @remove="handleFileRemove"
      />
    </div>

    <div class="form-actions">
      <Button
        type="button"
        label="Cancelar"
        severity="secondary"
        outlined
        :disabled="loading"
        @click="emit('cancel')"
      />
      <Button
        type="submit"
        :label="isEditing ? 'Salvar' : 'Criar Produto'"
        :loading="loading"
        :disabled="!canSubmit"
      />
    </div>
  </form>
</template>

<style scoped>
.product-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #cbd5e1;
}

.form-input {
  width: 100%;
}

:deep(.p-inputtext),
:deep(.p-textarea) {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #f1f5f9;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

:deep(.p-inputtext:hover),
:deep(.p-textarea:hover) {
  border-color: rgba(71, 85, 105, 0.8);
}

:deep(.p-inputtext:focus),
:deep(.p-textarea:focus) {
  border-color: #22d3ee;
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
}

:deep(.p-inputtext::placeholder),
:deep(.p-textarea::placeholder) {
  color: #64748b;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}
</style>

