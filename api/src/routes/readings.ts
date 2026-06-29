import { Router } from 'express';
import {
  create,
  getAll,
  getById,
  remove,
  search,
  createReadingValidation,
  getReadingsValidation,
  getReadingByIdValidation,
  deleteReadingValidation,
  searchReadingValidation,
} from '../controllers/readingController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.use(authMiddleware);

router.get(
  '/search',
  searchReadingValidation,
  validateRequest,
  search
);

router.post(
  '/',
  createReadingValidation,
  validateRequest,
  create
);

router.get(
  '/',
  getReadingsValidation,
  validateRequest,
  getAll
);

router.get(
  '/:id',
  getReadingByIdValidation,
  validateRequest,
  getById
);

router.delete(
  '/:id',
  deleteReadingValidation,
  validateRequest,
  remove
);

export default router;
