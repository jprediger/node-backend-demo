<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Product, CreateProductInput, UpdateProductInput } from '@/types'
import { useProductsStore } from '@/stores/products'
import { useImageUpload } from '@/composables/useImageUpload'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ProductList from '@/components/products/ProductList.vue'
import ProductForm from '@/components/products/ProductForm.vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const productsStore = useProductsStore()
const toast = useToast()
const confirm = useConfirm()
const { uploadImage } = useImageUpload()

const showFormDialog = ref(false)
const editingProduct = ref<Product | null>(null)
const pendingFile = ref<File | null>(null)
const formLoading = ref(false)

onMounted(() => {
  productsStore.fetchProducts()
})

function openNewProductDialog() {
  editingProduct.value = null
  pendingFile.value = null
  showFormDialog.value = true
}

function openEditProductDialog(product: Product) {
  editingProduct.value = product
  pendingFile.value = null
  showFormDialog.value = true
}

function closeFormDialog() {
  showFormDialog.value = false
  editingProduct.value = null
  pendingFile.value = null
}

async function handleFormSubmit(data: CreateProductInput | UpdateProductInput) {
  formLoading.value = true

  try {
    if (editingProduct.value) {
      // Update existing product
      const result = await productsStore.updateProduct(
        editingProduct.value.id,
        data as UpdateProductInput
      )
      if (result) {
        // Upload new image if selected
        if (pendingFile.value) {
          const uploadResult = await uploadImage(result.id, pendingFile.value)
          if (uploadResult.success && uploadResult.objectPath) {
            await productsStore.updateProduct(result.id, {
              imagePath: uploadResult.objectPath,
            })
          }
        }
        toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Produto atualizado com sucesso',
          life: 3000,
        })
        closeFormDialog()
        productsStore.fetchProducts()
      } else {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: productsStore.error || 'Erro ao atualizar produto',
          life: 5000,
        })
      }
    } else {
      // Create new product
      const result = await productsStore.createProduct(data as CreateProductInput)
      if (result) {
        // Upload image if selected
        if (pendingFile.value) {
          const uploadResult = await uploadImage(result.id, pendingFile.value)
          if (uploadResult.success && uploadResult.objectPath) {
            await productsStore.updateProduct(result.id, {
              imagePath: uploadResult.objectPath,
            })
          }
        }
        toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Produto criado com sucesso',
          life: 3000,
        })
        closeFormDialog()
        productsStore.fetchProducts()
      } else {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: productsStore.error || 'Erro ao criar produto',
          life: 5000,
        })
      }
    }
  } finally {
    formLoading.value = false
  }
}

function confirmDeleteProduct(product: Product) {
  confirm.require({
    message: `Tem certeza que deseja excluir o produto "${product.name}"?`,
    header: 'Confirmar Exclusão',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Excluir',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const success = await productsStore.deleteProduct(product.id)
      if (success) {
        toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Produto excluído com sucesso',
          life: 3000,
        })
      } else {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: productsStore.error || 'Erro ao excluir produto',
          life: 5000,
        })
      }
    },
  })
}
</script>

<template>
  <DashboardLayout>
    <template #header-title>
      <h1 class="page-title">Produtos</h1>
    </template>

    <template #header-actions>
      <Button
        label="Novo Produto"
        icon="pi pi-plus"
        @click="openNewProductDialog"
      />
    </template>

    <div class="products-content">
      <ProductList
        :products="productsStore.products"
        :loading="productsStore.loading"
        @edit="openEditProductDialog"
        @delete="confirmDeleteProduct"
      />
    </div>

    <!-- Product Form Dialog -->
    <Dialog
      v-model:visible="showFormDialog"
      :header="editingProduct ? 'Editar Produto' : 'Novo Produto'"
      :style="{ width: '500px' }"
      :modal="true"
      :closable="!formLoading"
      :draggable="false"
      class="product-dialog"
    >
      <ProductForm
        :product="editingProduct"
        :loading="formLoading"
        @submit="handleFormSubmit"
        @fileChange="pendingFile = $event"
        @cancel="closeFormDialog"
      />
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </DashboardLayout>
</template>

<style scoped>
.products-content {
  min-height: 400px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

:deep(.product-dialog .p-dialog) {
  background: #1e293b;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

:deep(.product-dialog .p-dialog-header) {
  background: transparent;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  color: #f1f5f9;
}

:deep(.product-dialog .p-dialog-content) {
  background: transparent;
  padding: 1.5rem;
}

:deep(.p-confirmdialog) {
  background: #1e293b;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

:deep(.p-confirmdialog .p-dialog-header) {
  background: transparent;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  color: #f1f5f9;
}

:deep(.p-confirmdialog .p-dialog-content) {
  background: transparent;
  color: #94a3b8;
}

:deep(.p-confirmdialog .p-dialog-footer) {
  background: transparent;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}
</style>

