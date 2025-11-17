import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../helpers/app.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock de Prisma - se usa el mock global configurado en setup.js
const prisma = global.prismaMock || {};

describe('Rutas de Autenticación', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un paciente exitosamente', async () => {
      // Arrange
      const userData = {
        email: 'nuevo@test.com',
        password: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez'
      };

      const mockUser = {
        id: 1,
        email: userData.email,
        role: 'paciente',
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: null,
        fecha_nacimiento: null,
        obra_social: null,
        direccion: null,
        dni: null,
        createdAt: new Date()
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.user.create = jest.fn().mockResolvedValue(mockUser);
      bcrypt.hash = jest.fn().mockResolvedValue('hashed_password');
      jwt.sign = jest.fn().mockReturnValue('mock_token');

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email }
      });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('debe rechazar registro con email duplicado', async () => {
      // Arrange
      const userData = {
        email: 'existente@test.com',
        password: 'password123',
        nombre: 'Juan'
      };

      const existingUser = {
        id: 1,
        email: userData.email
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(existingUser);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email ya registrado');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('debe rechazar registro con password muy corto', async () => {
      // Arrange
      const userData = {
        email: 'test@test.com',
        password: '12345', // Menos de 6 caracteres
        nombre: 'Juan'
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password debe tener al menos 6 caracteres');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('debe rechazar registro sin campos requeridos', async () => {
      // Arrange
      const userData = {
        email: 'test@test.com'
        // Falta password y nombre
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email, password y nombre son requeridos');
    });
  });

  describe('POST /api/auth/login', () => {
    it('debe hacer login exitosamente con credenciales válidas', async () => {
      // Arrange
      const loginData = {
        email: 'usuario@test.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        password: 'hashed_password123',
        role: 'paciente',
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: null,
        fecha_nacimiento: null,
        obra_social: null,
        direccion: null,
        dni: null,
        createdAt: new Date()
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue('mock_token');

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
    });

    it('debe rechazar login con credenciales inválidas', async () => {
      // Arrange
      const loginData = {
        email: 'usuario@test.com',
        password: 'password_incorrecto'
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        password: 'hashed_password123',
        role: 'paciente'
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('debe rechazar login con usuario no encontrado', async () => {
      // Arrange
      const loginData = {
        email: 'noexiste@test.com',
        password: 'password123'
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('debe rechazar login sin campos requeridos', async () => {
      // Arrange
      const loginData = {
        email: 'test@test.com'
        // Falta password
      };

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email y password son requeridos');
    });
  });
});

