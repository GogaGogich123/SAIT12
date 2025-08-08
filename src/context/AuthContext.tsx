import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateUser, getCadetByAuthId, signOut, getCurrentUser, type AuthUser } from '../lib/auth';
import { supabase } from '../lib/supabase';

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
    // Проверяем текущую сессию Supabase при загрузке
    const checkCurrentSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log('Current user found:', currentUser);
          await handleAuthUser(currentUser);
        }
      } catch (error) {
        console.error('Error checking current session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentSession();

    // Слушаем изменения состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        localStorage.removeItem('auth_user');
      } else if (event === 'SIGNED_IN' && session.user) {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          await handleAuthUser(currentUser);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthUser = async (authUser: AuthUser) => {
    try {
      console.log('Handling auth user:', authUser);
      
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
        console.log('Setting admin user data:', userData);
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
      console.log('Login attempt for:', email);
      
      const authUser = await authenticateUser({
        email,
        password
      });

      if (authUser) {
        console.log('Authentication successful:', authUser);
        return await handleAuthUser(authUser);
      }

      console.log('Authentication failed');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };


  const logout = () => {
    console.log('Logging out user');
    signOut();
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};