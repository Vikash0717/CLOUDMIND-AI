import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FolderOpen, FileText, TrendingUp, Zap, HardDrive } from 'lucide-react';
import { Progress } from '../ui/progress';
import api from '../../../lib/api';

export function DashboardView() {
  const [stats, setStats] = useState([
    { title: 'Total Files', value: '0', change: '+0', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Total Folders', value: '0', change: '+0', icon: FolderOpen, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Storage Used', value: '0 GB', change: '0%', icon: HardDrive, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'AI Optimizations', value: '0', change: '+0', icon: Zap, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  ]);

  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/stats');
        const s = statsRes.data.stats;
        
        setStats([
          { title: 'Total Files', value: s.totalFiles.toString(), change: '+0%', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
          { title: 'Total Folders', value: s.totalFolders.toString(), change: '+0%', icon: FolderOpen, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
          { title: 'Storage Used', value: s.storageUsed, change: '0%', icon: HardDrive, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
          { title: 'AI Optimizations', value: s.aiOptimizations.toString(), change: '+0', icon: Zap, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
        ]);

        if (statsRes.data.recentFiles) {
           setRecentFiles(statsRes.data.recentFiles.map((f: any) => ({
             name: f.name,
             type: f.type,
             size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
             time: new Date(f.createdAt).toLocaleDateString(),
             category: f.category
           })));
        }

        const aiRes = await api.get('/ai/insights');
        if (aiRes.data?.insights) setAiInsights(aiRes.data.insights);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's an overview of your cloud storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`border-0 shadow-smooth dark:bg-gray-800 hover-lift card-3d stagger-item`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Recent Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFiles.length === 0 ? (
                <p className="text-sm text-gray-500">No recent files</p>
              ) : recentFiles.map((file) => (
                <div key={file.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{file.size} • {file.time}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    {file.category}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.length === 0 ? (
                <p className="text-sm text-gray-500">Loading insights...</p>
              ) : aiInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{insight.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2">
                    {insight.action} →
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-sm">Storage Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Documents</span>
                <span className="text-gray-900 dark:text-white">15 GB</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Images</span>
                <span className="text-gray-900 dark:text-white">12 GB</span>
              </div>
              <Progress value={24} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Videos</span>
                <span className="text-gray-900 dark:text-white">18 GB</span>
              </div>
              <Progress value={36} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-0 shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: FileText, label: 'Upload File', color: 'blue' },
                { icon: FolderOpen, label: 'New Folder', color: 'purple' },
                { icon: Zap, label: 'AI Search', color: 'orange' },
                { icon: TrendingUp, label: 'Analytics', color: 'green' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.label} className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-center">
                    <Icon className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400 mx-auto mb-2`} />
                    <p className="text-xs text-gray-700 dark:text-gray-300">{action.label}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}