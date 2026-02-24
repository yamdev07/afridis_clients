import express from 'express';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', listNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/mark-all-read', markAllNotificationsRead);

export default router;

