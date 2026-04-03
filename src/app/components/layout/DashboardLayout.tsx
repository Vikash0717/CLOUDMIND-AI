import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { AIChatWidget } from '../ai-chat/AIChatWidget';

export function DashboardLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 min-h-screen">
      <Sidebar />
      <TopNav />
      <main className="ml-64 pt-16">
        <div className="p-6 animate-slide-up">
          <Outlet />
        </div>
      </main>
      <AIChatWidget />
    </div>
  );
}