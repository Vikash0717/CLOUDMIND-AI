import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  Grid3x3,
  Share2,
  BarChart3,
  HardDrive,
  Settings,
  Cloud,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FolderOpen, label: 'My Files', path: '/files' },
  { icon: Sparkles, label: 'AI Search', path: '/ai-search' },
  { icon: Grid3x3, label: 'Categories', path: '/categories' },
  { icon: Share2, label: 'Shared Files', path: '/shared' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: HardDrive, label: 'Storage Optimization', path: '/storage' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 flex flex-col shadow-smooth">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="relative">
            <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400 transition-smooth group-hover:scale-110" />
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg gradient-text-blue">CloudMind AI</h1>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce-subtle' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 glass-effect">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Need more storage?
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Upgrade to premium for unlimited space
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm py-2 rounded-lg transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}