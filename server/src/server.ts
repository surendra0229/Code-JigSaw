import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import gameRoutes from './routes/gameRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { Question } from './models/Question.js';
import { ensureAdminAccount } from './utils/initAdmin.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allows Vite dev server & embedded media assets
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Global Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Code Jigsaw API is online.', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Connect DB & Start Server
const startServer = async () => {
  await connectDB();

  // Automatically initialize single Admin account
  await ensureAdminAccount();

  // Auto-seed questions if database is empty
  try {
    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      console.log('[Server] Database is empty. Attempting auto-seeding from seed file...');
      // Use env var path, or relative path from project root, or skip silently
      const seedFilePath =
        process.env.SEED_FILE_PATH ||
        path.resolve(process.cwd(), 'data', 'questions.json');

      if (fs.existsSync(seedFilePath)) {
        const rawData = fs.readFileSync(seedFilePath, 'utf-8');
        const rawQuestions = JSON.parse(rawData);
        const formatted = rawQuestions.map((q: any) => ({
          title: q.title || 'Code Reconstruction Challenge',
          description: q.description || 'Arrange the scrambled lines of code into their correct original order.',
          language: q.language.toLowerCase(),
          difficulty: q.difficulty.toLowerCase(),
          lines: q.lines.map((l: any) => ({
            id: l.id,
            code: l.code,
            correctPosition: Number(l.correctPosition)
          })),
          expectedOutput: q.expectedOutput || '',
          explanation: q.explanation || 'Reconstruct the code line by line to achieve the desired program output.',
          points: q.difficulty === 'hard' ? 9 : q.difficulty === 'moderate' ? 7 : 5,
          active: true
        }));

        await Question.insertMany(formatted);
        console.log(`[Server] Auto-seeded ${formatted.length} questions successfully!`);
      } else {
        console.log('[Server] No seed file found. Skipping auto-seed. Use "npm run seed" to manually seed questions.');
      }
    } else {
      console.log(`[Server] Database contains ${questionCount} questions ready for gameplay.`);
    }
  } catch (err) {
    console.warn('[Server Warning] Auto-seeding check failed:', err);
  }

  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  Code Jigsaw Backend Server running on port ${PORT} `);
    console.log(`=================================================`);
  });
};

startServer();
