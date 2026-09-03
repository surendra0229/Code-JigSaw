import { Request, Response, NextFunction } from 'express';
import {
  startGameSession,
  getGameSessionState,
  processAnswerSubmission,
  advanceToNextQuestion,
  completeGameSession
} from '../services/gameService.js';
import { generateCodeSimulation } from '../services/simulationService.js';
import { Game } from '../models/Game.js';
import { PlayerRequest } from '../middlewares/playerAuth.js';

export const handleStartGame = async (req: PlayerRequest, res: Response, next: NextFunction) => {
  try {
    const { playerName, language, difficulty, selectedTime } = req.body;
    
    // Server-side authoritative player name override: if authenticated, use DB permanent name
    const finalPlayerName = req.player ? req.player.playerName : playerName;

    const game = await startGameSession({
      playerName: finalPlayerName,
      language,
      difficulty,
      selectedTime: Number(selectedTime),
      // Pass registered player ID for reliable per-player no-repeat tracking
      playerId: req.player ? req.player.id : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Game session initialized successfully.',
      data: {
        gameId: game._id
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleGetGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId } = req.params;
    const state = await getGameSessionState(gameId);
    res.json({
      success: true,
      data: state
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleSubmitAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId } = req.params;
    const { submittedSelection } = req.body;

    const result = await processAnswerSubmission({
      gameId,
      submittedSelection
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleNextQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId } = req.params;
    const newState = await advanceToNextQuestion(gameId);
    res.json({
      success: true,
      data: newState
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleSimulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId } = req.params;
    const { lines } = req.body;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game session not found.' });
    }

    const simulationResult = generateCodeSimulation(game.language, lines || []);

    res.json({
      success: true,
      data: simulationResult
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleCompleteGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId } = req.params;
    const game = await completeGameSession(gameId);

    res.json({
      success: true,
      message: 'Game completed successfully.',
      data: {
        gameId: game._id,
        totalScore: game.totalScore,
        correctAnswers: game.correctAnswers,
        timeUsed: game.timeUsed,
        difficulty: game.difficulty,
        language: game.language
      }
    });
  } catch (error: any) {
    next(error);
  }
};
