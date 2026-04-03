import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Finding existing user...');
  let user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('No user found, creating demo user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: { email: 'demo@cloudmind.local', name: 'CloudMind Admin', password: hashedPassword }
    });
  }

  console.log(`Seeding data for User: ${user.name} (${user.email})`);

  // Clear existing files and activities to avoid clutter
  await prisma.sharedFile.deleteMany({ where: { sharedBy: user.id } });
  await prisma.activity.deleteMany({ where: { userId: user.id } });
  await prisma.file.deleteMany({ where: { userId: user.id } });
  await prisma.folder.deleteMany({ where: { userId: user.id } });

  console.log('Creating folders...');
  const designFolder = await prisma.folder.create({ data: { name: 'Design Assets', userId: user.id }});
  const techFolder = await prisma.folder.create({ data: { name: 'Tech Specs', userId: user.id }});

  console.log('Creating dummy files & assigning them categories...');
  const filesData = [
    { name: 'Dashboard_UI_V2.fig', path: 'mock_path', size: 10485760, type: 'application/figma', category: 'Images', folderId: designFolder.id },
    { name: 'Architecture_CloudMind.pdf', path: 'mock_path', size: 2500000, type: 'application/pdf', category: 'Documents', folderId: techFolder.id },
    { name: 'Marketing_Pitch.mp4', path: 'mock_path', size: 55000000, type: 'video/mp4', category: 'Videos', folderId: null },
    { name: 'Q4_Financials.xlsx', path: 'mock_path', size: 120000, type: 'application/excel', category: 'Finance', folderId: null },
    { name: 'Client_Meeting_Notes.txt', path: 'mock_path', size: 15000, type: 'text/plain', category: 'Uncategorized', folderId: null },
    { name: 'Raw_Data_Dump.json', path: 'mock_path', size: 1250000, type: 'application/json', category: 'Uncategorized', folderId: null },
    { name: 'Brainstorming_Board.png', path: 'mock_path', size: 5000000, type: 'image/png', category: 'Images', folderId: designFolder.id },
    { name: 'API_Gateway_Logic.ts', path: 'mock_path', size: 4500, type: 'text/typescript', category: 'Code', folderId: techFolder.id },
    { name: 'Company_Retreat.mp4', path: 'mock_path', size: 105000000, type: 'video/mp4', category: 'Videos', folderId: null },
  ];

  for (const f of filesData) {
    await prisma.file.create({
      data: { ...f, userId: user.id }
    });
  }

  console.log('Adding sample activity logs...');
  await prisma.activity.create({ data: { description: 'Uploaded Q4_Financials.xlsx', userId: user.id }});
  await prisma.activity.create({ data: { description: 'Deleted old drafts', userId: user.id }});
  await prisma.activity.create({ data: { description: 'Organized Design Assets folder', userId: user.id }});

  console.log('Setting up Shared Files relationships...');
  const fileToShare = await prisma.file.findFirst({ where: { userId: user.id, name: 'Architecture_CloudMind.pdf' }});
  if (fileToShare) {
    await prisma.sharedFile.create({
      data: {
        fileId: fileToShare.id,
        sharedBy: user.id,
        sharedWith: 'team@investors.com',
        permission: 'Can View'
      }
    });
  }

  console.log('Database seeded successfully with beautiful dummy data! 🎉');
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect());
