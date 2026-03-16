import express from 'express';
import {
  getAllClients,
  getClientById,
  getClientByLineNumber,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateClient } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllClients);
router.get('/line/:line_number', getClientByLineNumber);
router.get('/:id', getClientById);
router.post('/', validateClient, createClient);
router.put('/:id', validateClient, updateClient);
router.delete('/:id', deleteClient);

export default router;
