import client from './client'
import type { AuthResponse, LoginInput, RegisterInput } from '@/types'

export const authApi = {
  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/register', data)
    return response.data
  },
}

