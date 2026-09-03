import { Request, Response, NextFunction } from 'express';
import { getLanguageConfig } from '../config/languages.js';

export const validatePlayerSetup = (req: Request, res: Response, next: NextFunction) => {
  const { playerName, language, difficulty, selectedTime } = req.body;

  const cleanName = (playerName || '').trim().replace(/<[^>]*>?/gm, '');
  if (cleanName.length < 2 || cleanName.length > 30) {
    return res.status(400).json({
      success: false,
      message: 'Player name must be between 2 and 30 characters.'
    });
  }

  try {
    getLanguageConfig(language);
  } catch {
    return res.status(400).json({
      success: false,
      message: `Unsupported language selected: ${language}`
    });
  }

  if (!['easy', 'moderate', 'hard'].includes(difficulty)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid difficulty level selected.'
    });
  }

  const timeNum = Number(selectedTime);
  if (!timeNum || timeNum <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid duration in seconds is required.'
    });
  }

  next();
};

export const validateQuestionPayload = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, language, difficulty, code, lines, explanation, points } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Question title must be at least 3 characters long.' });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Question description is required.' });
  }

  if (!difficulty || !['easy', 'moderate', 'hard'].includes(difficulty)) {
    return res.status(400).json({ success: false, message: 'Difficulty must be easy, moderate, or hard.' });
  }

  // Accept either raw 'code' string OR structured 'lines' array
  if (typeof code === 'string' && code.trim().length > 0) {
    const codeLines = code.split('\n').filter((l: string) => l.trim().length > 0);
    if (codeLines.length < 2) {
      return res.status(400).json({ success: false, message: 'Canonical code must contain at least 2 non-empty lines.' });
    }
    // Raw code is valid — let controller handle conversion
    return next();
  }

  if (!Array.isArray(lines) || lines.length < 2) {
    return res.status(400).json({ success: false, message: 'A question must contain at least 2 lines of code. Provide either a multiline code string or a lines array.' });
  }

  const lineIds = new Set<string>();
  const correctPositions = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.id || typeof l.code !== 'string' || l.correctPosition === undefined) {
      return res.status(400).json({ success: false, message: `Line ${i + 1} is missing id, code, or correctPosition.` });
    }
    if (lineIds.has(l.id)) {
      return res.status(400).json({ success: false, message: `Duplicate line ID detected: ${l.id}` });
    }
    lineIds.add(l.id);

    const pos = Number(l.correctPosition);
    if (pos < 1 || pos > lines.length) {
      return res.status(400).json({ success: false, message: `Line position must be between 1 and ${lines.length}.` });
    }
    if (correctPositions.has(pos)) {
      return res.status(400).json({ success: false, message: `Duplicate correct position assignment: line ${pos}` });
    }
    correctPositions.add(pos);
  }

  if (!explanation || typeof explanation !== 'string' || explanation.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Explanation is required for answer feedback.' });
  }

  next();
};
