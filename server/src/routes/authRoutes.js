import express from 'express';
import {
  login,
  logout,
  refreshToken,
  me,
} from '../controllers/authController.js';
import { validateLogin } from '../middlewares/validation.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/logout', authenticateToken, logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticateToken, me);

export default router;
