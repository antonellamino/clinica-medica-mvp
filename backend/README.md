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

## 🔗 Endpoints Disponibles

### Autenticación

#### POST /api/auth/register
Registra un nuevo paciente en el sistema.

**Body:**
```json
{
  "email": "test@test.com",
  "password": "123456",
  "nombre": "Test",
  "apellido": "Usuario"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 4,
    "email": "test@test.com",
    "role": "paciente",
    "nombre": "Test",
    "apellido": "Usuario"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `400` - "Email, password y nombre son requeridos"
- `400` - "Password debe tener al menos 6 caracteres"
- `400` - "Email ya registrado"

---

#### POST /api/auth/login
Inicia sesión con email y password.

**Body:**
```json
{
  "email": "admin@clinica.com",
  "password": "admin123"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "email": "admin@clinica.com",
    "role": "admin",
    "nombre": "Admin",
    "apellido": "Sistema"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `400` - "Email y password son requeridos"
- `401` - "Credenciales inválidas"

**Nota:** El token debe enviarse en el header `Authorization: Bearer TOKEN` para endpoints protegidos.

---

### Health Check

#### GET /health
Verifica que el servidor esté funcionando.

**Respuesta exitosa (200):**
```json
{
  "message": "health check ok"
}
```

---

### Endpoints Auxiliares

#### GET /api/especialidades
Lista todas las especialidades disponibles.

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Gastroenterología"
  },
  {
    "id": 2,
    "nombre": "Oftalmología"
  }
]
```

---

#### GET /api/medicos
Lista todos los médicos. Opcionalmente puede filtrarse por especialidad.

**Query Parameters:**
- `especialidad_id` (opcional): Filtrar médicos por especialidad

**Ejemplo:**
```
GET /api/medicos
GET /api/medicos?especialidad_id=1
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "userId": 2,
    "nombre": "Dr. Juan",
    "apellido": "Pérez",
    "email": "medico1@clinica.com",
    "especialidad": {
      "id": 1,
      "nombre": "Gastroenterología"
    },
    "horarioInicio": "09:00",
    "horarioFin": "17:00",
    "diasSemana": ["lunes", "martes", "miercoles", "jueves", "viernes"]
  }
]
```

---

### Turnos

#### GET /api/turnos/disponibilidad/:medicoId
Obtiene los horarios disponibles de un médico en una fecha específica. **Público** (no requiere autenticación).

**Query Parameters:**
- `fecha` (requerido): Fecha en formato YYYY-MM-DD

**Ejemplo:**
```
GET /api/turnos/disponibilidad/1?fecha=2024-11-20
```

**Respuesta exitosa (200):**
```json
{
  "medico": {
    "id": 1,
    "nombre": "Dr. Juan Pérez"
  },
  "fecha": "2024-11-20",
  "horarios": ["09:00", "09:30", "10:00", "10:30", "11:00"]
}
```

**Errores:**
- `400` - "Parámetro fecha es requerido"
- `400` - "No se pueden agendar turnos en fechas pasadas"
- `404` - "Médico no encontrado"

---

#### GET /api/turnos
Lista los turnos según el rol del usuario autenticado. **Requiere autenticación**.

- **Paciente**: Ve solo sus turnos
- **Médico**: Ve solo sus turnos (donde él es el médico)
- **Admin**: Ve todos los turnos

**Headers:**
```
Authorization: Bearer TOKEN
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "pacienteId": 3,
    "medicoId": 1,
    "fecha": "2024-11-20T00:00:00.000Z",
    "hora": "09:00",
    "motivo": "Dolor de estómago",
    "estado": "pendiente",
    "paciente": {
      "id": 3,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@test.com"
    },
    "medico": {
      "user": {
        "nombre": "Dr. Juan",
        "apellido": "García"
      },
      "especialidad": {
        "nombre": "Gastroenterología"
      }
    }
  }
]
```

---

#### POST /api/turnos
Crea un nuevo turno. **Requiere autenticación** (solo pacientes).

**Headers:**
```
Authorization: Bearer TOKEN
```

**Body:**
```json
{
  "medico_id": 1,
  "fecha": "2024-11-20",
  "hora": "09:00",
  "motivo": "Dolor de estómago"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Turno creado exitosamente",
  "turno": {
    "id": 1,
    "pacienteId": 3,
    "medicoId": 1,
    "fecha": "2024-11-20T00:00:00.000Z",
    "hora": "09:00",
    "motivo": "Dolor de estómago",
    "estado": "pendiente"
  }
}
```

**Errores:**
- `400` - "medico_id, fecha y hora son requeridos"
- `400` - "No se pueden agendar turnos en fechas pasadas"
- `400` - "El médico no atiende los [día]s"
- `400` - "Este horario ya está ocupado"
- `403` - "Solo los pacientes pueden crear turnos"
- `404` - "Médico no encontrado"

---

### Admin

#### POST /api/admin/medicos
Crea un nuevo médico y su usuario asociado automáticamente. **Requiere autenticación** y role `admin`.

**Headers:**
```
Authorization: Bearer TOKEN (de admin)
```

**Body:**
```json
{
  "nombre": "Dr. Carlos",
  "apellido": "López",
  "email": "carlos@test.com",
  "password": "password123",
  "especialidad_id": 1,
  "horario_inicio": "09:00",
  "horario_fin": "17:00",
  "dias_semana": "lunes,martes,miercoles,jueves,viernes"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Médico creado exitosamente",
  "medico": {
    "id": 3,
    "userId": 4,
    "especialidadId": 1,
    "horarioInicio": "09:00",
    "horarioFin": "17:00",
    "diasSemana": "lunes,martes,miercoles,jueves,viernes",
    "user": {
      "id": 4,
      "nombre": "Dr. Carlos",
      "apellido": "López",
      "email": "carlos@test.com",
      "role": "medico"
    },
    "especialidad": {
      "id": 1,
      "nombre": "Gastroenterología"
    }
  }
}
```

**Errores:**
- `400` - "nombre, email, password, especialidad_id, horario_inicio, horario_fin y dias_semana son requeridos"
- `400` - "Password debe tener al menos 6 caracteres"
- `400` - "Email ya registrado"
- `403` - "No autorizado" (si no es admin)
- `404` - "Especialidad no encontrada"

**Nota:** Crea automáticamente el usuario con role 'medico' y luego crea el médico asociado.

---

#### PUT /api/admin/medicos/:id
Actualiza un médico existente. **Requiere autenticación** y role `admin`.

**Headers:**
```
Authorization: Bearer TOKEN (de admin)
```

**Body (todos los campos son opcionales):**
```json
{
  "nombre": "Dr. Carlos",
  "apellido": "López",
  "email": "carlos.nuevo@test.com",
  "password": "nuevopassword123",
  "especialidad_id": 2,
  "horario_inicio": "10:00",
  "horario_fin": "18:00",
  "dias_semana": "lunes,martes,miercoles"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Médico actualizado exitosamente",
  "medico": { ... }
}
```

**Errores:**
- `400` - "Password debe tener al menos 6 caracteres"
- `400` - "Email ya está en uso por otro usuario"
- `403` - "No autorizado" (si no es admin)
- `404` - "Médico no encontrado"
- `404` - "Especialidad no encontrada"

---

#### DELETE /api/admin/medicos/:id
Elimina un médico. **Requiere autenticación** y role `admin`.

**Headers:**
```
Authorization: Bearer TOKEN (de admin)
```

**Respuesta exitosa (200):**
```json
{
  "message": "Médico eliminado exitosamente"
}
```

**Errores:**
- `403` - "No autorizado" (si no es admin)
- `404` - "Médico no encontrado"

**Nota:** Elimina el médico y sus turnos asociados (cascade). El usuario se mantiene pero su role cambia a 'paciente'.

---

#### GET /api/admin/turnos
Lista todos los turnos del sistema. **Requiere autenticación** y role `admin`.

**Headers:**
```
Authorization: Bearer TOKEN (de admin)
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "paciente": { ... },
    "medico": { ... },
    "fecha": "...",
    "hora": "09:00",
    "motivo": "...",
    "estado": "pendiente"
  }
]
```

**Nota:** Este endpoint es equivalente a `GET /api/turnos` cuando el usuario es admin.

---

## 🔗 Endpoints Pendientes

- `POST /api/chatbot` - Chatbot con Gemini

