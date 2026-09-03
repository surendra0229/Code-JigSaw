import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleRegister,
  handleLogin,
  handleGetMe,
  handleUpdatePlayerProfile,
  handleLogout
} from '../controllers/authController.js';
import { playerAuth } from '../middlewares/playerAuth.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

router.post('/register', authLimiter, handleRegister);
router.post('/login', authLimiter, handleLogin);
router.get('/me', playerAuth, handleGetMe);
router.put('/profile', playerAuth, handleUpdatePlayerProfile);
router.post('/logout', handleLogout);

export default router;
