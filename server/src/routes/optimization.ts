import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

const router = Router();
router.use(authenticate);

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getDaysAgo(date: Date) {
  const diffTime = Math.abs(new Date().getTime() - new Date(date).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    // Get all files for the user
    const files = await prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // 1. Detect Duplicates
    // We'll group by size first, then filename to be safe
    const sizeGroups: Record<number, any[]> = {};
    files.forEach(f => {
      if (!sizeGroups[f.size]) sizeGroups[f.size] = [];
      sizeGroups[f.size].push(f);
    });

    const duplicateFiles: any[] = [];
    let duplicateSavingsBytes = 0;

    for (const sizeStr in sizeGroups) {
      const gSize = sizeGroups[sizeStr];
      if (gSize && gSize.length > 1) {
        // Find exact name matches within the same size Group
        const nameGroups: Record<string, any[]> = {};
        gSize.forEach(f => {
          const nameLower = f.name.toLowerCase();
          if (!nameGroups[nameLower]) nameGroups[nameLower] = [];
          nameGroups[nameLower].push(f);
        });

        for (const name in nameGroups) {
          const nGroup = nameGroups[name];
          if (nGroup && nGroup.length > 1) {
            const copies = nGroup.length;
            const sizeNum = Number(sizeStr);
            const totalSizeBytes = sizeNum * (copies - 1); // space we can save
            duplicateSavingsBytes += totalSizeBytes;

            duplicateFiles.push({
              name: nGroup[0].name,
              copies,
              totalSize: formatBytes(totalSizeBytes),
              originalSize: sizeNum,
              locations: nGroup.map(f => f.category || 'Uncategorized'),
              ids: nGroup.map(f => f.id)
            });
          }
        }
      }
    }

    // 2. Large & Old Files
    const ONE_MB = 1024 * 1024;
    const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();

    const largeFiles = files.filter(f => {
      const isLarge = f.size > 5 * ONE_MB; // > 5MB
      const isOld = (now - new Date(f.createdAt).getTime()) > NINETY_DAYS;
      return isLarge || isOld;
    }).map(f => ({
      id: f.id,
      name: f.name,
      size: formatBytes(f.size),
      lastAccessed: getDaysAgo(f.createdAt),
      type: f.category || f.type
    }));

    let oldFilesSavingsBytes = largeFiles.reduce((acc, f) => {
      const file = files.find(orig => orig.id === f.id);
      return acc + (file ? file.size : 0);
    }, 0);

    // 3. Delete Empty Folders
    const folders = await prisma.folder.findMany({
      where: { userId },
      include: { files: true }
    });
    const emptyFolders = folders.filter(f => f.files.length === 0);

    const optimizationSuggestions = [
      {
        title: 'Remove Duplicate Files',
        description: `${duplicateFiles.length} duplicate files found across your storage`,
        savings: formatBytes(duplicateSavingsBytes),
        icon: 'Copy',
        color: 'blue',
      },
      {
        title: 'Archive Old Files',
        description: `${largeFiles.length} files not accessed recently or very large`,
        savings: formatBytes(oldFilesSavingsBytes),
        icon: 'Archive',
        color: 'purple',
      },
      {
        title: 'Delete Empty Folders',
        description: `${emptyFolders.length} empty folders detected`,
        savings: 'Minimal',
        icon: 'Trash2',
        color: 'red',
      }
    ];

    res.json({
      duplicateFiles,
      largeFiles,
      optimizationSuggestions,
      metrics: {
        duplicateSavingsBytes,
        oldFilesSavingsBytes
      }
    });

  } catch (error) {
    console.error('Optimization fetch error:', error);
    res.status(500).json({ error: 'Error fetching optimization data' });
  }
});

router.delete('/file/:id', async (req: AuthRequest, res) => {
    try {
      const fileId = String(req.params.id);
      const file = await prisma.file.findFirst({
        where: { id: fileId, userId: req.userId! }
      });
      
      if (!file) return res.status(404).json({ error: 'File not found' });
      
      const filePath = path.join(__dirname, '../../uploads', file.path);
      if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
      }
      
      await prisma.file.delete({ where: { id: file.id } });
      
      res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting file' });
    }
});

router.post('/bulk-delete', async (req: AuthRequest, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid ids provided' });

      // Find files that belong to this user
      const files = await prisma.file.findMany({
        where: { 
          id: { in: ids },
          userId: req.userId!
        }
      });

      let deletedCount = 0;
      for (const file of files) {
          const filePath = path.join(__dirname, '../../uploads', file.path);
          if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
          }
          await prisma.file.delete({ where: { id: file.id } });
          deletedCount++;
      }

      res.json({ success: true, deletedCount });
    } catch (error) {
       console.error('Bulk delete error:', error);
       res.status(500).json({ error: 'Error in bulk deletion' });
    }
});

export default router;
