import { Router } from 'express';
import { handleGetLeaderboard, handleGetPlayerRank } from '../controllers/leaderboardController.js';

const router = Router();

router.get('/', handleGetLeaderboard);
router.get('/rank/:gameId', handleGetPlayerRank);

export default router;
