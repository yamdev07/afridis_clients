import express from 'express';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Les admins peuvent aussi lister et créer (au moins les commerciaux)
router.get('/', requireRole('super_admin', 'admin'), listUsers);
router.post('/', requireRole('super_admin', 'admin'), createUser);
router.put('/:id', requireRole('super_admin', 'admin'), updateUser);
router.delete('/:id', requireRole('super_admin', 'admin'), deleteUser);

export default router;
