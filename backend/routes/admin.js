import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/admin/medicos - Crear médico (solo admin)
router.post('/medicos', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { user_id, especialidad_id, horario_inicio, horario_fin, dias_semana } = req.body;

    // Validaciones
    if (!user_id || !especialidad_id || !horario_inicio || !horario_fin || !dias_semana) {
      return res.status(400).json({ 
        error: 'user_id, especialidad_id, horario_inicio, horario_fin y dias_semana son requeridos' 
      });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(user_id) }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el usuario no sea ya médico
    const medicoExistente = await prisma.medico.findUnique({
      where: { userId: parseInt(user_id) }
    });

    if (medicoExistente) {
      return res.status(400).json({ error: 'Este usuario ya es médico' });
    }

    // Verificar que la especialidad existe
    const especialidad = await prisma.especialidad.findUnique({
      where: { id: parseInt(especialidad_id) }
    });

    if (!especialidad) {
      return res.status(404).json({ error: 'Especialidad no encontrada' });
    }

    // Actualizar role del usuario a 'medico' si no lo es
    if (user.role !== 'medico') {
      await prisma.user.update({
        where: { id: parseInt(user_id) },
        data: { role: 'medico' }
      });
    }

    // Crear médico
    const medico = await prisma.medico.create({
      data: {
        userId: parseInt(user_id),
        especialidadId: parseInt(especialidad_id),
        horarioInicio: horario_inicio,
        horarioFin: horario_fin,
        diasSemana: dias_semana
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            role: true
          }
        },
        especialidad: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Médico creado exitosamente',
      medico
    });
  } catch (error) {
    console.error('Error al crear médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/admin/turnos - Ver todos los turnos (solo admin)
// Nota: Ya está implementado en GET /api/turnos para admin, pero lo dejamos por si acaso
router.get('/turnos', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const turnos = await prisma.turno.findMany({
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        medico: {
          include: {
            user: {
              select: {
                nombre: true,
                apellido: true
              }
            },
            especialidad: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    res.json(turnos);
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

