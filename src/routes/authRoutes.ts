import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post('/register', validateRequest(schemas.register), AuthController.register);
router.post('/login', validateRequest(schemas.login), AuthController.login);

// Rutas protegidas (requieren autenticación) - se manejan en las rutas principales
export default router;
