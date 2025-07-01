import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  // Registro de usuarios
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, role = 'user' } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
        return;
      }

      // Encriptar la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear el usuario
      const user = new User({
        email,
        password: hashedPassword,
        name,
        role
      });

      await user.save();

      // Generar token JWT
      const token = AuthController.generateToken((user._id as any).toString());

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  // Login de usuarios
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Buscar el usuario
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();

      // Generar token JWT
      const token = AuthController.generateToken((user._id as any).toString());

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            lastLogin: user.lastLogin
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  // Método privado para generar token JWT
  private static generateToken(userId: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn as any });
  }
}
