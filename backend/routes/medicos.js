import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/medicos?especialidad_id=X - Listar médicos (opcionalmente filtrados por especialidad)
router.get('/', async (req, res) => {
  try {
    const { especialidad_id } = req.query;

    const where = {};
    if (especialidad_id) {
      where.especialidadId = parseInt(especialidad_id);
    }

    const medicos = await prisma.medico.findMany({
      where, // Filtro opcional por especialidad
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          }
        },
        especialidad: {
          select: {
            id: true,
            nombre: true,
          }
        }
      },
      orderBy: {
        user: {
          nombre: 'asc'
        }
      }
    });

    // Formatear respuesta
    const medicosFormateados = medicos.map(medico => ({
      id: medico.id,
      userId: medico.userId,
      nombre: medico.user.nombre,
      apellido: medico.user.apellido,
      email: medico.user.email,
      especialidad: {
        id: medico.especialidad.id,
        nombre: medico.especialidad.nombre
      },
      horarioInicio: medico.horarioInicio,
      horarioFin: medico.horarioFin,
      diasSemana: medico.diasSemana.split(',')
    }));

    res.json(medicosFormateados);
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

