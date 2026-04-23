import express from 'express';
import {
  getAllSubscriptions,
  getSubscriptionById,
  getStatuses,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  bulkImportSubscriptions,
} from '../controllers/subscriptionController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { validateSubscriptionCreate, validateSubscriptionUpdate } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/statuses', getStatuses);
router.get('/', getAllSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/', validateSubscriptionCreate, createSubscription);
router.put('/:id', validateSubscriptionUpdate, updateSubscription);
router.delete('/:id', deleteSubscription);
router.post('/bulk-import', requireRole('admin_local', 'admin', 'super_admin', 'commercial'), bulkImportSubscriptions);

export default router;
