import { authService } from '@/services';

// Función para establecer cookie en el cliente
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
}

// Función para obtener cookie en el cliente
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      return value;
    }
  }
  return null;
}

// Función para eliminar cookie
function removeCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Función para establecer el token de autenticación
export const setToken = (token: string) => {
  console.log('🍪 [COOKIE-DEBUG] Setting token in cookie:', token.substring(0, 20) + '...');
  setCookie('auth-token', token, 7);
  console.log('🍪 [COOKIE-DEBUG] Token set, verifying...');
  const retrieved = getCookie('auth-token');
  console.log('🍪 [COOKIE-DEBUG] Retrieved token:', retrieved ? retrieved.substring(0, 20) + '...' : 'null');
};

export const loginApi = async (email: string, password: string): Promise<any> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.jwt) {
      setToken(data.jwt);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

// Función para obtener el token actual
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = getCookie('auth-token');
  return token;
}

// Función para cerrar sesión
export function logoutApi(): void {
  removeCookie('auth-token');
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  const authenticated = !!token;
  return authenticated;
}

// Función para obtener headers de autenticación para requests
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Función para hacer requests autenticados con axios
export async function makeAuthenticatedRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any) {
  const headers = getAuthHeaders();
  
  try {
    const config = {
      method: method.toLowerCase(),
      url,
      headers,
      ...(data && { data })
    };
    
    const response = await fetch(url, config);
    
    return response;
  } catch (error: any) {
    throw error;
  }
} 