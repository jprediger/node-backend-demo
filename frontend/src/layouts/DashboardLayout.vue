<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

interface NavItem {
  label: string
  icon: string
  path: string
}

const router = useRouter()
const authStore = useAuthStore()
const userMenuRef = ref()

const userName = computed(() => authStore.user?.name || authStore.user?.email || 'Usuário')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    path: '/dashboard',
  },
  {
    label: 'Produtos',
    icon: 'pi pi-box',
    path: '/products',
  },
]

const userMenuItems: MenuItem[] = [
  {
    label: 'Perfil',
    icon: 'pi pi-user',
    disabled: true,
  },
  {
    separator: true,
  },
  {
    label: 'Sair',
    icon: 'pi pi-sign-out',
    command: () => {
      authStore.logout()
      router.push('/login')
    },
  },
]

function toggleUserMenu(event: Event) {
  userMenuRef.value.toggle(event)
}

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <i class="pi pi-box brand-icon"></i>
        <span class="brand-text">ProductHub</span>
      </div>

      <nav class="sidebar-nav">
        <a
          v-for="item in navItems"
          :key="item.label"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
          @click="navigateTo(item.path)"
        >
          <i :class="item.icon" class="nav-icon"></i>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" @click="toggleUserMenu">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <span class="user-email">{{ authStore.user?.email }}</span>
          </div>
          <i class="pi pi-chevron-up user-menu-icon"></i>
        </div>
        <Menu ref="userMenuRef" :model="userMenuItems" :popup="true" />
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <header class="content-header">
        <div class="header-left">
          <slot name="header-title">
            <h1 class="page-title">Dashboard</h1>
          </slot>
        </div>
        <div class="header-right">
          <slot name="header-actions">
            <Button
              icon="pi pi-bell"
              severity="secondary"
              text
              rounded
              aria-label="Notificações"
            />
          </slot>
        </div>
      </header>

      <div class="content-body">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1a1f35 100%);
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: rgba(15, 23, 42, 0.95);
  border-right: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-brand {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.brand-icon {
  font-size: 1.5rem;
  color: #22d3ee;
  filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.3));
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(71, 85, 105, 0.3);
  color: #f1f5f9;
}

.nav-item.active {
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
}

.nav-item.active .nav-icon {
  color: #22d3ee;
}

.nav-icon {
  font-size: 1.1rem;
  width: 1.25rem;
  text-align: center;
}

.nav-label {
  font-size: 0.9rem;
  font-weight: 500;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.user-info:hover {
  background: rgba(71, 85, 105, 0.3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu-icon {
  color: #64748b;
  font-size: 0.75rem;
}

/* Main content */
.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content-body {
  flex: 1;
  padding: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 72px;
  }

  .brand-text,
  .nav-label,
  .user-details,
  .user-menu-icon {
    display: none;
  }

  .sidebar-brand {
    justify-content: center;
  }

  .nav-item {
    justify-content: center;
    padding: 0.75rem;
  }

  .user-info {
    justify-content: center;
  }

  .main-content {
    margin-left: 72px;
  }

  .content-body {
    padding: 1rem;
  }
}
</style>

