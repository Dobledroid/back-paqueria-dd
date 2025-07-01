import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database';

// Importar rutas
import authRoutes from './routes/authRoutes';
import reportRoutes from './routes/reportRoutes';
import gastoRoutes from './routes/gastoRoutes';

const app = express();
const PORT = 3010;

// Middlewares globales
app.use(helmet()); // Seguridad HTTP headers
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://paqueria-dd.vercel.app'
  ],
  credentials: true
}));
app.use(morgan('combined')); // Logging de requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB (sin detener el servidor si falla)
connectDB().catch(error => {
  console.error('⚠️ Error inicial de conexión a MongoDB:', error.message);
  console.log('🔄 El servidor continuará funcionando. MongoDB se reconectará automáticamente.');
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/gastos', gastoRoutes);

// Ruta raíz principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Paquetería DD funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      reports: '/api/reports',
      gastos: '/api/gastos'
    }
  });
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Paquetería DD funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Manejo de errores global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor'
  });
});

// Manejo de rutas no encontradas (debe ir al final)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📦 Reports API: http://localhost:${PORT}/api/reports`);
});

export default app;
