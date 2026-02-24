import express from 'express';
import { listUsers, createUser } from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('super_admin'));

router.get('/', listUsers);
router.post('/', createUser);

export default router;

