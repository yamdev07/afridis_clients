import express from 'express';
import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../controllers/subscriptionController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateSubscription } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/', validateSubscription, createSubscription);
router.put('/:id', validateSubscription, updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;
