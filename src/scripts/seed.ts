import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Report } from '../models/Report';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando población de base de datos...');

    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está configurado');
    }

    await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || 'paqueteria-dd',
    });

    console.log('✅ Conectado a MongoDB Atlas');

    // Limpiar datos existentes (opcional)
    console.log('🧹 Limpiando datos existentes...');
    await User.deleteMany({});
    await Report.deleteMany({});

    // Crear usuarios de prueba
    console.log('👥 Creando usuarios de prueba...');
    
    const adminPassword = await bcrypt.hash('123456', 12);
    const userPassword = await bcrypt.hash('123456', 12);

    const adminUser = await User.create({
      email: 'admin@paqueteria.com',
      password: adminPassword,
      name: 'Admin Paquetería',
      role: 'admin',
      isActive: true
    });

    const regularUser = await User.create({
      email: 'user@paqueteria.com',
      password: userPassword,
      name: 'Usuario Regular',
      role: 'user',
      isActive: true
    });

    console.log('✅ Usuarios creados:', { admin: adminUser.email, user: regularUser.email });

    // Crear reportes de prueba
    console.log('📦 Creando reportes de prueba...');
    
    const reportes = [
      {
        fechaPedido: new Date('2024-06-20'),
        destinatario: 'Juan Pérez González',
        ubicacionEntrega: 'Av. Principal 123, Col. Centro',
        costo: 100.00,
        ganancia: 50.00,
        comentarioPedido: 'Entregado en recepción - Firmado por Juan Pérez',
        estado: 'entregado',
        usuarioCreador: adminUser._id,
        fechaEntrega: new Date('2024-06-22')
      },
      {
        fechaPedido: new Date('2024-06-25'),
        destinatario: 'María González López',
        ubicacionEntrega: 'Calle Secundaria 456, Col. Norte',
        costo: 200.00,
        ganancia: 100.00,
        comentarioPedido: 'Requiere confirmación telefónica antes de entrega',
        estado: 'en_transito',
        usuarioCreador: adminUser._id
      },
      {
        fechaPedido: new Date('2024-06-28'),
        destinatario: 'Carlos López Martínez',
        ubicacionEntrega: 'Boulevard Norte 789, Col. Residencial',
        costo: 50.00,
        ganancia: 25.50,
        comentarioPedido: 'Paquete urgente - Entrega prioritaria',
        estado: 'pendiente',
        usuarioCreador: regularUser._id
      },
      {
        fechaPedido: new Date('2024-06-15'),
        destinatario: 'Ana Rodríguez Silva',
        ubicacionEntrega: 'Calle Los Pinos 321, Fracc. El Bosque',
        costo: 180.00,
        ganancia: 70.75,
        comentarioPedido: 'Entregado - Cliente satisfecho',
        estado: 'entregado',
        usuarioCreador: adminUser._id,
        fechaEntrega: new Date('2024-06-17')
      },
      {
        fechaPedido: new Date('2024-06-18'),
        destinatario: 'Luis García Hernández',
        ubicacionEntrega: 'Av. Revolución 654, Col. Independencia',
        costo: 80.00,
        ganancia: 40.00,
        comentarioPedido: 'Dirección incorrecta - Devuelto al remitente',
        estado: 'cancelado',
        usuarioCreador: regularUser._id
      },
      {
        fechaPedido: new Date('2024-06-26'),
        destinatario: 'Elena Martín Torres',
        ubicacionEntrega: 'Calle Luna 445, Col. Estrella',
        costo: 120.00,
        ganancia: 60.00,
        comentarioPedido: 'Envío express solicitado',
        estado: 'en_transito',
        usuarioCreador: adminUser._id
      },
      {
        fechaPedido: new Date('2024-06-27'),
        destinatario: 'Roberto Silva Cruz',
        ubicacionEntrega: 'Av. Sol 778, Col. Amanecer',
        costo: 90.00,
        ganancia: 45.00,
        comentarioPedido: 'Entrega programada para mañana',
        estado: 'pendiente',
        usuarioCreador: regularUser._id
      }
    ];

    const reportesCreados = await Report.insertMany(reportes);
    console.log(`✅ ${reportesCreados.length} reportes creados`);

    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('👨‍💼 Admin: admin@paqueteria.com / 123456');
    console.log('👤 Usuario: user@paqueteria.com / 123456');
    console.log('\n🔗 APIs disponibles:');
    console.log('• POST /api/auth/login - Iniciar sesión');
    console.log('• GET /api/reports - Ver reportes');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
