import express from 'express';
import { listUsers, createUser, updateUser, deleteUser, setUserSuspension } from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireRole('super_admin', 'admin_local', 'admin'), listUsers);
router.post('/', requireRole('super_admin', 'admin_local', 'admin'), createUser);
router.put('/:id', requireRole('super_admin', 'admin_local', 'admin'), updateUser);
router.delete('/:id', requireRole('super_admin', 'admin_local', 'admin'), deleteUser);
router.patch('/:id/suspension', requireRole('super_admin'), setUserSuspension);

export default router;
