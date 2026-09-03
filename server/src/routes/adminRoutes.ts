import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleAdminLogin,
  handleGetAdminMe,
  handleUpdateAdminProfile,
  handleGetAdminStats,
  handleGetQuestions,
  handleCreateQuestion,
  handleUpdateQuestion,
  handleToggleQuestionActive,
  handleDeleteQuestion
} from '../controllers/adminController.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { validateQuestionPayload } from '../middlewares/validation.js';

const router = Router();

// Rate limiter specifically for admin login (10 attempts per 15 mins)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});

router.post('/login', loginLimiter, handleAdminLogin);
router.get('/me', adminAuth, handleGetAdminMe);
router.put('/profile', adminAuth, handleUpdateAdminProfile);
router.get('/stats', adminAuth, handleGetAdminStats);
router.get('/questions', adminAuth, handleGetQuestions);
router.post('/questions', adminAuth, validateQuestionPayload, handleCreateQuestion);
router.put('/questions/:id', adminAuth, validateQuestionPayload, handleUpdateQuestion);
router.patch('/questions/:id/toggle', adminAuth, handleToggleQuestionActive);
router.delete('/questions/:id', adminAuth, handleDeleteQuestion);

export default router;
