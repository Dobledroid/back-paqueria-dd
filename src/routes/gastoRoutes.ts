import { Router } from 'express';
import { GastoController } from '../controllers/GastoController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /api/gastos - Obtener gastos con paginación y filtros
router.get('/', GastoController.getGastos);

// GET /api/gastos/stats - Obtener estadísticas de gastos
router.get('/stats', GastoController.getGastoStats);

// GET /api/gastos/chart - Obtener datos de gastos para el gráfico
router.get('/chart', GastoController.getGastosForChart);

// POST /api/gastos - Crear nuevo gasto
router.post('/', validateRequest(schemas.createGasto), GastoController.createGasto);

// PUT /api/gastos/:id - Actualizar gasto
router.put('/:id', validateRequest(schemas.updateGasto), GastoController.updateGasto);

// DELETE /api/gastos/:id - Eliminar gasto
router.delete('/:id', GastoController.deleteGasto);

// GET /api/gastos/:id - Obtener gasto por ID (DEBE ir al final)
router.get('/:id', GastoController.getGastoById);

export default router;
