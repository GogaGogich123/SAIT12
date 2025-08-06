import React, { createContext, useContext, useState } from 'react';
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

  useEffect(() => {
    // Проверяем текущую сессию при загрузке
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleSupabaseUser(session.user);
      }
    };
    
    checkSession();
    
    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleSupabaseUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleSupabaseUser = async (authUser: any) => {
    try {
      // Получаем данные кадета из базы
      const { data: cadetData, error: cadetError } = await supabase
        .from('cadets')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (!cadetError && cadetData) {
        setUser({
          id: authUser.id,
          name: cadetData.name,
          role: 'cadet',
          platoon: cadetData.platoon,
          squad: cadetData.squad,
          cadetId: cadetData.id
        });
        return true;
      }
      
      // Проверяем, может быть это администратор
      if (authUser.email === 'admin@nkkk.ru') {
        setUser({
          id: authUser.id,
          name: 'Администратор',
          role: 'admin'
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error handling Supabase user:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Попытка входа через Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authData.user) {
        return await handleSupabaseUser(authData.user);
      }

      // Если Supabase не сработал, пробуем mock данные
      if (authError) {
        console.log('Supabase auth error, trying mock login:', authError.message);
      }
      return mockLogin(email, password);
    } catch (error) {
      console.error('Login error:', error);
      return mockLogin(email, password);
    }
  };

  const mockLogin = (email: string, password: string): boolean => {
    if (email === 'admin@nkkk.ru' && password === 'admin123') {
      setUser({
        id: '1',
        name: 'Администратор Иванов И.И.',
        role: 'admin'
      });
      return true;
    } else if (email === 'cadet@nkkk.ru' && password === 'cadet123') {
      setUser({
        id: 'cadet1',
        name: 'Петров Алексей Владимирович',
        role: 'cadet',
        platoon: '10-1',
        squad: 2,
        cadetId: 'cadet1'
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    // Выход из Supabase Auth
    supabase.auth.signOut().catch(console.error);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};