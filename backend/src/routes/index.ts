import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'VibesMatch API',
      version: '1.0.0',
      description: 'Dating app backend API',
      documentation: '/api/v1/docs',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        health: '/api/v1/health',
      },
    },
  });
});

export default router;