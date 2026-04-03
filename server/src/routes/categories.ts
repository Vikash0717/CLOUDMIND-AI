import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const grouped = await prisma.file.groupBy({
      by: ['category'],
      where: { userId },
      _count: { _all: true },
      _sum: { size: true }
    });
    
    res.json(grouped);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

router.post('/auto-categorize', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const files = await prisma.file.findMany({ where: { userId, category: 'Uncategorized' } });
    
    let updated = 0;
    for (const file of files) {
      // Basic rule based categories similar to upload rules
      let category = 'Others';
      const type = file.type.toLowerCase();
      const name = file.name.toLowerCase();

      if (type.startsWith('image/')) category = 'Images';
      else if (type.startsWith('video/')) category = 'Videos';
      else if (type.includes('pdf') || type.includes('doc') || type.includes('text')) category = 'Documents';
      else if (name.includes('invoice') || name.includes('finance') || name.includes('budget')) category = 'Finance';
      else if (type.includes('js') || type.includes('code') || type.includes('json')) category = 'Code';
      else if (type.includes('audio')) category = 'Music';

      await prisma.file.update({
        where: { id: file.id },
        data: { category }
      });
      updated++;
    }

    res.json({ success: true, updated });
  } catch(error) {
    console.error('Categorize error:', error);
    res.status(500).json({ error: 'Failed to categorize files' });
  }
});

export default router;
