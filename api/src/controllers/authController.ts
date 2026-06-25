import { Request, Response } from 'express';
import { body } from 'express-validator';
import { createUser, loginUser, getUserById } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export const registerValidation = [
  body('username').notEmpty().withMessage('请提供用户名'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('密码至少需要8个字符'),
];

export const loginValidation = [
  body('username').notEmpty().withMessage('请提供用户名'),
  body('password').notEmpty().withMessage('密码不能为空'),
];

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    const result = await createUser(username, password);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '注册失败';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败';
    res.status(401).json({
      success: false,
      error: message,
    });
  }
}

export async function getCurrentUser(
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

    const user = getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: '用户不存在',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户信息失败',
    });
  }
}
