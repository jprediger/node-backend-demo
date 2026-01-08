<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const passwordMismatch = ref(false)

async function handleSubmit() {
  if (password.value !== confirmPassword.value) {
    passwordMismatch.value = true
    return
  }
  passwordMismatch.value = false
  authStore.clearError()

  const success = await authStore.register({
    email: email.value,
    password: password.value,
    name: name.value || undefined,
  })
  if (success) {
    router.push('/dashboard')
  }
}
</script>

<template>
  <AuthLayout>
    <form class="auth-form" @submit.prevent="handleSubmit">
      <h2 class="form-title">Criar Conta</h2>
      <p class="form-subtitle">Preencha os dados para começar a usar.</p>

      <Message v-if="authStore.error" severity="error" :closable="false" class="form-message">
        {{ authStore.error }}
      </Message>

      <Message v-if="passwordMismatch" severity="warn" :closable="false" class="form-message">
        As senhas não conferem
      </Message>

      <div class="form-field">
        <label for="name" class="form-label">Nome <span class="optional">(opcional)</span></label>
        <InputText
          id="name"
          v-model="name"
          placeholder="Seu nome"
          class="form-input"
          :disabled="authStore.loading"
          autocomplete="name"
        />
      </div>

      <div class="form-field">
        <label for="email" class="form-label">Email</label>
        <InputText
          id="email"
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          class="form-input"
          :disabled="authStore.loading"
          autocomplete="email"
        />
      </div>

      <div class="form-field">
        <label for="password" class="form-label">Senha</label>
        <Password
          id="password"
          v-model="password"
          placeholder="Mínimo 6 caracteres"
          class="form-input"
          :disabled="authStore.loading"
          toggleMask
          autocomplete="new-password"
        />
      </div>

      <div class="form-field">
        <label for="confirmPassword" class="form-label">Confirmar Senha</label>
        <Password
          id="confirmPassword"
          v-model="confirmPassword"
          placeholder="Digite a senha novamente"
          class="form-input"
          :feedback="false"
          :disabled="authStore.loading"
          toggleMask
          autocomplete="new-password"
        />
      </div>

      <Button
        type="submit"
        label="Criar Conta"
        class="form-button"
        :loading="authStore.loading"
        :disabled="!email || !password || !confirmPassword"
      />

      <p class="form-footer">
        Já tem uma conta?
        <RouterLink to="/login" class="form-link">Entrar</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
  text-align: center;
}

.form-subtitle {
  color: #94a3b8;
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
}

.form-message {
  margin: 0;
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

.optional {
  color: #64748b;
  font-weight: 400;
}

.form-input {
  width: 100%;
}

:deep(.p-inputtext) {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #f1f5f9;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

:deep(.p-inputtext:hover) {
  border-color: rgba(71, 85, 105, 0.8);
}

:deep(.p-inputtext:focus) {
  border-color: #22d3ee;
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
}

:deep(.p-inputtext::placeholder) {
  color: #64748b;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}

:deep(.p-password-toggle-mask-btn) {
  color: #64748b;
}

:deep(.p-password-toggle-mask-btn:hover) {
  color: #94a3b8;
  background: transparent;
}

.form-button {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.form-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3);
}

.form-button:active:not(:disabled) {
  transform: translateY(0);
}

.form-footer {
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0;
}

.form-link {
  color: #22d3ee;
  font-weight: 500;
  transition: color 0.2s ease;
}

.form-link:hover {
  color: #67e8f9;
}
</style>

