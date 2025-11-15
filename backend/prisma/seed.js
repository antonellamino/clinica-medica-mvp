import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear especialidades
  const especialidades = await Promise.all([
    prisma.especialidad.upsert({
      where: { nombre: 'Gastroenterología' },
      update: {},
      create: { nombre: 'Gastroenterología' },
    }),
    prisma.especialidad.upsert({
      where: { nombre: 'Oftalmología' },
      update: {},
      create: { nombre: 'Oftalmología' },
    }),
    prisma.especialidad.upsert({
      where: { nombre: 'Cardiología' },
      update: {},
      create: { nombre: 'Cardiología' },
    }),
    prisma.especialidad.upsert({
      where: { nombre: 'Dermatología' },
      update: {},
      create: { nombre: 'Dermatología' },
    }),
  ]);

  console.log('✅ Especialidades creadas:', especialidades.map(e => e.nombre));

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinica.com' },
    update: {},
    create: {
      email: 'admin@clinica.com',
      password: hashedPassword,
      role: 'admin',
      nombre: 'Admin',
      apellido: 'Sistema',
    },
  });

  console.log('✅ Usuario admin creado:', admin.email);

  // Crear médicos de prueba (opcional)
  const medico1 = await prisma.user.upsert({
    where: { email: 'medico1@clinica.com' },
    update: {},
    create: {
      email: 'medico1@clinica.com',
      password: await bcrypt.hash('medico123', 10),
      role: 'medico',
      nombre: 'Dr. Juan',
      apellido: 'Pérez',
      medico: {
        create: {
          especialidadId: especialidades[0].id, // Gastroenterología
          horarioInicio: '09:00',
          horarioFin: '17:00',
          diasSemana: 'lunes,martes,miercoles,jueves,viernes',
        },
      },
    },
    include: { medico: true },
  });

  const medico2 = await prisma.user.upsert({
    where: { email: 'medico2@clinica.com' },
    update: {},
    create: {
      email: 'medico2@clinica.com',
      password: await bcrypt.hash('medico123', 10),
      role: 'medico',
      nombre: 'Dra. María',
      apellido: 'González',
      medico: {
        create: {
          especialidadId: especialidades[1].id, // Oftalmología
          horarioInicio: '08:00',
          horarioFin: '16:00',
          diasSemana: 'lunes,martes,miercoles,jueves',
        },
      },
    },
    include: { medico: true },
  });

  console.log('✅ Médicos de prueba creados:', medico1.email, medico2.email);
  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


