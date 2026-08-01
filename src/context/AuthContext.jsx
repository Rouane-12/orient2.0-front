import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        // Vérifier si le token est valide en faisant une requête
        const response = await axios.get('http://localhost:5200/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        // Si le token est expiré, essayer de le rafraîchir
        if (refreshToken) {
          try {
            const newToken = await refreshAccessToken();
            if (newToken && storedUser) {
              setUser(JSON.parse(storedUser));
              setIsAuthenticated(true);
            }
          } catch (refreshError) {
            console.error('Refresh failed:', refreshError);
            logout();
          }
        } else {
          logout();
        }
      }
    }
    setLoading(false);
  };

  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post('http://localhost:5200/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      // Don't show toast on automatic logout
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('No refresh token found');
        logout();
        return false;
      }

      const response = await axios.post('http://localhost:5200/api/auth/refresh-token', {
        refreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      return accessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
