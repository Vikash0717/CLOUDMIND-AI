import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { FileText, Users, Clock, MoreVertical, Share2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// Replaced static mock sharedFiles with component state

export function SharedFilesView() {
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [mySharedFiles, setMySharedFiles] = useState<any[]>([]);

  useEffect(() => {
    api.get('/shared').then(res => {
      if (res.data) {
        setSharedFiles(res.data.sharedWithMe || []);
        setMySharedFiles(res.data.sharedByMe || []);
      }
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shared Files</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Files shared with you and files you've shared with others
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sharedFiles.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Shared with me</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mySharedFiles.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Shared by me</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">28</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md dark:bg-gray-800">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Shared With Me
          </h2>
          <div className="space-y-3">
            {sharedFiles.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {share.file.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-purple-600 text-white">
                            {share.userBy.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {share.userBy.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {(share.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(share.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    1
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                    {share.permission}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Open</DropdownMenuItem>
                      <DropdownMenuItem>Download</DropdownMenuItem>
                      <DropdownMenuItem>Remove Access</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md dark:bg-gray-800">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Shared By Me
          </h2>
          <div className="space-y-3">
            {mySharedFiles.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {share.file.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Shared with: {share.sharedWith}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(share.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    0 views
                  </div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                    {share.permission}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Manage Access</DropdownMenuItem>
                      <DropdownMenuItem>Copy Link</DropdownMenuItem>
                      <DropdownMenuItem>Stop Sharing</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
