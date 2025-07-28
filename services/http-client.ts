import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthToken } from '@/lib/auth-api';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class HttpClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor para añadir token automáticamente
    this.client.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejo centralizado de errores
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Manejo específico de errores de autenticación
        if (error.response?.status === 401) {
          // Redirigir a login en caso de token expirado
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  // Método para obtener la URL base configurada
  getBaseURL(): string {
    return this.baseURL;
  }

  private normalizeError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || error.response.statusText || 'Error del servidor',
        status: error.response.status,
        code: error.response.data?.code
      };
    } else if (error.request) {
      return {
        message: 'Error de conexión - Verifique su conexión a internet',
        status: 0
      };
    } else {
      return {
        message: error.message || 'Error desconocido',
        status: 0
      };
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      throw error;
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      throw error;
    }
  }

  // Método para requests sin autenticación
  async publicRequest<T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      // Crear una instancia temporal de axios con la misma baseURL pero sin interceptors
      const publicClient = axios.create({
        baseURL: this.baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      const config: AxiosRequestConfig = {
        method,
        url,
        ...(data && { data })
      };

      const response = await publicClient(config);
      
      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }
}

// Instancia singleton del cliente HTTP
export const httpClient = new HttpClient();
export default httpClient;
