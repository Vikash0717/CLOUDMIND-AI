import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    // Fallback/Mock logic since we might not have a lot of user history
    // Real implementation would group activity by date/time
    const uploadData = [
      { name: 'Mon', uploads: 12, downloads: 8 },
      { name: 'Tue', uploads: 19, downloads: 14 },
      { name: 'Wed', uploads: 15, downloads: 11 },
      { name: 'Thu', uploads: 22, downloads: 18 },
      { name: 'Fri', uploads: 28, downloads: 21 },
      { name: 'Sat', uploads: 10, downloads: 15 },
      { name: 'Sun', uploads: 8, downloads: 12 },
    ];

    const storageData = [
      { name: 'Documents', value: 15, color: '#3B82F6' },
      { name: 'Images', value: 12, color: '#A855F7' },
      { name: 'Videos', value: 18, color: '#EF4444' },
      { name: 'Audio', value: 4, color: '#10B981' },
      { name: 'Other', value: 6, color: '#F59E0B' },
    ];

    const monthlyGrowth = [
      { month: 'Jan', storage: 20 },
      { month: 'Feb', storage: 28 },
      { month: 'Mar', storage: 35 },
      { month: 'Apr', storage: 42 },
      { month: 'May', storage: 45 },
    ];

    res.json({
        uploadData,
        storageData,
        monthlyGrowth,
        summary: {
           totalStorage: '45.2 GB',
           storageChange: '+12%',
           filesUploaded: '124',
           uploadedChange: '+8%',
           downloads: '89',
           downloadsChange: '+15%',
           growthRate: '2.4 GB/mo',
           growthChange: '+5%'
        }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

export default router;
