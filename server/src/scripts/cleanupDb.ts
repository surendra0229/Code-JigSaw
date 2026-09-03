/**
 * DB Cleanup Script — Code Jigsaw
 *
 * Removes all data from:
 *   - games        (all game sessions)
 *   - players      (all registered player accounts)
 *   - playerprogresses (all question-seen tracking records)
 *
 * PRESERVES:
 *   - questions    (all 1200+ coding problems)
 *   - admins       (admin login credentials)
 *
 * Usage:
 *   npm run cleanup
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanup = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/code_jigsaw';
  console.log('=================================================');
  console.log('  Code Jigsaw — Database Cleanup Script         ');
  console.log('=================================================\n');
  console.log(`[Cleanup] Connecting to MongoDB: ${uri}`);

  try {
    const conn = await mongoose.connect(uri);
    const db = conn.connection.db!;

    // List collections to confirm what exists
    const collections = await db.listCollections().toArray();
    const colNames = collections.map((c) => c.name);
    console.log(`[Cleanup] Collections found: ${colNames.join(', ')}\n`);

    // ── Confirm before proceeding ──────────────────────────────────────
    console.log('[Cleanup] The following collections will be CLEARED:');
    console.log('  ❌  games');
    console.log('  ❌  players');
    console.log('  ❌  playerprogresses');
    console.log('\n[Cleanup] The following collections will be PRESERVED:');
    console.log('  ✅  questions  (all 1200+ problem codes)');
    console.log('  ✅  admins     (admin login details)');
    console.log('\n[Cleanup] Starting cleanup...\n');

    // ── Delete game sessions ───────────────────────────────────────────
    if (colNames.includes('games')) {
      const gamesResult = await db.collection('games').deleteMany({});
      console.log(`[Cleanup] ✅ Deleted ${gamesResult.deletedCount} game sessions from 'games'.`);
    } else {
      console.log('[Cleanup] ℹ️  Collection "games" does not exist — skipping.');
    }

    // ── Delete player accounts ─────────────────────────────────────────
    if (colNames.includes('players')) {
      const playersResult = await db.collection('players').deleteMany({});
      console.log(`[Cleanup] ✅ Deleted ${playersResult.deletedCount} player accounts from 'players'.`);
    } else {
      console.log('[Cleanup] ℹ️  Collection "players" does not exist — skipping.');
    }

    // ── Delete player progress (question-seen tracking) ────────────────
    if (colNames.includes('playerprogresses')) {
      const progressResult = await db.collection('playerprogresses').deleteMany({});
      console.log(`[Cleanup] ✅ Deleted ${progressResult.deletedCount} progress records from 'playerprogresses'.`);
    } else {
      console.log('[Cleanup] ℹ️  Collection "playerprogresses" does not exist — skipping.');
    }

    // ── Verify preserved collections ──────────────────────────────────
    const questionCount = colNames.includes('questions')
      ? await db.collection('questions').countDocuments()
      : 0;
    const adminCount = colNames.includes('admins')
      ? await db.collection('admins').countDocuments()
      : 0;

    console.log('\n[Cleanup] Verification:');
    console.log(`  questions collection: ${questionCount} documents (preserved)`);
    console.log(`  admins collection:    ${adminCount} documents (preserved)`);

    console.log('\n[Cleanup] ✅ Database cleanup completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Cleanup Error]', error);
    process.exit(1);
  }
};

cleanup();
