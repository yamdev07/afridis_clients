import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceClients,
} from '../controllers/serviceController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { validateService } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.get('/:id/clients', getServiceClients);
router.post('/', requireRole('admin_local', 'admin', 'super_admin'), validateService, createService);
router.put('/:id', requireRole('admin_local', 'admin', 'super_admin'), validateService, updateService);
router.delete('/:id', requireRole('admin_local', 'admin', 'super_admin'), deleteService);

export default router;
