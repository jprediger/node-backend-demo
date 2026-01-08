import client from './client'
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  SignedUrlResponse,
  ImageUrlResponse,
} from '@/types'

export const productsApi = {
  async list(): Promise<Product[]> {
    const response = await client.get<Product[]>('/products')
    return response.data
  },

  async getById(id: string): Promise<Product> {
    const response = await client.get<Product>(`/products/${id}`)
    return response.data
  },

  async create(data: CreateProductInput): Promise<Product> {
    const response = await client.post<Product>('/products', data)
    return response.data
  },

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const response = await client.put<Product>(`/products/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await client.delete(`/products/${id}`)
  },

  async getUploadUrl(id: string, contentType: string): Promise<SignedUrlResponse> {
    const response = await client.post<SignedUrlResponse>(
      `/products/${id}/image/upload-url`,
      { contentType }
    )
    return response.data
  },

  async getImageUrl(id: string): Promise<ImageUrlResponse> {
    const response = await client.get<ImageUrlResponse>(`/products/${id}/image-url`)
    return response.data
  },

  async getThumbnailUrl(id: string): Promise<ImageUrlResponse> {
    const response = await client.get<ImageUrlResponse>(`/products/${id}/thumbnail-url`)
    return response.data
  },

  async uploadImage(uploadUrl: string, file: File): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })
  },
}

