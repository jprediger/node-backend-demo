<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import Card from 'primevue/card'

const authStore = useAuthStore()
const productsStore = useProductsStore()

const stats = computed(() => {
  const products = productsStore.products
  const categories = new Set(products.map((p) => p.category))
  const withImages = products.filter((p) => p.imagePath).length

  return {
    total: products.length,
    categories: categories.size,
    withImages,
    recent: products.slice(0, 5),
  }
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
})

const userName = computed(() => {
  return authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Usuário'
})

onMounted(() => {
  productsStore.fetchProducts()
})
</script>

<template>
  <DashboardLayout>
    <template #header-title>
      <h1 class="page-title">Dashboard</h1>
    </template>

    <div class="dashboard-content">
      <!-- Welcome section -->
      <section class="welcome-section">
        <h2 class="welcome-title">{{ greeting }}, {{ userName }}!</h2>
        <p class="welcome-text">
          Aqui está um resumo da sua atividade e produtos cadastrados.
        </p>
      </section>

      <!-- Stats cards -->
      <section class="stats-section">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon products">
                <i class="pi pi-box"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.total }}</span>
                <span class="stat-label">Produtos</span>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon categories">
                <i class="pi pi-tags"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.categories }}</span>
                <span class="stat-label">Categorias</span>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon images">
                <i class="pi pi-image"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.withImages }}</span>
                <span class="stat-label">Com Imagem</span>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <!-- Quick actions -->
      <section class="actions-section">
        <h3 class="section-title">Ações Rápidas</h3>
        <div class="action-cards">
          <RouterLink to="/products" class="action-card">
            <i class="pi pi-plus action-icon"></i>
            <span class="action-label">Novo Produto</span>
          </RouterLink>
          <RouterLink to="/products" class="action-card">
            <i class="pi pi-list action-icon"></i>
            <span class="action-label">Ver Todos</span>
          </RouterLink>
        </div>
      </section>

      <!-- Recent products -->
      <section v-if="stats.recent.length > 0" class="recent-section">
        <h3 class="section-title">Produtos Recentes</h3>
        <div class="recent-list">
          <div
            v-for="product in stats.recent"
            :key="product.id"
            class="recent-item"
          >
            <div class="recent-icon">
              <i class="pi pi-box"></i>
            </div>
            <div class="recent-info">
              <span class="recent-name">{{ product.name }}</span>
              <span class="recent-category">{{ product.category }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Welcome section */
.welcome-section {
  margin-bottom: 0.5rem;
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 0.5rem 0;
}

.welcome-text {
  color: #94a3b8;
  margin: 0;
  font-size: 1rem;
}

/* Stats section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 12px;
}

:deep(.stat-card .p-card-body) {
  padding: 1.25rem;
}

:deep(.stat-card .p-card-content) {
  padding: 0;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.products {
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
}

.stat-icon.categories {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.stat-icon.images {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Section title */
.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 1rem 0;
}

/* Actions section */
.action-cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 10px;
  color: #f1f5f9;
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-card:hover {
  background: rgba(34, 211, 238, 0.1);
  border-color: rgba(34, 211, 238, 0.3);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.1rem;
  color: #22d3ee;
}

.action-label {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Recent section */
.recent-list {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 12px;
  overflow: hidden;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-icon {
  width: 36px;
  height: 36px;
  background: rgba(71, 85, 105, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.recent-info {
  display: flex;
  flex-direction: column;
}

.recent-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #f1f5f9;
}

.recent-category {
  font-size: 0.8rem;
  color: #64748b;
}
</style>

