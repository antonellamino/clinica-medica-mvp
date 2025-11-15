# Backend - Clínica Médica MVP

## 🚀 Setup Inicial

### Requisitos Previos
- Node.js instalado
- PostgreSQL instalado y corriendo
- Git configurado

### Pasos para Levantar el Backend

1. **Clonar/Pull del repositorio**
   ```bash
   git pull origin develop
   ```

2. **Ir a la carpeta backend**
   ```bash
   cd backend
   ```

3. **Crear archivo `.env`**
   
   Crea un archivo `.env` en la carpeta `backend/` con este contenido:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/clinica_db?schema=public"
   JWT_SECRET=clinica_secret_key_2024_cambiar_en_produccion
   GEMINI_API_KEY=tu_api_key_de_gemini_aqui
   ```
   
   ⚠️ **Importante:** Reemplaza `TU_PASSWORD` con tu contraseña de PostgreSQL.

4. **Instalar dependencias**
   ```bash
   npm install
   ```

5. **Aplicar migraciones** (crea la base de datos y tablas)
   ```bash
   npx prisma migrate deploy
   ```
   
   O si quieres crear la migración desde cero:
   ```bash
   npx prisma migrate dev
   ```

6. **Ejecutar seed** (datos de prueba)
   ```bash
   npx prisma db seed
   ```

7. **Verificar que funcionó**
   
   Deberías ver:
   ```
   🌱 Iniciando seed...
   ✅ Especialidades creadas: [...]
   ✅ Usuario admin creado: admin@clinica.com
   ✅ Médicos de prueba creados: ...
   🎉 Seed completado exitosamente!
   ```

## 🔑 Credenciales de Prueba

### Usuario Admin
- **Email:** `admin@clinica.com`
- **Password:** `admin123`

### Médicos de Prueba
- **Email:** `medico1@clinica.com` / **Password:** `medico123`
- **Email:** `medico2@clinica.com` / **Password:** `medico123`

## 🛠️ Comandos Útiles

### Desarrollo
```bash
npm run dev        # Inicia servidor con nodemon (auto-reload)
npm start          # Inicia servidor normal
```

### Prisma
```bash
npx prisma studio           # Abre Prisma Studio (GUI para ver datos)
npx prisma migrate dev      # Crear nueva migración
npx prisma migrate deploy   # Aplicar migraciones existentes
npx prisma db seed          # Ejecutar seed
```

## ⚠️ Troubleshooting

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté corriendo
- Verifica usuario y contraseña en `.env`
- Verifica que el puerto sea `5432`

### Error en migraciones
```bash
npx prisma migrate reset    # ⚠️ CUIDADO: borra todos los datos
npx prisma migrate dev
npx prisma db seed
```

### Error en seed
- Verifica que las migraciones se aplicaron correctamente
- Verifica que la base de datos existe

## 📝 Notas Importantes

- ⚠️ **NO subir el archivo `.env` a Git** (ya está en `.gitignore`)
- Cada uno debe crear su propio `.env` con sus credenciales de PostgreSQL
- La base de datos es local, cada uno tiene la suya
- El seed se puede ejecutar múltiples veces (usa `upsert`, no duplica datos)

## 📁 Estructura del Proyecto

```
/backend
  /prisma
    schema.prisma      # Modelos de la base de datos
    seed.js            # Datos de prueba
    migrations/        # Migraciones de Prisma
  /routes              # Endpoints de la API
  /middleware          # Middlewares (auth, etc.)
  /services            # Servicios (Gemini, etc.)
  server.js            # Servidor Express
  package.json
  .env                 # Variables de entorno (NO subir a Git)
```

## 🔗 Endpoints (cuando estén implementados)

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/chatbot` - Chatbot con Gemini
- `GET /api/turnos` - Listar turnos
- `POST /api/turnos` - Crear turno
- Y más...

