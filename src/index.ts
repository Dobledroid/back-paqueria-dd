import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

// Importar rutas
import authRoutes from './routes/authRoutes';
import reportRoutes from './routes/reportRoutes';
import gastoRoutes from './routes/gastoRoutes';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middlewares globales
app.use(helmet()); // Seguridad HTTP headers
app.use(cors({
  origin: [
    'http://localhost:4200'
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

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Paquetería DD funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo de errores global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Iniciar servidor solo si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`📦 Reports API: http://localhost:${PORT}/api/reports`);
  });
}

export default app;
