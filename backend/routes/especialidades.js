import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/especialidades - Listar todas las especialidades
router.get('/', async (req, res) => {
  try {
    const especialidades = await prisma.especialidad.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(especialidades);
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

