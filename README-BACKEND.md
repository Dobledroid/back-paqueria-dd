# Backend Paquetería DD

Backend API REST para el sistema de gestión de paquetería desarrollado con Node.js, Express, TypeScript y MongoDB Atlas.

## 🚀 Características

- **API REST completa** con endpoints para autenticación, reportes y métricas
- **Autenticación JWT** con middleware de seguridad
- **MongoDB Atlas** como base de datos en la nube
- **TypeScript** para desarrollo tipado y seguro
- **Express.js** como framework web
- **Middleware de seguridad** (Helmet, CORS, Rate Limiting)
- **Validación de datos** con Joi
- **Deploy ready** para Vercel
- **Documentación** de API integrada

## 📦 Estructura del Proyecto

```
backend-paqueteria-dd/
├── src/
│   ├── config/
│   │   └── database.ts           # Configuración MongoDB
│   ├── controllers/
│   │   ├── AuthController.ts     # Autenticación y usuarios
│   │   ├── ReportController.ts   # Gestión de reportes
│   │   └── MetricsController.ts  # Métricas y dashboard
│   ├── middleware/
│   │   ├── auth.ts              # Middleware autenticación
│   │   └── validation.ts        # Validación de datos
│   ├── models/
│   │   ├── User.ts              # Modelo de usuarios
│   │   ├── Report.ts            # Modelo de reportes
│   │   └── Metrics.ts           # Modelo de métricas
│   ├── routes/
│   │   ├── authRoutes.ts        # Rutas de autenticación
│   │   ├── reportRoutes.ts      # Rutas de reportes
│   │   ├── metricsRoutes.ts     # Rutas de métricas
│   │   └── userRoutes.ts        # Rutas de usuario
│   ├── index.ts                 # Servidor principal (con MongoDB)
│   └── index-dev.ts             # Servidor desarrollo (sin MongoDB)
├── api/                         # Handlers para Vercel
│   ├── auth.ts                  # Handler autenticación
│   ├── reports.ts               # Handler reportes
│   └── metrics.ts               # Handler métricas
├── dist/                        # Compilado TypeScript
├── .env.example                 # Variables de entorno ejemplo
├── .env                         # Variables de entorno (local)
├── package.json                 # Dependencias y scripts
├── tsconfig.json                # Configuración TypeScript
├── vercel.json                  # Configuración Vercel
└── README.md                    # Este archivo
```

## 🛠️ Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# Variables de entorno
NODE_ENV=development
PORT=3000

# MongoDB Atlas Connection - IMPORTANTE: Actualiza con tus credenciales
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/paqueteria-dd?retryWrites=true&w=majority

# JWT Secret - Cambiar por una clave segura
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=7d

# CORS Origins
CORS_ORIGINS=http://localhost:4200,http://localhost:3000
FRONTEND_URL=http://localhost:4200

