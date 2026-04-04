import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import api from '../../../lib/api';
import { toast } from 'sonner';
import {
  Upload, Grid3x3, List, FileText, Image as ImageIcon, Video, Music,
  File, MoreVertical, Star, Download, Trash2, Share2,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ShareFileModal } from '../modals/ShareFileModal';

interface FileItem {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadDate: string;
  starred: boolean;
}

export function FilesView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data.map((f: any) => ({
        id: f.id,
        name: f.name,
        type: categorizeType(f.category),
        size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadDate: f.createdAt,
        starred: false
      })));
    } catch (error) {
      toast.error('Failed to load files');
    }
  };

  const categorizeType = (cat: string) => {
    const lcat = cat.toLowerCase();
    if (lcat.includes('image')) return 'image';
    if (lcat.includes('video')) return 'video';
    if (lcat.includes('audio')) return 'audio';
    if (lcat.includes('document')) return 'document';
    return 'other';
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so the exact same file can be selected again immediately
    e.target.value = '';

    const formData = new FormData();
    formData.append('file', file);
    
    toast.promise(
      api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      {
        loading: 'Uploading file...',
        success: (res) => {
          fetchFiles(); // reload
          return 'File uploaded successfully';
        },
        error: (err: any) => err.response?.data?.error || 'Failed to upload file',
      }
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      default: return File;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'document': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'image': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'video': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'audio': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  const handleShare = (file: FileItem) => {
    setSelectedFile(file);
    setIsShareModalOpen(true);
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const res = await api.get(`/files/download/${file.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const toggleStar = (id: string) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, starred: !file.starred } : file))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Files</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and organize your files with AI-powered tools
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
          <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {files.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover-lift transition-smooth cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <CardContent className="p-12 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-bounce-subtle" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Drag and drop files here</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse your computer</p>
            <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 hover-glow">Browse Files</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(
            files.reduce((acc, file) => {
              const cat = file.category || 'Uncategorized';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(file);
              return acc;
            }, {} as Record<string, FileItem[]>)
          ).sort(([a], [b]) => a === 'Uncategorized' ? -1 : a.localeCompare(b)).map(([category, categoryFiles]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                   📂 {category} ({categoryFiles.length})
                </h3>
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryFiles.map((file) => {
                    const Icon = getFileIcon(file.type);
                    const colorClasses = getFileColor(file.type);
                    return (
                      <Card key={file.id} className="border-0 shadow-md dark:bg-gray-800 hover:shadow-lg transition-shadow group relative">
                        <div className="absolute top-2 right-2 text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          {file.category}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-3 rounded-lg ${colorClasses}`}><Icon className="w-6 h-6" /></div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => toggleStar(file.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <Star className={`w-4 h-4 ${file.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                              </button>
                              <DropdownMenu>
                                <DropdownMenuTrigger className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                  <MoreVertical className="w-4 h-4 text-gray-500" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleShare(file)}><Share2 className="w-4 h-4 mr-2" /> Share</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(file)}><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">{file.name}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{file.size}</span>
                            <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-0 shadow-md dark:bg-gray-800">
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {categoryFiles.map((file) => {
                        const Icon = getFileIcon(file.type);
                        const colorClasses = getFileColor(file.type);
                        return (
                          <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${colorClasses}`}><Icon className="w-5 h-5" /></div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">{file.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                    {file.category}
                                  </span>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{file.size} • {new Date(file.uploadDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => toggleStar(file.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <Star className={`w-4 h-4 ${file.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                              </button>
                              <DropdownMenu>
                                <DropdownMenuTrigger className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                  <MoreVertical className="w-4 h-4 text-gray-500" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleShare(file)}><Share2 className="w-4 h-4 mr-2" /> Share</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(file)}><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}

      <ShareFileModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} fileName={selectedFile?.name || ''} fileId={selectedFile?.id || ''} />
    </div>
  );
}