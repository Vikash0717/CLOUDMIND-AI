import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import fs from 'fs';
import crypto from 'crypto';

const router = Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get('/', async (req: AuthRequest, res) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' }
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching files' });
  }
});

router.post('/upload', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, size, mimetype, filename, path: uploadedFilePath } = req.file;


      const file = await prisma.file.create({
        data: {
          name: originalname,
          path: filename,
          size,
          type: mimetype,
          userId: req.userId!,
          category: getCategoryFromMime(mimetype, originalname)
        }
      });

    await prisma.activity.create({
      data: {
        description: `Uploaded file ${originalname}`,
        userId: req.userId!
      }
    });

    res.status(201).json(file);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

router.get('/download/:id', async (req: AuthRequest, res) => {
  try {
    const fileId = String(req.params.id);
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId: req.userId! }
    });

    if (!file) return res.status(404).json({ error: 'File not found' });

    const filePath = path.join(__dirname, '../../uploads', file.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Physical file not found' });
    }

    try {
        await prisma.activity.create({
            data: {
              description: `Downloaded file ${file.name}`,
              userId: req.userId!
            }
        });
    } catch (e) {
        // silent fail for analytics logging to not disrupt download
    }

    res.download(filePath, file.name);
  } catch (error) {
    console.error('Download Error:', error);
    res.status(500).json({ error: 'Error downloading file' });
  }
});

const getCategoryFromMime = (mime: string, name: string) => {
  const n = name.toLowerCase();
  if (n.includes('invoice') || n.includes('finance') || n.includes('budget') || n.includes('bill') || n.includes('receipt')) return 'Finance';
  if (n.includes('cert') || n.includes('degree') || n.includes('edu') || n.includes('assignment') || n.includes('syllabus')) return 'Education';
  if (n.includes('report') || n.includes('presentation') || n.includes('resume') || n.includes('meeting') || n.includes('work')) return 'Work';
  if (n.includes('photo') || n.includes('family') || n.includes('vacation') || n.includes('trip') || n.includes('personal')) return 'Personal';
  
  if (mime.startsWith('image/')) return 'Images';
  if (mime.startsWith('video/')) return 'Videos';
  if (mime.includes('pdf') || mime.includes('doc') || mime.includes('text')) return 'Documents';
  
  return 'Others';
};

export default router;