# Database Configuration
DB_NAME=paqueteria-dd
```

### 3. Configurar MongoDB Atlas

#### Paso 1: Crear cuenta en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (selecciona el tier gratuito M0)

#### Paso 2: Configurar acceso a la base de datos

1. En el panel de MongoDB Atlas:
   - Ve a "Database Access"
   - Crea un nuevo usuario de base de datos
   - Anota el usuario y contraseña

#### Paso 3: Configurar acceso de red

1. Ve a "Network Access"
2. Agrega tu IP actual o `0.0.0.0/0` para desarrollo

#### Paso 4: Obtener string de conexión

1. Ve a "Database" > "Connect"
2. Selecciona "Connect your application"
3. Copia el string de conexión
4. Reemplaza `<password>` con tu contraseña real
5. Actualiza `MONGODB_URI` en tu archivo `.env`

## 🚀 Uso

### Desarrollo Local

#### Servidor simple (sin MongoDB) - Para pruebas iniciales

```bash
npm run dev:simple
```

El servidor estará disponible en: http://localhost:3000

Endpoints de prueba:
- `GET /api/health` - Estado del servidor
- `GET /api/test/auth` - Endpoints de autenticación
- `GET /api/test/reports` - Endpoints de reportes  
- `GET /api/test/metrics` - Endpoints de métricas

#### Servidor completo (con MongoDB)

Una vez configurado MongoDB Atlas:

```bash
npm run dev
```

### Producción

#### Compilar proyecto

```bash
npm run build
```

#### Ejecutar en producción

```bash
npm start
```

## 📡 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuario

- `GET /api/user/profile` - Obtener perfil
- `PUT /api/user/profile` - Actualizar perfil
- `PUT /api/user/change-password` - Cambiar contraseña

### Reportes

- `GET /api/reports` - Obtener todos los reportes
- `GET /api/reports/stats` - Estadísticas de reportes
- `GET /api/reports/:id` - Obtener reporte por ID
- `POST /api/reports` - Crear nuevo reporte
- `PUT /api/reports/:id` - Actualizar reporte
- `DELETE /api/reports/:id` - Eliminar reporte

### Métricas

- `GET /api/metrics/dashboard` - Métricas para dashboard
- `GET /api/metrics/charts` - Datos para gráficas
- `GET /api/metrics/historical` - Métricas históricas
- `GET /api/metrics/yearly-comparison` - Comparación anual
- `POST /api/metrics` - Crear/actualizar métricas (Admin)

## 🚀 Deploy en Vercel

### 1. Preparar el proyecto

```bash
# Instalar Vercel CLI
npm i -g vercel

# Compilar proyecto
npm run build
```

### 2. Configurar variables de entorno en Vercel

En el dashboard de Vercel o mediante CLI:

```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV production
vercel env add DB_NAME paqueteria-dd
```

### 3. Deploy

```bash
vercel --prod
```

## 📊 Modelos de Datos

### Usuario (User)

```typescript
{
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Reporte (Report)

```typescript
{
  numeroGuia: string;
  destinatario: string;
  direccion: string;
  telefono: string;
  estado: 'pendiente' | 'en_transito' | 'entregado' | 'devuelto';
  fechaCreacion: Date;
  fechaEntrega?: Date;
  valorDeclarado: number;
  peso: number;
  observaciones?: string;
  createdBy: ObjectId; // referencia a User
  createdAt: Date;
  updatedAt: Date;
}
```

### Métricas (Metrics)

```typescript
{
  month: number;
  year: number;
  totalInvertido: number;
  ganancias: number;
  gastosCompras: number;
  total: number; // calculado automáticamente
  paquetesEnviados: number;
  paquetesEntregados: number;
  clientesNuevos: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔒 Seguridad

- **JWT Authentication** - Tokens seguros para autenticación
- **bcrypt** - Hash de contraseñas
- **Helmet** - Headers de seguridad HTTP
- **CORS** - Control de acceso entre orígenes
- **Rate Limiting** - Limitación de peticiones
- **Input Validation** - Validación con Joi
- **Environment Variables** - Configuración segura

## 🧪 Testing

### Probar endpoints localmente

```bash
# Health check
curl http://localhost:3000/api/health

# Registro de usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

## 📝 Scripts Disponibles

- `npm run dev` - Servidor desarrollo con MongoDB
- `npm run dev:simple` - Servidor desarrollo sin MongoDB  
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar en producción
- `npm run lint` - Verificar código
- `npm run type-check` - Verificar tipos TypeScript
- `npm run dev:vercel` - Servidor desarrollo Vercel

## 🚨 Solución de Problemas

### Error de conexión MongoDB

Si obtienes errores de conexión:

1. Verifica que `MONGODB_URI` esté correctamente configurado
2. Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
3. Verifica usuario y contraseña de MongoDB
4. Usa `npm run dev:simple` para probar sin MongoDB

### Error de compilación TypeScript

```bash
# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar tipos
npm run type-check
```

### Puerto en uso

Si el puerto 3000 está ocupado, cambia `PORT` en `.env`:

```env
PORT=3001
```

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 👨‍💻 Autor

Desarrollado para el sistema de gestión de Paquetería DD.
