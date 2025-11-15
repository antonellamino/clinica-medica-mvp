import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/register - Registro de paciente
router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre, apellido } = req.body;

    // Validaciones
    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Email, password y nombre son requeridos' });
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

    // Crear usuario
    const user = await prisma.user.create({
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
        role: true,
        nombre: true,
        apellido: true,
      }
    });

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/login - Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Devolver usuario sin password
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      nombre: user.nombre,
      apellido: user.apellido,
    };

    res.json({
      message: 'Login exitoso',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;