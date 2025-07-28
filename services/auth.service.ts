import httpClient, { ApiResponse, ApiError } from './http-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
  user: {
    id: number;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    activationToken?: string | null;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface ActivateAccountRequest {
  token: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

class AuthService {
  private readonly endpoint = '/auth';

  /**
   * Iniciar sesión con email y contraseña
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await httpClient.publicRequest<LoginResponse>(
        'POST',
        `${this.endpoint}/login`,
        credentials
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await httpClient.publicRequest<RegisterResponse>(
        'POST',
        `${this.endpoint}/register`,
        userData
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Activar cuenta con token
   */
  async activateAccount(activationData: ActivateAccountRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await httpClient.publicRequest<{ message: string }>(
        'PUT',
        '/user/activate',
        activationData
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await httpClient.publicRequest<{ message: string }>(
        'POST',
        `${this.endpoint}/forgot-password`,
        request
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await httpClient.publicRequest<{ message: string }>(
        'POST',
        `${this.endpoint}/reset-password`,
        resetData
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(): Promise<ApiResponse<{ user: any }>> {
    try {
      const response = await httpClient.get<{ user: any }>('/user/profile');
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(profileData: Partial<{ name: string; email: string }>): Promise<ApiResponse<{ user: any }>> {
    try {
      const response = await httpClient.put<{ user: any }>('/user/profile', profileData);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar token de autenticación
   */
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user?: any }>> {
    try {
      const response = await httpClient.get<{ valid: boolean; user?: any }>(`${this.endpoint}/verify`);
      
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();
export default authService;
