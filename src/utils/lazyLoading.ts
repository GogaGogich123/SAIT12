import { lazy } from 'react';

// Lazy loading для страниц
export const HomePage = lazy(() => import('../pages/HomePage'));
export const RatingPage = lazy(() => import('../pages/RatingPage'));
export const CadetProfile = lazy(() => import('../pages/CadetProfile'));
export const NewsPage = lazy(() => import('../pages/NewsPage'));
export const TasksPage = lazy(() => import('../pages/TasksPage'));
export const LoginPage = lazy(() => import('../pages/LoginPage'));
export const AdminPage = lazy(() => import('../pages/AdminPage'));

// Lazy loading для компонентов
export const AnimatedSVGBackground = lazy(() => import('../components/AnimatedSVGBackground'));
export const NewsModal = lazy(() => import('../components/news/NewsModal'));
export const AchievementModal = lazy(() => import('../components/admin/modals/AchievementModal'));
export const ScoreModal = lazy(() => import('../components/admin/modals/ScoreModal'));