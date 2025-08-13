import axios, { AxiosInstance, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://earnquest-backend.railway.app/api'

interface ApiResponse<T = any> {
  success: boolean
  data: T
  error?: string
}

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.')
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.')
        }
        return Promise.reject(error)
      }
    )
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.api.defaults.headers.common['Authorization']
    }
  }

  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url, { params })
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message,
      }
    }
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data)
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message,
      }
    }
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data)
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message,
      }
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url)
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message,
      }
    }
  }
}

export const apiService = new ApiService()
