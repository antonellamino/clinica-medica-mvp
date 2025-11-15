import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/admin/medicos - Crear médico (solo admin)
// Crea usuario automáticamente y luego el médico
router.post('/medicos', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { nombre, apellido, email, password, especialidad_id, horario_inicio, horario_fin, dias_semana } = req.body;

    // Validaciones
    if (!nombre || !email || !password || !especialidad_id || !horario_inicio || !horario_fin || !dias_semana) {
      return res.status(400).json({ 
        error: 'nombre, email, password, especialidad_id, horario_inicio, horario_fin y dias_semana son requeridos' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password debe tener al menos 6 caracteres' });
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }

    // Verificar que la especialidad existe
    const especialidad = await prisma.especialidad.findUnique({
      where: { id: parseInt(especialidad_id) }
    });

    if (!especialidad) {
      return res.status(404).json({ error: 'Especialidad no encontrada' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario primero
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'medico',
        nombre,
        apellido: apellido || null,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        role: true
      }
    });

    // Crear médico asociado
    const medico = await prisma.medico.create({
      data: {
        userId: user.id,
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

// PUT /api/admin/medicos/:id - Actualizar médico (solo admin)
router.put('/medicos/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, especialidad_id, horario_inicio, horario_fin, dias_semana } = req.body;

    // Buscar médico
    const medico = await prisma.medico.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    // Preparar datos de actualización del usuario
    const userUpdateData = {};
    if (nombre) userUpdateData.nombre = nombre;
    if (apellido !== undefined) userUpdateData.apellido = apellido;
    if (email) {
      // Verificar que el email no esté en uso por otro usuario
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: medico.userId }
        }
      });
      if (emailExists) {
        return res.status(400).json({ error: 'Email ya está en uso por otro usuario' });
      }
      userUpdateData.email = email;
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password debe tener al menos 6 caracteres' });
      }
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    // Actualizar usuario si hay cambios
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: medico.userId },
        data: userUpdateData
      });
    }

    // Preparar datos de actualización del médico
    const medicoUpdateData = {};
    if (especialidad_id) {
      // Verificar que la especialidad existe
      const especialidad = await prisma.especialidad.findUnique({
        where: { id: parseInt(especialidad_id) }
      });
      if (!especialidad) {
        return res.status(404).json({ error: 'Especialidad no encontrada' });
      }
      medicoUpdateData.especialidadId = parseInt(especialidad_id);
    }
    if (horario_inicio) medicoUpdateData.horarioInicio = horario_inicio;
    if (horario_fin) medicoUpdateData.horarioFin = horario_fin;
    if (dias_semana) medicoUpdateData.diasSemana = dias_semana;

    // Actualizar médico si hay cambios
    if (Object.keys(medicoUpdateData).length > 0) {
      await prisma.medico.update({
        where: { id: parseInt(id) },
        data: medicoUpdateData
      });
    }

    // Obtener médico actualizado
    const medicoActualizado = await prisma.medico.findUnique({
      where: { id: parseInt(id) },
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

    res.json({
      message: 'Médico actualizado exitosamente',
      medico: medicoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/medicos/:id - Eliminar médico (solo admin)
router.delete('/medicos/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar médico
    const medico = await prisma.medico.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    // Eliminar médico (cascade elimina turnos)
    await prisma.medico.delete({
      where: { id: parseInt(id) }
    });

    // Actualizar role del usuario a 'paciente' (no eliminamos el usuario)
    await prisma.user.update({
      where: { id: medico.userId },
      data: { role: 'paciente' }
    });

    res.json({
      message: 'Médico eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/admin/pacientes - Listar todos los pacientes (solo admin)
router.get('/pacientes', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const pacientes = await prisma.user.findMany({
      where: {
        role: 'paciente'
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            turnosPaciente: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(pacientes);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/pacientes - Crear paciente (solo admin)
router.post('/pacientes', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        error: 'nombre, email y password son requeridos' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password debe tener al menos 6 caracteres' });
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear paciente
    const paciente = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'paciente',
        nombre,
        apellido: apellido || null,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Paciente creado exitosamente',
      paciente
    });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/pacientes/:id - Actualizar paciente (solo admin)
router.put('/pacientes/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password } = req.body;

    // Buscar paciente
    const paciente = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    if (paciente.role !== 'paciente') {
      return res.status(400).json({ error: 'Este usuario no es un paciente' });
    }

    // Preparar datos de actualización
    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (apellido !== undefined) updateData.apellido = apellido;
    if (email) {
      // Verificar que el email no esté en uso por otro usuario
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: parseInt(id) }
        }
      });
      if (emailExists) {
        return res.status(400).json({ error: 'Email ya está en uso por otro usuario' });
      }
      updateData.email = email;
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password debe tener al menos 6 caracteres' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Actualizar paciente
    const pacienteActualizado = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Paciente actualizado exitosamente',
      paciente: pacienteActualizado
    });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/pacientes/:id - Eliminar paciente (solo admin)
router.delete('/pacientes/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar paciente
    const paciente = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            turnosPaciente: true
          }
        }
      }
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    if (paciente.role !== 'paciente') {
      return res.status(400).json({ error: 'Este usuario no es un paciente' });
    }

    // Eliminar paciente (cascade elimina turnos)
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Paciente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
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

