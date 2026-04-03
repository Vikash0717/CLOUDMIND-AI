import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, HardDrive, Upload, Download } from 'lucide-react';

// Removed static arrays, using state inside component

export function AnalyticsView() {
  const [uploadData, setUploadData] = useState<any[]>([]);
  const [storageData, setStorageData] = useState<any[]>([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalStorage: '0 GB', storageChange: '+0%', 
    filesUploaded: '0', uploadedChange: '+0%',
    downloads: '0', downloadsChange: '+0%',
    growthRate: '0 GB/mo', growthChange: '+0%'
  });

  useEffect(() => {
    api.get('/analytics').then(res => {
      if (res.data) {
        setUploadData(res.data.uploadData || []);
        setStorageData(res.data.storageData || []);
        setMonthlyGrowth(res.data.monthlyGrowth || []);
        if (res.data.summary) setSummary(res.data.summary);
      }
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your storage usage and file activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Storage',
            value: summary.totalStorage,
            change: summary.storageChange,
            icon: HardDrive,
            color: 'blue',
          },
          {
            title: 'Files Uploaded',
            value: summary.filesUploaded,
            change: summary.uploadedChange,
            icon: Upload,
            color: 'green',
          },
          {
            title: 'Downloads',
            value: summary.downloads,
            change: summary.downloadsChange,
            icon: Download,
            color: 'purple',
          },
          {
            title: 'Growth Rate',
            value: summary.growthRate,
            change: summary.growthChange,
            icon: TrendingUp,
            color: 'orange',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-md dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {stat.change} this month
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}
                  >
                    <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Upload & Download Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={uploadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="uploads" fill="#3B82F6" name="Uploads" radius={[4, 4, 0, 0]} />
                <Bar dataKey="downloads" fill="#A855F7" name="Downloads" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Storage by File Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}GB`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Storage Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="storage"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Storage (GB)"
                dot={{ fill: '#3B82F6', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Most Active Hours
            </h3>
            <div className="space-y-3">
              {['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM', '7:00 PM - 9:00 PM'].map(
                (time, index) => (
                  <div key={time} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{time}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {35 - index * 5} files
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Top File Types
            </h3>
            <div className="space-y-3">
              {['PDF Documents', 'JPEG Images', 'MP4 Videos'].map((type, index) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {145 - index * 30}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Uploaded', count: 24 },
                { action: 'Downloaded', count: 18 },
                { action: 'Shared', count: 12 },
              ].map((item) => (
                <div key={item.action} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.action}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.count} today
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
