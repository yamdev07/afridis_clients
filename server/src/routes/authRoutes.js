import express from 'express';
import {
  login,
  logout,
  refreshToken,
  me,
  updateProfile,
  forgotPassword,
} from '../controllers/authController.js';
import { validateLogin } from '../middlewares/validation.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/logout', authenticateToken, logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticateToken, me);
router.put('/me', authenticateToken, updateProfile);
router.post('/forgot-password', forgotPassword);

export default router;
