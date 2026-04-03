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

    // Duplicate detection based on content
    const existingFilesWithSameSize = await prisma.file.findMany({
      where: {
        userId: req.userId!,
        size: size
      }
    });

    let isDuplicate = false;
    if (existingFilesWithSameSize.length > 0) {
      const newFileBuffer = fs.readFileSync(uploadedFilePath);
      const newFileHash = crypto.createHash('md5').update(newFileBuffer).digest('hex');

      for (const existingFile of existingFilesWithSameSize) {
        const existingPath = path.join(__dirname, '../../uploads', existingFile.path);
        if (fs.existsSync(existingPath)) {
          const existingBuffer = fs.readFileSync(existingPath);
          const existingHash = crypto.createHash('md5').update(existingBuffer).digest('hex');
          if (newFileHash === existingHash) {
            isDuplicate = true;
            break;
          }
        }
      }
    }

    if (isDuplicate) {
      fs.unlinkSync(uploadedFilePath);
      return res.status(409).json({ error: 'Duplicate file detected. This file has already been uploaded.' });
    }

    const file = await prisma.file.create({
      data: {
        name: originalname,
        path: filename,
        size,
        type: mimetype,
        userId: req.userId!,
        category: getCategoryFromMime(mimetype)
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

    res.download(filePath, file.name);
  } catch (error) {
    console.error('Download Error:', error);
    res.status(500).json({ error: 'Error downloading file' });
  }
});

const getCategoryFromMime = (mime: string) => {
  if (mime.startsWith('image/')) return 'Images';
  if (mime.startsWith('video/')) return 'Videos';
  if (mime.includes('pdf')) return 'Documents';
  if (mime.includes('word') || mime.includes('document')) return 'Documents';
  return 'Others';
};

export default router;
