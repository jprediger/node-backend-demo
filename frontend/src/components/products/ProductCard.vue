<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Product } from '@/types'
import { useProductsStore } from '@/stores/products'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  edit: [product: Product]
  delete: [product: Product]
}>()

const productsStore = useProductsStore()
const thumbnailUrl = ref<string | null>(null)
const loadingImage = ref(true)

onMounted(async () => {
  if (props.product.thumbnailPath) {
    thumbnailUrl.value = await productsStore.getProductThumbnailUrl(props.product.id)
  }
  loadingImage.value = false
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="product-card">
    <div class="card-image">
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="product.name"
        class="product-thumbnail"
        @error="thumbnailUrl = null"
      />
      <div v-else class="image-placeholder">
        <i class="pi pi-image"></i>
      </div>
      <div v-if="loadingImage" class="image-loading">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
    </div>

    <div class="card-content">
      <div class="card-header">
        <h3 class="product-name">{{ product.name }}</h3>
        <Tag :value="product.category" severity="info" class="category-tag" />
      </div>

      <p v-if="product.description" class="product-description">
        {{ product.description }}
      </p>
      <p v-else class="product-description empty">Sem descrição</p>

      <div class="card-footer">
        <span class="product-date">
          <i class="pi pi-calendar"></i>
          {{ formatDate(product.createdAt) }}
        </span>

        <div class="card-actions">
          <Button
            icon="pi pi-pencil"
            severity="secondary"
            text
            rounded
            size="small"
            aria-label="Editar"
            @click="emit('edit', product)"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            size="small"
            aria-label="Excluir"
            @click="emit('delete', product)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.product-card:hover {
  border-color: rgba(71, 85, 105, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.card-image {
  position: relative;
  height: 180px;
  background: rgba(15, 23, 42, 0.5);
  overflow: hidden;
}

.product-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 3rem;
}

.image-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.8);
  color: #22d3ee;
  font-size: 1.5rem;
}

.card-content {
  padding: 1rem;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.category-tag {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  flex-shrink: 0;
}

.product-description {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description.empty {
  color: #64748b;
  font-style: italic;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.product-date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #64748b;
}

.product-date i {
  font-size: 0.7rem;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}
</style>

