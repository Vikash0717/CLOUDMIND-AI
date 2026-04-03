import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    // In a real app we'd calculate these accurately.
    const fileCount = await prisma.file.count({ where: { userId } });
    const folderCount = await prisma.folder.count({ where: { userId } });
    
    // Calculate storage used
    const files = await prisma.file.findMany({ where: { userId }, select: { size: true } });
    const totalSizeBytes = files.reduce((acc, file) => acc + file.size, 0);
    const storageUsedGB = (totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);

    res.json({
      stats: {
        totalFiles: fileCount,
        totalFolders: folderCount,
        storageUsed: `${storageUsedGB} GB`,
        aiOptimizations: Math.floor(Math.random() * 200), // Dummy data for AI opts
      },
      recentFiles: await prisma.file.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

export default router;
