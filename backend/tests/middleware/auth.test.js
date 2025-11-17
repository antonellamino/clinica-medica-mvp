import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import jwt from 'jsonwebtoken';

describe('Middleware de Autenticación', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    
    // Resetear mocks
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('verifyToken', () => {
    it('debe permitir acceso con token válido', () => {
      // Arrange
      const mockDecoded = { id: 1, email: 'test@test.com', role: 'paciente' };
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      req.headers.authorization = 'Bearer valid_token_1_paciente';

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid_token_1_paciente', 'test_secret');
      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe rechazar acceso sin token', () => {
      // Arrange
      req.headers.authorization = undefined;

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe rechazar acceso con token inválido', () => {
      // Arrange
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Token inválido');
      });
      req.headers.authorization = 'Bearer invalid_token';

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('debe permitir acceso a admin cuando requiere admin', () => {
      // Arrange
      req.user = { id: 1, role: 'admin' };
      const middleware = requireRole('admin');

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe rechazar acceso cuando el rol no coincide', () => {
      // Arrange
      req.user = { id: 1, role: 'paciente' };
      const middleware = requireRole('admin');

      // Act
      middleware(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autorizado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe rechazar acceso cuando no hay usuario autenticado', () => {
      // Arrange
      req.user = null;
      const middleware = requireRole('admin');

      // Act
      middleware(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

