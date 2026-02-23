import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  me,
} from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middlewares/validation.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', authenticateToken, logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticateToken, me);

export default router;
