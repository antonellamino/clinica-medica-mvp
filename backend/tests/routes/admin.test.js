import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../helpers/app.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock de Prisma - se usa el mock global configurado en setup.js
const prisma = global.prismaMock || {};

describe('Rutas de Administración', () => {
  let adminToken;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
    
    // Token mock para admin
    adminToken = 'valid_token_1_admin';
    jwt.verify = jest.fn().mockReturnValue({
      id: 1,
      email: 'admin@test.com',
      role: 'admin'
    });
  });

  describe('GET /api/admin/pacientes', () => {
    it('debe listar todos los pacientes con conteo de turnos', async () => {
      // Arrange
      const mockPacientes = [
        {
          id: 1,
          email: 'paciente1@test.com',
          nombre: 'Juan',
          apellido: 'Pérez',
          role: 'paciente',
          createdAt: new Date(),
          _count: {
            turnosPaciente: 3
          }
        },
        {
          id: 2,
          email: 'paciente2@test.com',
          nombre: 'María',
          apellido: 'González',
          role: 'paciente',
          createdAt: new Date(),
          _count: {
            turnosPaciente: 1
          }
        }
      ];

      prisma.user.findMany = jest.fn().mockResolvedValue(mockPacientes);

      // Act
      const response = await request(app)
        .get('/api/admin/pacientes')
        .set('Authorization', `Bearer ${adminToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('_count');
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'paciente' },
        select: expect.any(Object),
        orderBy: { nombre: 'asc' }
      });
    });

    it('debe rechazar acceso sin token', async () => {
      // Act
      const response = await request(app)
        .get('/api/admin/pacientes');

      // Assert
      expect(response.status).toBe(401);
    });

    it('debe rechazar acceso si no es admin', async () => {
      // Arrange
      const pacienteToken = 'valid_token_2_paciente';
      jwt.verify = jest.fn().mockReturnValue({
        id: 2,
        email: 'paciente@test.com',
        role: 'paciente'
      });

      // Act
      const response = await request(app)
        .get('/api/admin/pacientes')
        .set('Authorization', `Bearer ${pacienteToken}`);

      // Assert
      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/admin/pacientes', () => {
    it('debe crear un paciente exitosamente', async () => {
      // Arrange
      const pacienteData = {
        nombre: 'Nuevo',
        apellido: 'Paciente',
        email: 'nuevo@test.com',
        password: 'password123'
      };

      const mockPaciente = {
        id: 3,
        ...pacienteData,
        role: 'paciente',
        createdAt: new Date()
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.user.create = jest.fn().mockResolvedValue(mockPaciente);
      bcrypt.hash = jest.fn().mockResolvedValue('hashed_password');

      // Act
      const response = await request(app)
        .post('/api/admin/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(pacienteData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('paciente');
      expect(response.body.paciente.email).toBe(pacienteData.email);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('debe rechazar creación con password muy corto', async () => {
      // Arrange
      const pacienteData = {
        nombre: 'Nuevo',
        email: 'nuevo@test.com',
        password: '12345' // Menos de 6 caracteres
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/api/admin/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(pacienteData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password debe tener al menos 6 caracteres');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });
});

