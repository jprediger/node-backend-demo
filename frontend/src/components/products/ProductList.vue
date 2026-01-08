<script setup lang="ts">
import type { Product } from '@/types'
import ProductCard from './ProductCard.vue'

defineProps<{
  products: Product[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [product: Product]
  delete: [product: Product]
}>()
</script>

<template>
  <div class="product-list">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div v-for="i in 6" :key="i" class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-line title"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="products.length === 0" class="empty-state">
      <i class="pi pi-box empty-icon"></i>
      <h3 class="empty-title">Nenhum produto encontrado</h3>
      <p class="empty-text">
        Comece criando seu primeiro produto clicando no botão acima.
      </p>
    </div>

    <!-- Product cards -->
    <template v-else>
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </template>
  </div>
</template>

<style scoped>
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Skeleton loading */
.skeleton-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-image {
  height: 180px;
  background: linear-gradient(
    90deg,
    rgba(71, 85, 105, 0.2) 25%,
    rgba(71, 85, 105, 0.3) 50%,
    rgba(71, 85, 105, 0.2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 1rem;
  background: linear-gradient(
    90deg,
    rgba(71, 85, 105, 0.2) 25%,
    rgba(71, 85, 105, 0.3) 50%,
    rgba(71, 85, 105, 0.2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line.title {
  height: 1.25rem;
  width: 70%;
}

.skeleton-line.short {
  width: 50%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Empty state */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #475569;
  margin-bottom: 1.5rem;
  display: block;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  color: #94a3b8;
  margin: 0;
  font-size: 0.95rem;
}
</style>

