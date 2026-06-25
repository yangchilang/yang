import { Router } from 'express';
import authRoutes from './auth';
import readingsRoutes from './readings';

const router = Router();

router.use('/auth', authRoutes);
router.use('/readings', readingsRoutes);

export default router;
