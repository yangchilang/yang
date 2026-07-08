import { Request, Response } from 'express';
import { body, query, param } from 'express-validator';
import {
  createReading,
  getReadingsByUserId,
  getReadingById,
  getReadingByOrderId,
  deleteReading,
} from '../services/readingService';
import { AuthRequest } from '../middleware/auth';
import { SelectedCard } from '../types';

export const createReadingValidation = [
  body('cards').isArray({ min: 1 }).withMessage('至少需要选择一张塔罗牌'),
  body('interpretation')
    .notEmpty()
    .withMessage('解读内容不能为空'),
  body('order_id')
    .notEmpty()
    .withMessage('订单号不能为空'),
  body('customer_name')
    .optional()
    .isString()
    .withMessage('顾客姓名必须为字符串'),
  body('customer_gender')
    .optional()
    .isIn(['男', '女'])
    .withMessage('性别只能是男或女'),
  body('customer_age')
    .optional()
    .isInt({ min: 1, max: 150 })
    .withMessage('年龄必须为1-150之间的整数'),
  body('related_order_id')
    .optional()
    .isString()
    .withMessage('关联订单号必须为字符串'),
];

export const getReadingsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须为正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
];

export const searchReadingValidation = [
  query('order_id')
    .notEmpty()
    .withMessage('订单号不能为空'),
];

export const getReadingByIdValidation = [
  param('id').isInt().withMessage('解读ID必须为整数'),
];

export const deleteReadingValidation = [
  param('id').isInt().withMessage('解读ID必须为整数'),
];

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    const { cards, interpretation, user_context, order_id, customer_name, customer_gender, customer_age, related_order_id } = req.body;
    const reading = createReading(
      req.user.userId,
      cards as SelectedCard[],
      interpretation,
      user_context || '',
      order_id,
      customer_name,
      customer_gender,
      customer_age,
      related_order_id
    );

    res.status(201).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '保存解读失败',
    });
  }
}

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { readings, total } = getReadingsByUserId(
      req.user.userId,
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        readings,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取解读列表失败',
    });
  }
}

export async function getById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    const readingId = parseInt(req.params.id);

    if (isNaN(readingId)) {
      res.status(400).json({
        success: false,
        error: '解读ID无效',
      });
      return;
    }

    const reading = getReadingById(readingId, req.user.userId);

    if (!reading) {
      res.status(404).json({
        success: false,
        error: '解读不存在',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取解读详情失败',
    });
  }
}

export async function remove(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    const readingId = parseInt(req.params.id);

    if (isNaN(readingId)) {
      res.status(400).json({
        success: false,
        error: '解读ID无效',
      });
      return;
    }

    const deleted = deleteReading(readingId, req.user.userId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: '解读不存在',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除解读失败',
    });
  }
}

export async function search(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未授权',
      });
      return;
    }

    const orderId = req.query.order_id as string;

    if (!orderId) {
      res.status(400).json({
        success: false,
        error: '订单号不能为空',
      });
      return;
    }

    const reading = getReadingByOrderId(orderId, req.user.userId);

    if (!reading) {
      res.status(404).json({
        success: false,
        error: '未找到该订单号的记录',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '搜索解读失败',
    });
  }
}
