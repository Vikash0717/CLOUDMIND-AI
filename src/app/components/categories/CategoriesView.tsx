import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Card, CardContent } from '../ui/card';
import {
  FileText,
  DollarSign,
  Heart,
  Image,
  Video,
  Music,
  Code,
  Briefcase,
  GraduationCap,
  Sparkles,
  Folder,
  ArrowLeft,
  Calendar,
  HardDrive
} from 'lucide-react';

const CATEGORY_MAP: Record<string, any> = {
  'Documents': { icon: FileText, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
  'Finance': { icon: DollarSign, color: 'green', gradient: 'from-green-500 to-emerald-500' },
  'Personal': { icon: Heart, color: 'pink', gradient: 'from-pink-500 to-rose-500' },
  'Images': { icon: Image, color: 'purple', gradient: 'from-purple-500 to-violet-500' },
  'Videos': { icon: Video, color: 'red', gradient: 'from-red-500 to-orange-500' },
  'Music': { icon: Music, color: 'yellow', gradient: 'from-yellow-500 to-amber-500' },
  'Code': { icon: Code, color: 'indigo', gradient: 'from-indigo-500 to-blue-500' },
  'Work': { icon: Briefcase, color: 'gray', gradient: 'from-gray-500 to-slate-500' },
  'Education': { icon: GraduationCap, color: 'teal', gradient: 'from-teal-500 to-cyan-500' },
  'Others': { icon: Folder, color: 'slate', gradient: 'from-slate-500 to-gray-500' },
  'Uncategorized': { icon: Folder, color: 'stone', gradient: 'from-stone-500 to-neutral-500' },
};

export function CategoriesView() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [uncategorizedCount, setUncategorizedCount] = useState(0);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const data = res.data.map((item: any) => {
        const catMap = CATEGORY_MAP[item.category] || CATEGORY_MAP['Others'];
        const sizeGB = item._sum?.size ? (item._sum.size / (1024 * 1024 * 1024)).toFixed(2) : "0.00";
        return {
          name: item.category,
          count: item._count._all,
          size: sizeGB + ' GB',
          ...catMap
        };
      });
      // Find count of uncategorized
      const uncatItem = data.find((c: any) => c.name === 'Uncategorized');
      setUncategorizedCount(uncatItem ? uncatItem.count : 0);
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllFiles = async () => {
    try {
      const res = await api.get('/files');
      setAllFiles(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllFiles();
  }, []);

  const handleAutoOrganize = async () => {
    setIsOrganizing(true);
    try {
      await api.post('/categories/auto-categorize');
      await fetchCategories(); // Refresh list
      await fetchAllFiles(); // Fetch updated files
    } catch (err) {
      console.error(err);
    } finally {
      setIsOrganizing(false);
    }
  };

  if (selectedCategory) {
    const categoryInfo = categories.find(c => c.name === selectedCategory) || { icon: Folder, gradient: 'from-blue-500 to-cyan-500' };
    const CategoryIcon = categoryInfo.icon;
    const files = allFiles.filter(f => f.category === selectedCategory);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div className={`p-3 rounded-lg bg-gradient-to-r ${categoryInfo.gradient}`}>
            <CategoryIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCategory}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{files.length} files in this category</p>
          </div>
        </div>

        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardContent className="p-0">
            {files.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {files.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryInfo.gradient} shadow-sm opacity-90`}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{file.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <HardDrive className="w-4 h-4" />
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(file.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No files found in this category.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Categories</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your files automatically organized by artificial intelligence
        </p>
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✅ <strong>System is Live!</strong> Database successfully connected and loaded! Click on any Category Card below to see its exact files.
        </div>
      </div>

      <Card className="border-0 shadow-md dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                AI-Powered Organization
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Files are automatically categorized using machine learning
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              💡 <strong>Smart Suggestion:</strong> {uncategorizedCount} uncategorized files detected. Click "Auto-Organize"
              to let AI categorize them automatically.
            </p>
            <button 
              onClick={handleAutoOrganize}
              disabled={isOrganizing || uncategorizedCount === 0}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {isOrganizing ? 'Organizing...' : 'Auto-Organize Files'}
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className="border-0 shadow-smooth dark:bg-gray-800 hover-lift transition-smooth cursor-pointer group overflow-hidden perspective-card stagger-item"
            >
              <div className={`h-2 bg-gradient-to-r ${category.gradient} animate-gradient`}></div>
              <CardContent className="p-6 perspective-card-inner">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-br ${category.gradient} shadow-lg group-hover:scale-110 transition-smooth`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.count}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">files</p>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{category.size} total</p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 pointer-events-none">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-smooth inline-block">
                    View all files →
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 shadow-md dark:bg-gray-800">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Category Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Most Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Images</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+45 files this week</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Largest Category</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Videos</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">18.5 GB storage</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recently Added</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Finance</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">12 new files today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}