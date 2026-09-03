import { Router } from 'express';
import {
  handleStartGame,
  handleGetGame,
  handleSubmitAnswer,
  handleNextQuestion,
  handleSimulation,
  handleCompleteGame
} from '../controllers/gameController.js';

import { validatePlayerSetup } from '../middlewares/validation.js';
import { optionalPlayerAuth } from '../middlewares/playerAuth.js';

const router = Router();

router.post('/start', optionalPlayerAuth, validatePlayerSetup, handleStartGame);
router.get('/:gameId', handleGetGame);
router.post('/:gameId/answer', handleSubmitAnswer);
router.post('/:gameId/next', handleNextQuestion);
router.post('/:gameId/simulation', handleSimulation);
router.post('/:gameId/complete', handleCompleteGame);

export default router;
