import { useState, useEffect } from 'react';
import { getAuthToken, isAuthenticated, logoutApi } from '@/lib/auth-api';
import { getCurrentUser, logoutUser, LocalUser } from '@/lib/auth-local';
import { authService } from '@/services';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const currentToken = getAuthToken();
    const currentUser = getCurrentUser();
    const authStatus = isAuthenticated();
    
    setToken(currentToken);
    setUser(currentUser);
    setAuthenticated(authStatus);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.data && response.data.jwt) {
        // El token ya se guarda en la cookie en loginApi
        const newToken = getAuthToken();
        const newUser = getCurrentUser() || { email, password: '', name: email };
        
        setToken(newToken);
        setUser(newUser);
        setAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    logoutApi();
    logoutUser();
    
    setToken(null);
    setUser(null);
    setAuthenticated(false);
  };

  const refreshAuth = () => {
    const currentToken = getAuthToken();
    const currentUser = getCurrentUser();
    const authStatus = isAuthenticated();
    
    setToken(currentToken);
    setUser(currentUser);
    setAuthenticated(authStatus);
  };

  const verifyToken = async (): Promise<boolean> => {
    try {
      const response = await authService.verifyToken();
      const isValid = response.data.valid;
      
      if (!isValid) {
        logout();
      }
      
      return isValid;
    } catch (error) {
      logout();
      return false;
    }
  };

  const getProfile = async () => {
    try {
      const response = await authService.getProfile();
      return response.data.user;
    } catch (error) {
      throw error;
    }
  };

  return {
    token,
    user,
    loading,
    authenticated,
    login,
    logout,
    refreshAuth,
    verifyToken,
    getProfile
  };
}
