import { Response, NextFunction } from 'express';
import { Admin } from '../models/Admin.js';
import { Question } from '../models/Question.js';
import { Player } from '../models/Player.js';
import { Game } from '../models/Game.js';
import { verifyPassword, createAdminToken } from '../utils/authUtils.js';
import { AdminRequest } from '../middlewares/adminAuth.js';
import { getLeaderboardRankings } from '../controllers/leaderboardController.js';

export const handleAdminLogin = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const { identifier, password, username } = req.body;
    const cleanId = (identifier || username || '').trim();

    if (!cleanId || !password) {
      return res.status(400).json({ success: false, message: 'Email or User ID and password are required.' });
    }

    const admin = await Admin.findOne({
      $or: [
        { email: cleanId.toLowerCase() },
        { userId: cleanId }
      ]
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid Admin credentials.' });
    }

    const isMatch = verifyPassword(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Admin credentials.' });
    }

    const token = createAdminToken({
      id: admin._id.toString(),
      email: admin.email,
      userId: admin.userId,
      displayName: admin.displayName
    });

    res.json({
      success: true,
      user: {
        id: admin._id,
        name: admin.displayName,
        email: admin.email,
        userId: admin.userId,
        role: 'ADMIN'
      },
      token,
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          userId: admin.userId,
          displayName: admin.displayName,
          role: 'ADMIN'
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleGetAdminMe = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Not authenticated as admin.' });
    }
    const admin = await Admin.findById(req.admin.id).select('email userId displayName role createdAt');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    res.json({
      success: true,
      data: {
        id: admin._id,
        email: admin.email,
        userId: admin.userId,
        displayName: admin.displayName,
        role: admin.role,
        createdAt: admin.createdAt
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleUpdateAdminProfile = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const { displayName } = req.body;
    const cleanName = (displayName || '').trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 40) {
      return res.status(400).json({ success: false, message: 'Display Name must be between 2 and 40 characters.' });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    // Preserve email, userId, and role — only update display name
    admin.displayName = cleanName;
    await admin.save();

    res.json({
      success: true,
      message: 'Admin profile updated successfully.',
      data: {
        id: admin._id,
        email: admin.email,
        userId: admin.userId,
        displayName: admin.displayName,
        role: admin.role
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleGetAdminStats = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const [totalQuestions, playersCount, leaderboardItems] = await Promise.all([
      Question.countDocuments({}),
      Player.countDocuments({}),
      getLeaderboardRankings()
    ]);

    const topPlayerName = leaderboardItems && leaderboardItems.length > 0
      ? leaderboardItems[0].playerName
      : 'No completed games yet';

    res.json({
      success: true,
      data: {
        totalQuestions,
        languagesCount: 8,
        playersCount,
        topPlayer: topPlayerName
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleGetQuestions = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const { search, language, difficulty, active, page = 1, limit = 50 } = req.query;

    const filter: any = {};

    if (language && typeof language === 'string' && language !== 'all') {
      filter.language = language.toLowerCase();
    }

    if (difficulty && typeof difficulty === 'string' && difficulty !== 'all') {
      filter.difficulty = difficulty.toLowerCase();
    }

    if (active !== undefined && active !== 'all') {
      filter.active = active === 'true';
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const cleanSearch = search.trim();
      filter.$or = [
        { title: { $regex: cleanSearch, $options: 'i' } },
        { description: { $regex: cleanSearch, $options: 'i' } },
        { _id: cleanSearch.length === 24 ? cleanSearch : undefined }
      ].filter(Boolean);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(200, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Question.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleCreateQuestion = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, language, difficulty, code, lines, expectedOutput, explanation, points, active } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Question Title is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required.' });
    }
    if (!language) {
      return res.status(400).json({ success: false, message: 'Language is required.' });
    }
    if (!difficulty) {
      return res.status(400).json({ success: false, message: 'Difficulty is required.' });
    }

    let formattedLines: any[] = [];
    if (typeof code === 'string' && code.trim().length > 0) {
      const codeLines = code.split('\n').filter((l: string) => l.trim().length > 0);
      if (codeLines.length < 2) {
        return res.status(400).json({ success: false, message: 'Code must contain at least 2 non-empty lines.' });
      }
      formattedLines = codeLines.map((lineText: string, idx: number) => ({
        id: `line-${idx + 1}`,
        code: lineText,
        correctPosition: idx + 1
      }));
    } else if (Array.isArray(lines) && lines.length >= 2) {
      formattedLines = lines.map((l: any, idx: number) => ({
        id: l.id || `line-${idx + 1}`,
        code: l.code,
        correctPosition: Number(l.correctPosition || idx + 1)
      }));
    } else {
      return res.status(400).json({ success: false, message: 'Please provide valid code lines (at least 2 lines).' });
    }

    const newQuestion = new Question({
      title: title.trim(),
      description: description.trim(),
      language: language.toLowerCase(),
      difficulty: difficulty.toLowerCase(),
      lines: formattedLines,
      expectedOutput: expectedOutput ? expectedOutput.trim() : '',
      explanation: explanation ? explanation.trim() : 'Reconstruct the code in canonical order.',
      points: points ? Number(points) : (difficulty.toLowerCase() === 'hard' ? 9 : difficulty.toLowerCase() === 'moderate' ? 7 : 5),
      active: active !== undefined ? Boolean(active) : true
    });

    await newQuestion.save();

    res.status(201).json({
      success: true,
      message: 'Question saved successfully.',
      data: newQuestion
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleUpdateQuestion = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, language, difficulty, code, lines, expectedOutput, explanation, points, active } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    if (title) question.title = title.trim();
    if (description) question.description = description.trim();
    if (language) question.language = language.toLowerCase();
    if (difficulty) question.difficulty = difficulty.toLowerCase();
    if (expectedOutput !== undefined) question.expectedOutput = expectedOutput;
    if (explanation) question.explanation = explanation.trim();
    if (points !== undefined) question.points = Number(points);
    if (active !== undefined) question.active = Boolean(active);

    if (typeof code === 'string' && code.trim().length > 0) {
      const codeLines = code.split('\n').filter((l: string) => l.trim().length > 0);
      if (codeLines.length >= 2) {
        question.lines = codeLines.map((lineText: string, idx: number) => ({
          id: `line-${idx + 1}`,
          code: lineText,
          correctPosition: idx + 1
        }));
      }
    } else if (Array.isArray(lines) && lines.length >= 2) {
      question.lines = lines.map((l: any, idx: number) => ({
        id: l.id || `line-${idx + 1}`,
        code: l.code,
        correctPosition: Number(l.correctPosition || idx + 1)
      }));
    }

    await question.save();

    res.json({
      success: true,
      message: 'Question updated successfully.',
      data: question
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleToggleQuestionActive = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    question.active = !question.active;
    await question.save();

    res.json({
      success: true,
      message: `Question is now ${question.active ? 'active' : 'inactive'}.`,
      data: { id: question._id, active: question.active }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleDeleteQuestion = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    question.active = false;
    await question.save();

    res.json({
      success: true,
      message: 'Question deactivated successfully.',
      data: { id: question._id }
    });
  } catch (error: any) {
    next(error);
  }
};
