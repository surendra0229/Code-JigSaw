import { Response, NextFunction } from 'express';
import { Player } from '../models/Player.js';
import { hashPassword, verifyPassword, createPlayerToken } from '../utils/authUtils.js';
import { PlayerRequest } from '../middlewares/playerAuth.js';

export const handleRegister = async (req: PlayerRequest, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    const cleanName = (fullName || '').trim().replace(/<[^>]*>?/gm, '');
    if (!cleanName || cleanName.length < 2 || cleanName.length > 40) {
      return res.status(400).json({ success: false, message: 'Full Name must be between 2 and 40 characters.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Password and Confirm Password do not match.' });
    }

    // Check duplicate email
    const existing = await Player.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const passwordHash = hashPassword(password);
    const newPlayer = new Player({
      playerName: cleanName,
      email: cleanEmail,
      passwordHash,
      role: 'player'
    });

    await newPlayer.save();

    const token = createPlayerToken({
      id: newPlayer._id.toString(),
      playerName: newPlayer.playerName,
      email: newPlayer.email
    });

    res.status(201).json({
      success: true,
      message: 'Player account registered successfully.',
      data: {
        token,
        player: {
          id: newPlayer._id,
          playerName: newPlayer.playerName,
          email: newPlayer.email
        }
      }
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }
    next(error);
  }
};

export const handleLogin = async (req: PlayerRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const player = await Player.findOne({ email: cleanEmail });
    if (!player) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = verifyPassword(password, player.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = createPlayerToken({
      id: player._id.toString(),
      playerName: player.playerName,
      email: player.email
    });

    res.json({
      success: true,
      data: {
        token,
        player: {
          id: player._id,
          playerName: player.playerName,
          email: player.email
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleGetMe = async (req: PlayerRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.player) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const player = await Player.findById(req.player.id).select('playerName email role createdAt');
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player account not found.' });
    }

    res.json({
      success: true,
      data: {
        id: player._id,
        playerName: player.playerName,
        email: player.email,
        role: player.role || 'player',
        createdAt: player.createdAt
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleUpdatePlayerProfile = async (req: PlayerRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.player) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const { playerName } = req.body;
    const cleanName = (playerName || '').trim().replace(/<[^>]*>?/gm, '');

    if (!cleanName || cleanName.length < 2 || cleanName.length > 40) {
      return res.status(400).json({ success: false, message: 'Player Name must be between 2 and 40 characters.' });
    }

    const player = await Player.findById(req.player.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player account not found.' });
    }

    player.playerName = cleanName;
    await player.save();

    const newToken = createPlayerToken({
      id: player._id.toString(),
      playerName: player.playerName,
      email: player.email
    });

    res.json({
      success: true,
      message: 'Name updated successfully.',
      data: {
        token: newToken,
        player: {
          id: player._id,
          playerName: player.playerName,
          email: player.email,
          role: player.role
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleLogout = async (req: PlayerRequest, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error: any) {
    next(error);
  }
};
