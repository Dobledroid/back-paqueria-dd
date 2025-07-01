# 🔧 Configuración MongoDB Atlas - Guía Paso a Paso

## ❌ Error Actual
```
Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## ✅ Solución: Configurar Acceso de Red

### 1. Abrir MongoDB Atlas Dashboard
- Ve a: https://cloud.mongodb.com/
- Inicia sesión con tu cuenta
- Selecciona tu proyecto `paqueteria-dd`

### 2. Configurar Network Access (Acceso de Red)
1. **En el menú lateral izquierdo, click en "Network Access"**
2. **Click en el botón verde "ADD IP ADDRESS"**
3. **Selecciona una opción:**

   **Opción A - Solo tu IP actual (Más seguro):**
   - Click en "ADD CURRENT IP ADDRESS"
   - Click en "Confirm"

   **Opción B - Acceso desde cualquier lugar (Para desarrollo):**
   - Click en "ALLOW ACCESS FROM ANYWHERE"
   - Esto agregará `0.0.0.0/0`
   - Click en "Confirm"

### 3. Verificar Database Access (Acceso a Base de Datos)
1. **En el menú lateral, click en "Database Access"**
2. **Busca el usuario `20210680`**
3. **Si NO existe, créalo:**
   - Click en "ADD NEW DATABASE USER"
   - **Authentication Method:** Password
   - **Username:** `20210680`
   - **Password:** `20210680`
   - **Database User Privileges:** "Read and write to any database"
   - Click en "Add User"

### 4. Verificar Connection String
El string de conexión que tienes es:
```
mongodb+srv://20210680:20210680@paqueteria-dd.j90aohq.mongodb.net/paqueteria-dd?retryWrites=true&w=majority
```

## 🚀 Después de Configurar MongoDB Atlas

Una vez configurado, ejecuta:

```bash
# Poblar la base de datos con datos de prueba
npm run seed

# Iniciar servidor con MongoDB Atlas
npm run dev
```

## 🧪 Verificar Conexión

Si todo está configurado correctamente, deberías ver:
```
✅ Connected to MongoDB Atlas
🚀 Servidor ejecutándose en puerto 3000
```

## 🔄 Alternativa Temporal

Mientras configuras MongoDB Atlas, puedes usar el servidor mock:

```bash
npm run dev:mock
```

Este servidor tiene todos los endpoints funcionando con datos de prueba.

## 📞 Necesitas Ayuda?

Si sigues teniendo problemas:

1. **Verifica que tu IP esté en la whitelist**
2. **Verifica las credenciales del usuario**
3. **Espera 1-2 minutos después de hacer cambios en Atlas**
4. **Intenta nuevamente con `npm run seed`**

## ✅ Una vez Funcionando

Tendrás acceso a:
- 👨‍💼 **Admin:** admin@paqueteria.com / 123456
- 👤 **Usuario:** user@paqueteria.com / 123456
- 📦 **Reportes de prueba** completos
- 📈 **Métricas de ejemplo** para 6 meses
