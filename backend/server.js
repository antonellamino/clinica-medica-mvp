import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import especialidadesRoutes from './routes/especialidades.js';
import medicosRoutes from './routes/medicos.js';
import turnosRoutes from './routes/turnos.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ message: 'health check ok'});
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas auxiliares
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/medicos', medicosRoutes);

// Rutas de turnos
app.use('/api/turnos', turnosRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});