import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {showMessage} from 'react-native-flash-message';

const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your backend URL

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          showMessage({
            message: 'Session expired',
            description: 'Please login again',
            type: 'warning',
          });
        } else if (error.response?.status >= 500) {
          showMessage({
            message: 'Server Error',
            description: 'Something went wrong. Please try again later.',
            type: 'danger',
          });
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url, {params});
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message,
      };
    }
  }
}

export const apiService = new ApiService();
