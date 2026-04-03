import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Copy,
  Trash2,
  Archive,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HardDrive,
  Files,
} from 'lucide-react';

const duplicateFiles = [
  {
    id: '1',
    name: 'vacation-photo.jpg',
    copies: 3,
    totalSize: '12.3 MB',
    locations: ['/Photos/2024/', '/Photos/Backup/', '/Photos/Summer/'],
  },
  {
    id: '2',
    name: 'presentation-final.pptx',
    copies: 5,
    totalSize: '41.0 MB',
    locations: ['/Documents/', '/Desktop/', '/Work/', '/Backup/', '/Old Files/'],
  },
  {
    id: '3',
    name: 'invoice-template.pdf',
    copies: 2,
    totalSize: '1.2 MB',
    locations: ['/Documents/Templates/', '/Desktop/'],
  },
];

const largeFiles = [
  { name: 'project-demo-video.mp4', size: '850 MB', lastAccessed: '90 days ago', type: 'Video' },
  { name: 'database-backup-2023.sql', size: '642 MB', lastAccessed: '120 days ago', type: 'Database' },
  { name: 'design-assets.zip', size: '425 MB', lastAccessed: '60 days ago', type: 'Archive' },
  { name: 'old-project-files.zip', size: '380 MB', lastAccessed: '150 days ago', type: 'Archive' },
];

const optimizationSuggestions = [
  {
    title: 'Remove Duplicate Files',
    description: '12 duplicate files found across your storage',
    savings: '156 MB',
    icon: Copy,
    color: 'blue',
  },
  {
    title: 'Archive Old Files',
    description: '23 files not accessed in 90+ days',
    savings: '2.4 GB',
    icon: Archive,
    color: 'purple',
  },
  {
    title: 'Delete Empty Folders',
    description: '8 empty folders detected',
    savings: 'Minimal',
    icon: Trash2,
    color: 'red',
  },
  {
    title: 'Compress Large Files',
    description: '15 large files that can be compressed',
    savings: '890 MB',
    icon: Files,
    color: 'green',
  },
];

export function StorageOptimizationView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Storage Optimization
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          AI-powered tools to optimize and manage your storage
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI Optimization Available
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our AI has analyzed your storage and found opportunities to save{' '}
                <strong>3.5 GB</strong> of space!
              </p>
              <div className="flex gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Optimize Now
                </Button>
                <Button
                  variant="outline"
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  Review Suggestions
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Used Storage</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  45.2 GB / 100 GB
                </span>
              </div>
              <Progress value={45} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">3.5 GB</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">After Optimization</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">41.7 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Optimization Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {optimizationSuggestions.map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <div
                    key={suggestion.title}
                    className={`p-3 bg-${suggestion.color}-50 dark:bg-${suggestion.color}-900/20 rounded-lg`}
                  >
                    <Icon
                      className={`w-5 h-5 text-${suggestion.color}-600 dark:text-${suggestion.color}-400 mb-2`}
                    />
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Save {suggestion.savings}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Duplicate Files Detected
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="dark:border-gray-600"
            >
              Delete All Duplicates
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {duplicateFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{file.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {file.copies} copies • Total size: {file.totalSize}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="dark:border-gray-600"
                    >
                      Keep Original
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Locations:</p>
                  {file.locations.map((location, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-500 dark:text-gray-400 pl-2"
                    >
                      • {location}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Large & Old Files
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="dark:border-gray-600"
            >
              Archive Selected
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {largeFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{file.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file.size} • Last accessed {file.lastAccessed}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    {file.type}
                  </span>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Optimization Tips
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Enable auto-compression for large files',
              'Set up automatic duplicate detection',
              'Schedule monthly storage reviews',
              'Archive files older than 6 months',
            ].map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
