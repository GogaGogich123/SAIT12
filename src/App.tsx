import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationToast from './components/NotificationToast';
import HomePage from './pages/HomePage';
import RatingPage from './pages/RatingPage';
import CadetProfile from './pages/CadetProfile';
import NewsPage from './pages/NewsPage';
import TasksPage from './pages/TasksPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useToast } from './hooks/useToast';

const AppContent: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen gradient-bg">
        <Header />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rating" element={<RatingPage />} />
            <Route path="/cadet/:id" element={<CadetProfile />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </AnimatePresence>
      </div>
      <NotificationToast toasts={toasts} onRemove={removeToast} />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;