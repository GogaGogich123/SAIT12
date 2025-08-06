import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateUser, getCadetByAuthId, type AuthUser, type LoginCredentials } from '../lib/auth';

interface User {
  id: string;
  name: string;
  role: 'cadet' | 'admin';
  platoon?: string;
  squad?: number;
  cadetId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненную сессию при загрузке
    const checkStoredSession = () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading stored session:', error);
        localStorage.removeItem('auth_user');
      } finally {
        setLoading(false);
      }
    };

    checkStoredSession();
  }, []);

  const handleAuthUser = async (authUser: AuthUser) => {
    try {
      if (authUser.role === 'cadet') {
        // Получаем данные кадета
        const cadetData = await getCadetByAuthId(authUser.id);
        console.log('Cadet data found:', cadetData);
        
        if (cadetData) {
          const userData = {
            id: authUser.id,
            name: authUser.name,
            role: 'cadet' as const,
            platoon: cadetData.platoon,
            squad: cadetData.squad,
            cadetId: cadetData.id
          };
          console.log('Setting user data:', userData);
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
          return true;
        }
      } else if (authUser.role === 'admin') {
        const userData = {
          id: authUser.id,
          name: authUser.name,
          role: 'admin' as const
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling auth user:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authUser = await authenticateUser({
        email,
        password
      });

      if (authUser) {
        return await handleAuthUser(authUser);
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };


  const logout = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};