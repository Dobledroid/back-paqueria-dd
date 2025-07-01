import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de reportes - las rutas específicas DEBEN ir antes que las rutas con parámetros
router.get('/', ReportController.getReports as any);
router.get('/stats', ReportController.getReportStats as any);
router.get('/chart', ReportController.getReportsForChart as any);
router.post('/', validateRequest(schemas.createReport), ReportController.createReport as any);
router.get('/:id', ReportController.getReportById as any);
router.put('/:id', validateRequest(schemas.updateReport), ReportController.updateReport as any);
router.delete('/:id', ReportController.deleteReport as any);

export default router;
