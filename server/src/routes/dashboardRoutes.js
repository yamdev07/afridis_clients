import express from 'express';
import { getDashboardSummary, getReportsData } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getDashboardSummary);
router.get('/reports', getReportsData);

export default router;
