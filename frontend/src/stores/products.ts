import { ref } from 'vue'
import { defineStore } from 'pinia'
import { productsApi } from '@/api/products'
import type { Product, CreateProductInput, UpdateProductInput } from '@/types'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      products.value = await productsApi.list()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Erro ao carregar produtos'
    } finally {
      loading.value = false
    }
  }

  async function fetchProduct(id: string) {
    loading.value = true
    error.value = null
    try {
      currentProduct.value = await productsApi.getById(id)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Erro ao carregar produto'
    } finally {
      loading.value = false
    }
  }

  async function createProduct(data: CreateProductInput): Promise<Product | null> {
    loading.value = true
    error.value = null
    try {
      const product = await productsApi.create(data)
      products.value.push(product)
      return product
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Erro ao criar produto'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(
    id: string,
    data: UpdateProductInput
  ): Promise<Product | null> {
    loading.value = true
    error.value = null
    try {
      const product = await productsApi.update(id, data)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = product
      }
      return product
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Erro ao atualizar produto'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(id: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await productsApi.delete(id)
      products.value = products.value.filter((p) => p.id !== id)
      return true
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Erro ao excluir produto'
      return false
    } finally {
      loading.value = false
    }
  }

  async function uploadProductImage(
    productId: string,
    file: File
  ): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      // Get signed upload URL
      const { uploadUrl, objectPath } = await productsApi.getUploadUrl(
        productId,
        file.type
      )
      // Upload file directly to GCS
      await productsApi.uploadImage(uploadUrl, file)
      // Update product with new image path
      await updateProduct(productId, { imagePath: objectPath })
      return true
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Erro ao fazer upload da imagem'
      return false
    } finally {
      loading.value = false
    }
  }

  async function getProductImageUrl(productId: string): Promise<string | null> {
    try {
      const { url } = await productsApi.getImageUrl(productId)
      return url
    } catch {
      return null
    }
  }

  async function getProductThumbnailUrl(productId: string): Promise<string | null> {
    try {
      const { url } = await productsApi.getThumbnailUrl(productId)
      return url
    } catch {
      return null
    }
  }

  function clearError() {
    error.value = null
  }

  function setCurrentProduct(product: Product | null) {
    currentProduct.value = product
  }

  return {
    // State
    products,
    currentProduct,
    loading,
    error,
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    getProductImageUrl,
    getProductThumbnailUrl,
    clearError,
    setCurrentProduct,
  }
})

