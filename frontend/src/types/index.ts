// User types
export interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
}

// Product types
export interface Product {
  id: string
  name: string
  description: string | null
  category: string
  imagePath: string | null
  thumbnailPath: string | null
  authorId: string
  createdAt: string
  updatedAt: string
}

export interface CreateProductInput {
  name: string
  category: string
  authorId: string
  description?: string
  imagePath?: string
  thumbnailPath?: string
}

export interface UpdateProductInput {
  name?: string
  category?: string
  description?: string
  imagePath?: string
  thumbnailPath?: string
}

// Auth types
export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  token: string
  user: User
}

// API response types
export interface ApiError {
  message: string
  statusCode?: number
}

export interface SignedUrlResponse {
  uploadUrl: string
  objectPath: string
}

export interface ImageUrlResponse {
  url: string
}

