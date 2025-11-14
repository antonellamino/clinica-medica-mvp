// Datos mock para desarrollo - Reemplazar con llamadas API reales

// Función helper para logging
export const logAction = (dashboard, level, action, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${dashboard}] [${level}] ${action}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

// Mock de turnos
export const mockTurnos = [
  {
    id: 1,
    fecha: '2024-12-20',
    hora: '10:00',
    medico: {
      id: 1,
      nombre: 'Dr. Juan',
      apellido: 'Pérez',
      especialidad: 'Cardiología'
    },
    paciente: {
      id: 1,
      nombre: 'María',
      apellido: 'González',
      email: 'maria@email.com'
    },
    sintomas: 'Dolor en el pecho',
    estado: 'confirmado',
    tipo: 'presencial'
  },
  {
    id: 2,
    fecha: '2024-12-20',
    hora: '14:30',
    medico: {
      id: 2,
      nombre: 'Dra. Ana',
      apellido: 'López',
      especialidad: 'Pediatría'
    },
    paciente: {
      id: 2,
      nombre: 'Carlos',
      apellido: 'Martínez',
      email: 'carlos@email.com'
    },
    sintomas: 'Fiebre y tos',
    estado: 'confirmado',
    tipo: 'teleconsulta'
  },
  {
    id: 3,
    fecha: '2024-12-21',
    hora: '09:00',
    medico: {
      id: 1,
      nombre: 'Dr. Juan',
      apellido: 'Pérez',
      especialidad: 'Cardiología'
    },
    paciente: {
      id: 1,
      nombre: 'María',
      apellido: 'González',
      email: 'maria@email.com'
    },
    sintomas: 'Control de presión',
    estado: 'pendiente',
    tipo: 'presencial'
  },
  {
    id: 4,
    fecha: '2024-12-18',
    hora: '11:00',
    medico: {
      id: 2,
      nombre: 'Dra. Ana',
      apellido: 'López',
      especialidad: 'Pediatría'
    },
    paciente: {
      id: 2,
      nombre: 'Carlos',
      apellido: 'Martínez',
      email: 'carlos@email.com'
    },
    sintomas: 'Vacunación',
    estado: 'completado',
    tipo: 'presencial'
  }
];

// Mock de médicos
export const mockMedicos = [
  {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@clinica.com',
    especialidad: 'Cardiología',
    telefono: '+54 11 1234-5678',
    activo: true
  },
  {
    id: 2,
    nombre: 'Ana',
    apellido: 'López',
    email: 'ana.lopez@clinica.com',
    especialidad: 'Pediatría',
    telefono: '+54 11 2345-6789',
    activo: true
  },
  {
    id: 3,
    nombre: 'Roberto',
    apellido: 'Martínez',
    email: 'roberto.martinez@clinica.com',
    especialidad: 'Dermatología',
    telefono: '+54 11 3456-7890',
    activo: false
  }
];

// Mock de pacientes
export const mockPacientes = [
  {
    id: 1,
    nombre: 'María',
    apellido: 'González',
    email: 'maria@email.com',
    telefono: '+54 11 1111-1111',
    fechaNacimiento: '1985-05-15',
    obraSocial: 'OSDE'
  },
  {
    id: 2,
    nombre: 'Carlos',
    apellido: 'Martínez',
    email: 'carlos@email.com',
    telefono: '+54 11 2222-2222',
    fechaNacimiento: '1990-08-22',
    obraSocial: 'Swiss Medical'
  }
];

// Especialidades disponibles
export const especialidades = [
  'Cardiología',
  'Pediatría',
  'Dermatología',
  'Neurología',
  'Oftalmología',
  'Otorrinolaringología',
  'Ginecología',
  'Traumatología'
];

// Helper para obtener turnos de un paciente
export const getTurnosByPaciente = (pacienteId) => {
  return mockTurnos.filter(turno => turno.paciente.id === pacienteId);
};

// Helper para obtener turnos de un médico
export const getTurnosByMedico = (medicoId) => {
  return mockTurnos.filter(turno => turno.medico.id === medicoId);
};

// Helper para obtener turnos de hoy
export const getTurnosToday = () => {
  const today = new Date().toISOString().split('T')[0];
  return mockTurnos.filter(turno => turno.fecha === today);
};

// Helper para obtener turnos futuros
export const getTurnosFuturos = () => {
  const today = new Date().toISOString().split('T')[0];
  return mockTurnos.filter(turno => turno.fecha >= today && turno.estado !== 'completado');
};

// Helper para obtener turnos pasados
export const getTurnosPasados = () => {
  const today = new Date().toISOString().split('T')[0];
  return mockTurnos.filter(turno => turno.fecha < today || turno.estado === 'completado');
};

