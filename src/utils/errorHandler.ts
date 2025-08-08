// Централизованная обработка ошибок
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export const createError = (code: string, message: string, details?: any): AppError => ({
  code,
  message,
  details
});

export const handleSupabaseError = (error: any): AppError => {
  console.error('Supabase error:', error);
  
  // Обработка специфичных ошибок Supabase
  switch (error.code) {
    case 'PGRST116':
      return createError('NOT_FOUND', 'Запрашиваемые данные не найдены');
    case '23505':
      return createError('DUPLICATE', 'Запись с такими данными уже существует');
    case '23503':
      return createError('FOREIGN_KEY', 'Нарушение связи данных');
    case '42501':
      return createError('PERMISSION_DENIED', 'Недостаточно прав для выполнения операции');
    default:
      return createError('DATABASE_ERROR', error.message || 'Ошибка базы данных', error);
  }
};

export const handleAuthError = (error: any): AppError => {
  console.error('Auth error:', error);
  
  switch (error.message) {
    case 'Invalid login credentials':
      return createError('INVALID_CREDENTIALS', 'Неверный email или пароль');
    case 'Email not confirmed':
      return createError('EMAIL_NOT_CONFIRMED', 'Подтвердите email для входа');
    case 'Too many requests':
      return createError('TOO_MANY_REQUESTS', 'Слишком много попыток входа. Попробуйте позже');
    default:
      return createError('AUTH_ERROR', 'Ошибка авторизации', error);
  }
};

// Функция для безопасного логирования (без чувствительных данных)
export const safeLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    const sanitizedData = data ? sanitizeLogData(data) : undefined;
    console.log(message, sanitizedData);
  }
};

const sanitizeLogData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth'];
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
};