import { Router } from 'express';
import {
  login,
  getCurrentUser,
  loginValidation,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.post(
  '/login',
  loginValidation,
  validateRequest,
  login
);

router.get(
  '/me',
  authMiddleware,
  getCurrentUser
);

export default router;
