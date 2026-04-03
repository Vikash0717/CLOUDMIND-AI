import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { FilesView } from './components/files/FilesView';
import { AISearchView } from './components/ai-search/AISearchView';
import { CategoriesView } from './components/categories/CategoriesView';
import { SharedFilesView } from './components/shared/SharedFilesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { StorageOptimizationView } from './components/storage/StorageOptimizationView';
import { SettingsView } from './components/settings/SettingsView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardView />,
      },
      {
        path: 'files',
        element: <FilesView />,
      },
      {
        path: 'ai-search',
        element: <AISearchView />,
      },
      {
        path: 'categories',
        element: <CategoriesView />,
      },
      {
        path: 'shared',
        element: <SharedFilesView />,
      },
      {
        path: 'analytics',
        element: <AnalyticsView />,
      },
      {
        path: 'storage',
        element: <StorageOptimizationView />,
      },
      {
        path: 'settings',
        element: <SettingsView />,
      },
    ],
  },
]);
