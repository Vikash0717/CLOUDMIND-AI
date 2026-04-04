import { useState, useEffect } from 'react';
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
import api from '../../../lib/api';

export function StorageOptimizationView() {
  const [data, setData] = useState({
    duplicateFiles: [] as any[],
    largeFiles: [] as any[],
    optimizationSuggestions: [] as any[],
    metrics: { duplicateSavingsBytes: 0, oldFilesSavingsBytes: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedArchives, setSelectedArchives] = useState<Set<string>>(new Set());

  const fetchOptimizationData = async () => {
    try {
      const response = await api.get('/optimization');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch optimization data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizationData();
  }, []);

  const totalSavingsGB = ((data.metrics.duplicateSavingsBytes + data.metrics.oldFilesSavingsBytes) / (1024 * 1024 * 1024)).toFixed(2);

  const handleBulkDelete = async (ids: string[]) => {
    try {
      if (ids.length === 0) return;
      await api.post(`/optimization/bulk-delete`, { ids });
      fetchOptimizationData();
      setSelectedArchives(new Set());
    } catch (error) {
      console.error('Failed to bulk delete', error);
      alert('Failed to delete files');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Scanning your cloud storage for optimizations...</div>;

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
                <strong>{totalSavingsGB} GB</strong> of space!
              </p>
              <div className="flex gap-3">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to permanently delete all duplicate and old files? This action cannot be undone.')) {
                        const duplicateIds = data.duplicateFiles.flatMap((f: any) => f.ids.slice(1));
                        const largeIds = data.largeFiles.map((f: any) => f.id);
                        await handleBulkDelete([...duplicateIds, ...largeIds]);
                    }
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Optimize Now
                </Button>
                <Button
                  variant="outline"
                  className="dark:border-gray-600 dark:text-gray-300"
                  onClick={() => document.getElementById('optimization-content')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Review Suggestions
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div id="optimization-content" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  Dynamically Calculated
                </span>
              </div>
              <Progress value={45} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalSavingsGB} GB</p>
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
              {data.optimizationSuggestions.map((suggestion: any) => {
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
              onClick={() => {
                const duplicateIds = data.duplicateFiles.flatMap((f: any) => f.ids.slice(1));
                handleBulkDelete(duplicateIds);
              }}
            >
              Delete All Duplicates
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.duplicateFiles.length === 0 ? <p className="text-sm text-gray-500">No duplicate files found.</p> : null}
            {data.duplicateFiles.map((file: any) => (
              <div
                key={file.name}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{file.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {file.copies} copies • Wasted space: {file.totalSize}
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
                      onClick={() => {
                        if (file.ids.length > 1) {
                           handleBulkDelete(file.ids.slice(1));
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Copies
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Locations:</p>
                  {file.locations.map((location: string, index: number) => (
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
              onClick={() => handleBulkDelete(Array.from(selectedArchives))}
              disabled={selectedArchives.size === 0}
            >
              Archive Selected
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.largeFiles.length === 0 ? <p className="text-sm text-gray-500">No large or old files found.</p> : null}
            {data.largeFiles.map((file: any, index: number) => (
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
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={selectedArchives.has(file.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedArchives);
                      if (e.target.checked) newSet.add(file.id);
                      else newSet.delete(file.id);
                      setSelectedArchives(newSet);
                    }}
                  />
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
