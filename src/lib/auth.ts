import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'cadet';
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Аутентификация через Supabase Auth
export const authenticateUser = async (credentials: LoginCredentials): Promise<AuthUser | null> => {
  try {
    console.log('Attempting to authenticate:', credentials.email);
    
    // Используем Supabase Auth для входа
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return null;
    }

    if (!authData.user) {
      console.log('No user returned from auth');
      return null;
    }

    console.log('Auth successful, user:', authData.user);

    // Получаем дополнительные данные пользователя из таблицы users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      // Если нет записи в таблице users, создаем базовую запись
      const newUser: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        role: 'cadet', // По умолчанию кадет
        name: authData.user.email!.split('@')[0]
      };
      return newUser;
    }

    console.log('User data found:', userData);

    return {
      id: authData.user.id,
      email: userData.email,
      role: userData.role,
      name: userData.name
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// Получение данных кадета по ID пользователя
export const getCadetByAuthId = async (authUserId: string) => {
  try {
    console.log('Getting cadet by auth ID:', authUserId);
    
    const { data, error } = await supabase
      .from('cadets')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return null;
    }
    
    console.log('Cadet data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching cadet by auth ID:', error);
    return null;
  }
};

// Выход из системы
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

// Получение текущего пользователя
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Получаем данные из таблицы users
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email!)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      return null;
    }

    return {
      id: user.id,
      email: userData.email,
      role: userData.role,
      name: userData.name
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};