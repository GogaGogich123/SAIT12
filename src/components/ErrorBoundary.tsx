import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Отправка ошибки в сервис мониторинга (например, Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Здесь можно добавить отправку ошибки в сервис мониторинга
      console.error('Production error:', { error, errorInfo });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };
  
  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.handleReset} />;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
          <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-md">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Что-то пошло не так</h2>
            <p className="text-blue-200 mb-6">
              Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 p-4 bg-red-900/20 rounded-lg">
                <summary className="cursor-pointer text-red-300 font-semibold mb-2">
                  Детали ошибки (только в режиме разработки)
                </summary>
                <pre className="text-xs text-red-200 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex space-x-4">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                <span>Попробовать снова</span>
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Перезагрузить</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;