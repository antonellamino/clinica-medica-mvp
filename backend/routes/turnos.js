import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Función auxiliar: generar horarios cada 30 minutos
const generarHorarios = (inicio, fin) => {
  const horarios = [];
  const [horaInicio, minInicio] = inicio.split(':').map(Number);
  const [horaFin, minFin] = fin.split(':').map(Number);
  
  let hora = horaInicio;
  let minuto = minInicio;
  
  while (hora < horaFin || (hora === horaFin && minuto < minFin)) {
    horarios.push(`${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`);
    minuto += 30;
    if (minuto >= 60) {
      minuto = 0;
      hora += 1;
    }
  }
  
  return horarios;
};

// Función auxiliar: obtener nombre del día de la semana
const obtenerDiaSemana = (fecha) => {
  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return dias[fecha.getDay()];
};

// GET /api/turnos/disponibilidad/:medicoId?fecha=YYYY-MM-DD
// Público - no requiere autenticación
router.get('/disponibilidad/:medicoId', async (req, res) => {
  try {
    const { medicoId } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: 'Parámetro fecha es requerido (formato: YYYY-MM-DD)' });
    }

    // Buscar médico
    const medico = await prisma.medico.findUnique({
      where: { id: parseInt(medicoId) },
      include: {
        user: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    // Parsear fecha (formato YYYY-MM-DD)
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaObj.setHours(0, 0, 0, 0);

    // Verificar que no sea fecha pasada
    if (fechaObj < hoy) {
      return res.status(400).json({ error: 'No se pueden agendar turnos en fechas pasadas' });
    }

    // Verificar día de la semana
    const diaSemana = obtenerDiaSemana(fechaObj);
    const diasDisponibles = medico.diasSemana.split(',').map(d => d.trim().toLowerCase());

    if (!diasDisponibles.includes(diaSemana)) {
      return res.json({ 
        horarios: [],
        mensaje: `El médico no atiende los ${diaSemana}s`
      });
    }

    // Generar todos los horarios posibles del médico
    const todosHorarios = generarHorarios(medico.horarioInicio, medico.horarioFin);

    // Buscar turnos ocupados en esa fecha
    const fechaInicio = new Date(year, month - 1, day);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(year, month - 1, day);
    fechaFin.setHours(23, 59, 59, 999);

    const turnosOcupados = await prisma.turno.findMany({
      where: {
        medicoId: parseInt(medicoId),
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        },
        estado: {
          not: 'cancelado'
        }
      },
      select: {
        hora: true
      }
    });

    const horariosOcupados = turnosOcupados.map(t => t.hora);

    // Filtrar horarios disponibles
    const horariosDisponibles = todosHorarios.filter(h => !horariosOcupados.includes(h));

    // Si es hoy, filtrar horarios pasados
    const horariosFinales = fechaObj.getTime() === hoy.getTime()
      ? horariosDisponibles.filter(h => {
          const [hora, minuto] = h.split(':').map(Number);
          const ahora = new Date();
          const horaTurno = new Date();
          horaTurno.setHours(hora, minuto, 0, 0);
          return horaTurno > ahora;
        })
      : horariosDisponibles;

    res.json({
      medico: {
        id: medico.id,
        nombre: `${medico.user.nombre} ${medico.user.apellido}`
      },
      fecha,
      horarios: horariosFinales
    });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/turnos - Listar turnos según rol
// Requiere autenticación
router.get('/', verifyToken, async (req, res) => {
  try {
    const { role, id } = req.user;

    let turnos;

    if (role === 'admin') {
      // Admin ve todos los turnos
      turnos = await prisma.turno.findMany({
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
    } else if (role === 'medico') {
      // Médico ve solo sus turnos
      const medico = await prisma.medico.findUnique({
        where: { userId: id }
      });

      if (!medico) {
        return res.status(404).json({ error: 'Médico no encontrado' });
      }

      turnos = await prisma.turno.findMany({
        where: {
          medicoId: medico.id
        },
        include: {
          paciente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          }
        },
        orderBy: {
          fecha: 'desc'
        }
      });
    } else {
      // Paciente ve solo sus turnos
      turnos = await prisma.turno.findMany({
        where: {
          pacienteId: id
        },
        include: {
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
    }

    res.json(turnos);
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/turnos - Crear turno
// Requiere autenticación (paciente)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { role, id } = req.user;

    // Solo pacientes pueden crear turnos
    if (role !== 'paciente') {
      return res.status(403).json({ error: 'Solo los pacientes pueden crear turnos' });
    }

    const { medico_id, fecha, hora, motivo } = req.body;

    // Validaciones
    if (!medico_id || !fecha || !hora) {
      return res.status(400).json({ error: 'medico_id, fecha y hora son requeridos' });
    }

    // Verificar que el médico existe
    const medico = await prisma.medico.findUnique({
      where: { id: parseInt(medico_id) },
      include: {
        user: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    // Parsear y validar fecha (formato YYYY-MM-DD)
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaObj.setHours(0, 0, 0, 0);

    if (fechaObj < hoy) {
      return res.status(400).json({ error: 'No se pueden agendar turnos en fechas pasadas' });
    }

    // Verificar día de la semana
    const diaSemana = obtenerDiaSemana(fechaObj);
    const diasDisponibles = medico.diasSemana.split(',').map(d => d.trim().toLowerCase());

    if (!diasDisponibles.includes(diaSemana)) {
      return res.status(400).json({ error: `El médico no atiende los ${diaSemana}s` });
    }

    // Verificar que el horario esté dentro del rango del médico
    const horariosDisponibles = generarHorarios(medico.horarioInicio, medico.horarioFin);
    if (!horariosDisponibles.includes(hora)) {
      return res.status(400).json({ error: 'El horario no está disponible para este médico' });
    }

    // Verificar que no haya un turno ya ocupado
    const fechaInicio = new Date(year, month - 1, day);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(year, month - 1, day);
    fechaFin.setHours(23, 59, 59, 999);

    const turnoExistente = await prisma.turno.findFirst({
      where: {
        medicoId: parseInt(medico_id),
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        },
        hora: hora,
        estado: {
          not: 'cancelado'
        }
      }
    });

    if (turnoExistente) {
      return res.status(400).json({ error: 'Este horario ya está ocupado' });
    }

    // Si es hoy, verificar que el horario no sea pasado
    if (fechaObj.getTime() === hoy.getTime()) {
      const [horaTurno, minutoTurno] = hora.split(':').map(Number);
      const ahora = new Date();
      const horaTurnoObj = new Date();
      horaTurnoObj.setHours(horaTurno, minutoTurno, 0, 0);
      
      if (horaTurnoObj <= ahora) {
        return res.status(400).json({ error: 'No se pueden agendar turnos en horarios pasados' });
      }
    }

    // Crear turno
    const turno = await prisma.turno.create({
      data: {
        pacienteId: id,
        medicoId: parseInt(medico_id),
        fecha: fechaObj,
        hora: hora,
        motivo: motivo || null,
        estado: 'pendiente'
      },
      include: {
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
      }
    });

    res.status(201).json({
      message: 'Turno creado exitosamente',
      turno
    });
  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

