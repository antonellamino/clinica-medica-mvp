# 🏥 ChatMedic - Sistema de Gestión de Clínica Médica MVP

Sistema completo de gestión de clínica médica con chatbot inteligente para derivación de pacientes, gestión de turnos, y dashboards para pacientes, médicos y administradores.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Base de Datos](#-base-de-datos)
- [API Endpoints](#-api-endpoints)
- [Tests](#-tests)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Contribución](#-contribución)

## ✨ Características

### 🤖 Chatbot Inteligente
- Asistente virtual para derivación médica basado en síntomas
- Integración con Google Gemini AI para análisis de síntomas
- Detección automática de urgencias médicas
- Recomendación de especialidades según síntomas
- Flujo completo de agendamiento de turnos desde el chatbot

### 👥 Gestión de Usuarios
- **Pacientes**: Registro, login, gestión de turnos propios
- **Médicos**: Dashboard para ver y confirmar turnos
- **Administradores**: CRUD completo de médicos, pacientes y turnos

### 📅 Sistema de Turnos
- Agendamiento de turnos con validación de disponibilidad
- Horarios disponibles en tiempo real
- Estados de turnos: pendiente, confirmado, cancelado
- Filtros por fecha, médico y especialidad

### 🎨 Interfaz de Usuario
- Diseño moderno y responsive con Bootstrap 5
- Tema claro/oscuro
- Interfaz intuitiva y fácil de usar
- Componentes reutilizables

## 🛠 Tecnologías

### Backend
- **Node.js** + **Express.js** - Servidor REST API
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **bcrypt** - Encriptación de contraseñas
- **Google Generative AI** - Chatbot inteligente

### Frontend
- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router v6** - Enrutamiento
- **Axios** - Cliente HTTP
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Iconografía

### Testing
- **Jest** - Testing framework (Backend)
- **Vitest** - Testing framework (Frontend)
- **React Testing Library** - Testing de componentes React
- **Supertest** - Testing de endpoints HTTP

## 📁 Estructura del Proyecto

```
clinica-medica-mvp/
├── backend/                 # API REST
│   ├── middleware/          # Middlewares de autenticación
│   ├── routes/              # Rutas de la API
│   ├── prisma/              # Schema y migraciones de BD
│   ├── __tests__/           # Tests del backend
│   └── server.js            # Punto de entrada del servidor
│
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/           # Páginas/views
│   │   ├── context/         # Context API (Auth, Theme)
│   │   ├── services/        # Servicios API
│   │   └── __tests__/       # Tests del frontend
│   └── public/              # Assets estáticos
│
└── README.md                # Este archivo
```

## 📦 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Cuenta de Google Cloud** (para API Key de Gemini)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd clinica-medica-mvp
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar Base de Datos

Crear una base de datos PostgreSQL:

```sql
CREATE DATABASE clinica_medica;
```

### 5. Configurar Variables de Entorno

#### Backend (`.env` en `/backend`)

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/clinica_medica?schema=public"

# JWT
JWT_SECRET="tu-secret-key-super-segura-aqui"

# Google Gemini API
GEMINI_API_KEY="tu-api-key-de-google-gemini"

# Puerto del servidor
PORT=3000
```

#### Frontend (`.env` en `/frontend`)

```env
VITE_API_URL=http://localhost:3000/api
```

### 6. Ejecutar Migraciones

```bash
cd backend
npx prisma migrate dev
```

### 7. (Opcional) Poblar Base de Datos

```bash
npx prisma db seed
```

## ⚙️ Configuración

### Variables de Entorno Requeridas

#### Backend
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para firmar tokens JWT
- `GEMINI_API_KEY`: API Key de Google Generative AI
- `PORT`: Puerto del servidor (default: 3000)

#### Frontend
- `VITE_API_URL`: URL base de la API (default: http://localhost:3000/api)

## 🎯 Uso

### Desarrollo

#### Iniciar Backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

#### Iniciar Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Producción

#### Build del Frontend

```bash
cd frontend
npm run build
```

#### Iniciar Backend en Producción

```bash
cd backend
npm start
```

## 🗄️ Base de Datos

### Modelos Principales

#### User
- Usuarios del sistema (pacientes, médicos, administradores)
- Campos: id, email, password, role, nombre, apellido, teléfono, etc.

#### Especialidad
- Especialidades médicas disponibles
- Campos: id, nombre

#### Medico
- Información de médicos
- Campos: id, userId, especialidadId, horarioInicio, horarioFin, diasSemana

#### Turno
- Turnos médicos agendados
- Campos: id, pacienteId, medicoId, fecha, hora, motivo, estado

### Diagrama de Relaciones

```
User (1) ──< (1) Medico
User (1) ──< (N) Turno (como paciente)
Medico (1) ──< (N) Turno
Especialidad (1) ──< (N) Medico
```

## 🔌 API Endpoints

### Autenticación (`/api/auth`)

- `POST /api/auth/register` - Registro de paciente (público)
- `POST /api/auth/login` - Login (público)

### Turnos (`/api/turnos`)

- `GET /api/turnos` - Listar turnos según rol (requiere auth)
- `POST /api/turnos` - Crear turno (requiere auth, solo pacientes)
- `GET /api/turnos/disponibilidad/:medicoId?fecha=YYYY-MM-DD` - Horarios disponibles (público)
- `PUT /api/turnos/:id/cancelar` - Cancelar turno (requiere auth)
- `PUT /api/turnos/:id/confirmar` - Confirmar turno (requiere auth, solo médicos)

### Médicos (`/api/medicos`)

- `GET /api/medicos?especialidad_id=X` - Listar médicos (público, filtro opcional)

### Especialidades (`/api/especialidades`)

- `GET /api/especialidades` - Listar especialidades (público)

### Chatbot (`/api/chatbot`)

- `POST /api/chatbot` - Analizar síntomas y recomendar especialidad (requiere auth, solo pacientes)

### Admin (`/api/admin`)

- `GET /api/admin/pacientes` - Listar pacientes (requiere admin)
- `POST /api/admin/pacientes` - Crear paciente (requiere admin)
- `PUT /api/admin/pacientes/:id` - Actualizar paciente (requiere admin)
- `DELETE /api/admin/pacientes/:id` - Eliminar paciente (requiere admin)
- `GET /api/admin/medicos` - Listar médicos (requiere admin)
- `POST /api/admin/medicos` - Crear médico (requiere admin)
- `PUT /api/admin/medicos/:id` - Actualizar médico (requiere admin)
- `DELETE /api/admin/medicos/:id` - Eliminar médico (requiere admin)
- `GET /api/admin/turnos` - Ver todos los turnos (requiere admin)

## 🧪 Tests

### Backend

```bash
cd backend
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch
npm run test:coverage # Con cobertura
```

**Tests incluidos:**
- Middleware de autenticación
- Endpoint POST /api/chatbot
- Endpoints de turnos (GET disponibilidad, POST turnos)

### Frontend

```bash
cd frontend
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch
npm run test:coverage # Con cobertura
```

**Tests incluidos:**
- Componente Chatbot
- AuthContext
- Servicio API

Ver [TESTS.md](./TESTS.md) para más detalles sobre los tests.

## 📂 Estructura de Carpetas Detallada

### Backend

```
backend/
├── middleware/
│   └── auth.js              # Middleware de autenticación JWT
├── routes/
│   ├── admin.js             # Rutas de administración
│   ├── auth.js              # Rutas de autenticación
│   ├── chatbot.js           # Rutas del chatbot
│   ├── especialidades.js    # Rutas de especialidades
│   ├── medicos.js           # Rutas de médicos
│   └── turnos.js            # Rutas de turnos
├── prisma/
│   ├── schema.prisma        # Schema de la base de datos
│   ├── migrations/          # Migraciones de BD
│   └── seed.js              # Script para poblar BD
├── __tests__/               # Tests del backend
└── server.js                # Servidor Express
```

### Frontend

```
frontend/src/
├── components/
│   ├── admin/               # Componentes del dashboard admin
│   ├── sacarTurno/          # Componentes del flujo de turnos
│   ├── Chatbot.jsx          # Componente del chatbot
│   ├── Footer.jsx           # Footer
│   ├── Navbar.jsx           # Barra de navegación
│   └── ProtectedRoute.jsx  # Componente de protección de rutas
├── pages/
│   ├── admin/               # Páginas del admin
│   ├── AdminDashboard.jsx   # Dashboard de administrador
│   ├── DashboardMedico.jsx  # Dashboard de médico
│   ├── DashboardPaciente.jsx # Dashboard de paciente
│   ├── Home.jsx             # Página principal
│   ├── Login.jsx            # Página de login
│   ├── Registro.jsx         # Página de registro
│   └── ...
├── context/
│   ├── AuthContext.jsx       # Contexto de autenticación
│   └── ThemeContext.jsx     # Contexto de tema
├── services/
│   └── api.js               # Cliente HTTP configurado
└── __tests__/               # Tests del frontend
```

## 🎨 Paleta de Colores

- **Primario**: `#1E6FFB`
- **Fondo**: `#F5F6FA`
- **Texto**: `#1E1E1E`
- **Éxito**: `#2ECC71`

## 🔐 Roles y Permisos

### Paciente
- Ver y gestionar sus propios turnos
- Crear nuevos turnos
- Cancelar sus turnos
- Usar el chatbot

### Médico
- Ver sus turnos asignados
- Confirmar turnos pendientes
- Cancelar sus turnos

### Administrador
- CRUD completo de médicos
- CRUD completo de pacientes
- Ver todos los turnos
- Gestión completa del sistema

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verificar que PostgreSQL esté corriendo
- Verificar la `DATABASE_URL` en `.env`
- Verificar que la base de datos exista

### Error 401 (No autenticado)
- Verificar que el token JWT esté presente en el header
- Verificar que `JWT_SECRET` esté configurado correctamente
- Verificar que el token no haya expirado

### Error del Chatbot
- Verificar que `GEMINI_API_KEY` esté configurado
- Verificar que la API key sea válida
- Revisar los logs del servidor

## 📝 Scripts Disponibles

### Backend
- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo (con nodemon)
- `npm test` - Ejecutar tests
- `npm run test:watch` - Tests en modo watch
- `npm run test:coverage` - Tests con cobertura

### Frontend
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm test` - Ejecutar tests
- `npm run test:watch` - Tests en modo watch
- `npm run test:coverage` - Tests con cobertura
- `npm run lint` - Ejecutar linter


## 📄 Licencia

Este proyecto es un MVP (Minimum Viable Product) desarrollado para fines educativos y de demostración.

## 👥 Autores

Juan Burgos  
Ignacio Salas  
Antonella Miño  
Miguel

**Nota**: Este es un proyecto MVP. Para uso en producción, se recomienda implementar medidas adicionales de seguridad, validación de datos más robusta, y optimizaciones de rendimiento.



