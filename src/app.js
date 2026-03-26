import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import customerRoutes from './routes/customerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173',
    "http://192.168.0.101:5173",
    "http://13.206.11.231",
    "https://cctvit.netlify.app"


  ];

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

app.use('/api', apiLimiter);
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'IT CCTV Backend API is running',
  });
});

app.get('/api/vikas', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'git pull on server',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
