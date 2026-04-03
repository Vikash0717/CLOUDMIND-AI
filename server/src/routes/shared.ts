import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import nodemailer from 'nodemailer';
import path from 'path';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Files shared with me
    const sharedWithMe = await prisma.sharedFile.findMany({
      where: { sharedWith: user.email },
      include: {
        file: true,
        userBy: { select: { name: true, email: true } }
      }
    });

    // Files I've shared
    const sharedByMe = await prisma.sharedFile.findMany({
      where: { sharedBy: req.userId! },
      include: {
        file: true
      }
    });

    res.json({ sharedWithMe, sharedByMe });
  } catch (error) {
    console.error('Shared API error:', error);
    res.status(500).json({ error: 'Failed to fetch shared files' });
  }
});

router.post('/share', async (req: AuthRequest, res) => {
  try {
    const { fileId, email, permission } = req.body;
    
    // Check if the file exists and is owned by user
    const file = await prisma.file.findFirst({ where: { id: fileId, userId: req.userId! } });
    if (!file) return res.status(404).json({ error: 'File not found' });

    const share = await prisma.sharedFile.create({
      data: {
        fileId: file.id,
        sharedBy: req.userId!,
        sharedWith: email,
        permission: permission || 'Can View'
      }
    });

    // Attempt to send the email with the file attached
    // Attempt to send the email with the file attached
    try {
      const filePath = path.join(__dirname, '../../uploads', file.path);
      
      if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        // Send using Gmail
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"CloudMind Team" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: `A file has been shared with you: ${file.name}`,
          text: `Hello,\n\nA new file "${file.name}" has been shared with you on CloudMind.\nPermission: ${permission || 'Can View'}\n\nPlease find the file attached.`,
          attachments: [{ filename: file.name, path: filePath }],
        });
        console.log(`Email successfully sent to ${email} for file ${file.name}`);
      } else {
        // Fallback to Test Email (Ethereal) so user doesn't need to configure credentials!
        console.log('No Gmail credentials found. Generating test Ethereal account...');
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await transporter.sendMail({
          from: '"CloudMind Test" <test@cloudmind.local>',
          to: email,
          subject: `[TEST] A file has been shared with you: ${file.name}`,
          text: `Hello,\n\nA new file "${file.name}" has been shared with you on CloudMind.\nPermission: ${permission || 'Can View'}\n\nPlease find the file attached.`,
          attachments: [{ filename: file.name, path: filePath }],
        });
        
        console.log('Test email successfully sent!');
        console.log('=============================================');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        console.log('=============================================');
      }
    } catch (emailError) {
      console.error('Failed to send sharing email:', emailError);
    }

    res.status(201).json(share);
  } catch (error) {
    console.error('Share Error:', error);
    res.status(500).json({ error: 'Failed to share file' });
  }
});

export default router;
