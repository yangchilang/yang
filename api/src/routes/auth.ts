import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  registerValidation,
  loginValidation,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.post(
  '/register',
  registerValidation,
  validateRequest,
  register
);

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
