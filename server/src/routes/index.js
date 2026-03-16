import express from 'express';
import authRoutes from './authRoutes.js';
import clientRoutes from './clientRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import userRoutes from './userRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/services', serviceRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);

export default router;
