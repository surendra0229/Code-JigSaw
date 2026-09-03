import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Question } from '../models/Question.js';

dotenv.config();

/**
 * Seed Script — Populates the questions collection from a JSON file.
 *
 * Usage:
 *   npm run seed                              (clears existing + re-seeds)
 *   SEED_FILE_PATH=/path/to/file.json npm run seed
 *
 * The seed file path is resolved in this priority order:
 *   1. SEED_FILE_PATH environment variable
 *   2. ./data/questions.json (relative to the project server directory)
 */

// Resolve seed file path from env or relative default
const SEED_FILE_PATH =
  process.env.SEED_FILE_PATH ||
  path.resolve(process.cwd(), 'data', 'questions.json');

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/code_jigsaw';
  console.log(`[Seed] Connecting to MongoDB at ${uri}...`);

  try {
    await mongoose.connect(uri);
    console.log('[Seed] Connected successfully.');

    if (!fs.existsSync(SEED_FILE_PATH)) {
      console.error(
        `[Seed Error] Seed file not found at: ${SEED_FILE_PATH}\n` +
        `  Set the SEED_FILE_PATH environment variable to point to your questions JSON file.`
      );
      process.exit(1);
    }

    console.log(`[Seed] Reading seed file from: ${SEED_FILE_PATH}...`);
    const rawData = fs.readFileSync(SEED_FILE_PATH, 'utf-8');
    const rawQuestions = JSON.parse(rawData);
    console.log(`[Seed] Loaded ${rawQuestions.length} raw question items from JSON.`);

    const formattedQuestions = rawQuestions.map((q: any) => {
      let basePoints = 5;
      if (q.difficulty === 'moderate') basePoints = 7;
      if (q.difficulty === 'hard') basePoints = 9;

      return {
        title: q.title || 'Code Reconstruction Challenge',
        description:
          q.description ||
          'Arrange the scrambled lines of code into their correct original order.',
        language: q.language.toLowerCase(),
        difficulty: q.difficulty.toLowerCase(),
        lines: q.lines.map((l: any) => ({
          id: l.id,
          code: l.code,
          correctPosition: Number(l.correctPosition)
        })),
        expectedOutput: q.expectedOutput || '',
        explanation:
          q.explanation ||
          'Reconstruct the code line by line to achieve the desired program output.',
        points: basePoints,
        active: true
      };
    });

    console.log('[Seed] Clearing existing questions collection...');
    await Question.deleteMany({});

    console.log(
      `[Seed] Inserting ${formattedQuestions.length} formatted questions into MongoDB...`
    );
    const inserted = await Question.insertMany(formattedQuestions);
    console.log(`[Seed] ✅ Successfully seeded ${inserted.length} questions into MongoDB!`);

    await mongoose.disconnect();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
