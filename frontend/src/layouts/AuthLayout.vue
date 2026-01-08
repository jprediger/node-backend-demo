<script setup lang="ts">
// Auth layout - centered card with gradient background
</script>

<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-brand">
        <i class="pi pi-box brand-icon"></i>
        <h1 class="brand-title">Orbital Demo</h1>
        <p class="brand-subtitle">Gerencie seus produtos com facilidade</p>
      </div>
      <div class="auth-card">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
}

.auth-layout::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(34, 211, 238, 0.08) 0%,
    transparent 50%
  );
  animation: pulse 15s ease-in-out infinite;
}

.auth-layout::after {
  content: '';
  position: absolute;
  bottom: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 70% 70%,
    rgba(139, 92, 246, 0.06) 0%,
    transparent 50%
  );
  animation: pulse 20s ease-in-out infinite reverse;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
}

.auth-brand {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-icon {
  font-size: 3rem;
  color: #22d3ee;
  margin-bottom: 1rem;
  display: block;
  filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.4));
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  color: #94a3b8;
  margin: 0;
  font-size: 0.95rem;
}

.auth-card {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 16px;
  padding: 2rem;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}
</style>

