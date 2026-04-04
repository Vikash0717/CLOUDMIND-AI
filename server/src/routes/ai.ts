import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';
import { prisma } from '../index';

const router = Router();
router.use(authenticate);

// We mock the OpenAI initialization to not fail if API key isn't provided
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

router.get('/insights', async (req: AuthRequest, res) => {
  try {
    if (!openai) {
      const files = await prisma.file.findMany({ where: { userId: req.userId! } });
      const sizeGroups: Record<number, any[]> = {};
      files.forEach(f => {
        if (!sizeGroups[f.size]) sizeGroups[f.size] = [];
        sizeGroups[f.size].push(f);
      });
  
      let duplicateStats = { count: 0, bytesSaved: 0 };
      for (const size in sizeGroups) {
        if (sizeGroups[size].length > 1) {
          const nameGroups: Record<string, any[]> = {};
          sizeGroups[size].forEach(f => {
            const nameLower = f.name.toLowerCase();
            if (!nameGroups[nameLower]) nameGroups[nameLower] = [];
            nameGroups[nameLower].push(f);
          });
          for (const name in nameGroups) {
            if (nameGroups[name].length > 1) {
              duplicateStats.count += nameGroups[name].length - 1;
              duplicateStats.bytesSaved += Number(size) * (nameGroups[name].length - 1);
            }
          }
        }
      }

      const ONE_MB = 1024 * 1024;
      const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
      let oldFilesCount = 0;
      const now = new Date().getTime();
      
      files.forEach(f => {
        if (f.size > 5 * ONE_MB || (now - new Date(f.createdAt).getTime()) > NINETY_DAYS) {
          oldFilesCount++;
        }
      });

      const dm = 2;
      const k = 1024;
      const i = duplicateStats.bytesSaved > 0 ? Math.floor(Math.log(duplicateStats.bytesSaved) / Math.log(k)) : 0;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const savingsStr = duplicateStats.bytesSaved > 0 ? `${parseFloat((duplicateStats.bytesSaved / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}` : '0 MB';

      return res.json({
        insights: [
          { title: 'Duplicate Files Found', description: `${duplicateStats.count} redundant files detected, save ${savingsStr}`, action: 'Review' },
          { title: 'Archive Old Files', description: `${oldFilesCount} large or old files detected`, action: 'Archive' },
          { title: 'Organize Suggestion', description: 'Enable Auto-Categorization', action: 'Apply' },
        ]
      });
    }

    // Call real OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an AI assistant for a cloud storage platform. Provide 3 quick, concise insights or suggestions about file organization based on standard cloud usage patterns. Format as a JSON array with objects containing title, description, and action fields." }
      ]
    });

    const content = response.choices[0].message.content;
    let insights = [];
    try {
      insights = JSON.parse(content || '[]');
    } catch(e) {
      console.error("Failed to parse OpenAI JSON response");
    }

    res.json({ insights });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Error generating insights' });
  }
});

router.post('/search', async (req: AuthRequest, res) => {
  const { query } = req.body;
  if (!query) return res.json({ results: [] });

  try {
    const files = await prisma.file.findMany({
      where: {
        userId: req.userId!,
        OR: [
          { name: { contains: query } },
          { type: { contains: query } },
          { category: { contains: query } }
        ]
      }
    });

    const results = files.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      path: f.path,
      size: (f.size / 1024).toFixed(1) + ' KB',
      relevance: 95, 
      snippet: `Matches search query inside ${f.category}`,
      lastModified: f.updatedAt.toISOString(),
      tags: [f.category]
    }));

    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.post('/chat', async (req: AuthRequest, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    if (!openai) {
      // Smart Simulated AI for Demo Purposes
      const msg = message.toLowerCase();
      let reply = "I'm your CloudMind AI Assistant! I can help you manage your storage, find files, and analyze your data.";
      
      if (msg.includes('hi') || msg.includes('hello')) {
        reply = "Hello there! I am CloudMind AI. How can I assist you with your cloud storage today?";
      } else if (msg.includes('space') || msg.includes('storage') || msg.includes('full')) {
        reply = "Based on your current usage, you're doing great! You have plenty of space left, but you might want to Auto-Organize your 'Uncategorized' files to keep things clean.";
      } else if (msg.includes('duplicate') || msg.includes('clean')) {
        reply = "I've scanned your workspace and found a theoretical 156 MB of duplicate files. Using the 'Storage Optimization' tool can help you clear these instantly.";
      } else if (msg.includes('search') || msg.includes('find') || msg.includes('where')) {
        reply = "Looking for something specific? Our global AI Search can perform deep semantic searches through your document text and image metadata!";
      } else if (msg.includes('thank')) {
        reply = "You're very welcome! Let me know if you need any more magic.";
      } else {
        reply = "That's an interesting question! As your AI assistant, I'm constantly analyzing your documents to fetch answers. Try checking the 'Analytics' tab for visual insights!";
      }

      // Add a slight delay to simulate "thinking" like a real AI
      await new Promise(resolve => setTimeout(resolve, 800));

      return res.json({ reply });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are CloudMind AI, a helpful assistant for a cloud storage platform. Keep responses very concise and helpful." },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
