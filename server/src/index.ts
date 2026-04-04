import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import statsRoutes from './routes/stats';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import categoriesRoutes from './routes/categories';
import sharedRoutes from './routes/shared';
import optimizationRoutes from './routes/optimization';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/shared', sharedRoutes);
app.use('/api/optimization', optimizationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
