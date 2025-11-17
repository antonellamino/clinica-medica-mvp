// Configuración global para tests
import dotenv from 'dotenv';
import { jest } from '@jest/globals';

// Cargar variables de entorno de test
dotenv.config({ path: '.env.test' });

// Crear mock global de Prisma
global.prismaMock = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  medico: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  especialidad: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  turno: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
  },
};

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => {
    // Simular comparación: si el hash contiene el password, es válido
    return Promise.resolve(hash === `hashed_${password}`);
  }),
}));

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options) => {
    return `mock_token_${payload.id}_${payload.role}`;
  }),
  verify: jest.fn((token, secret) => {
    // Simular verificación de token
    if (token && token.startsWith('valid_token_')) {
      const parts = token.replace('valid_token_', '').split('_');
      return {
        id: parseInt(parts[0]),
        email: `user${parts[0]}@test.com`,
        role: parts[1] || 'paciente',
      };
    }
    throw new Error('Token inválido');
  }),
}));

// Mock de @prisma/client
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => global.prismaMock),
  };
});

