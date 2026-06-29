import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API路由不存在',
  });
});

app.use(errorHandler);

export default app;
