// Helper para crear app de Express para tests
import express from 'express';
import cors from 'cors';
import authRoutes from '../../routes/auth.js';
import adminRoutes from '../../routes/admin.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

export default app;

