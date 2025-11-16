# 📋 ANÁLISIS COMPLETO DEL PROYECTO - ChatMedic MVP

## Fecha del Análisis: 2024-12-19

---

## 🎯 RESUMEN EJECUTIVO

Este documento contiene el análisis completo del proyecto frontend y backend para entender la estructura existente antes de implementar/mejorar los dashboards.

---

## 📁 ESTRUCTURA DEL PROYECTO

### Frontend (`/frontend`)
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Estado Global**: Context API (AuthContext, ThemeContext)
- **HTTP Client**: Axios con interceptors
- **UI Framework**: Bootstrap 5.3.2 + Bootstrap Icons
- **Autenticación**: JWT almacenado en localStorage

### Backend (`/backend`)
- **Framework**: Express.js
- **ORM**: Prisma con PostgreSQL
- **Autenticación**: JWT con bcrypt
- **Middleware**: Autenticación por roles (admin, medico, paciente)

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS (Prisma Schema)

### Modelo `User`
- `id`: Int (PK)
- `email`: String (unique)
- `password`: String (hashed)
- `role`: String ('paciente' | 'medico' | 'admin')
- `nombre`: String
- `apellido`: String?
- `createdAt`: DateTime

**Relaciones:**
- `medico`: Relación 1:1 con Medico (opcional)
- `turnosPaciente`: Relación 1:N con Turno (como paciente)

### Modelo `Especialidad`
- `id`: Int (PK)
- `nombre`: String (unique)

**Relaciones:**
- `medicos`: Relación 1:N con Medico

### Modelo `Medico`
- `id`: Int (PK)
- `userId`: Int (FK, unique) → User
- `especialidadId`: Int (FK) → Especialidad
- `horarioInicio`: String (ej: '09:00')
- `horarioFin`: String (ej: '17:00')
- `diasSemana`: String (ej: 'lunes,martes,miercoles')

**Relaciones:**
- `user`: Relación 1:1 con User
- `especialidad`: Relación N:1 con Especialidad
- `turnos`: Relación 1:N con Turno

### Modelo `Turno`
- `id`: Int (PK)
- `pacienteId`: Int (FK) → User
- `medicoId`: Int (FK) → Medico
- `fecha`: DateTime
- `hora`: String (ej: '09:00')
- `motivo`: String?
- `estado`: String ('pendiente' | 'confirmado' | 'cancelado') - default: 'pendiente'
- `createdAt`: DateTime

**Relaciones:**
- `paciente`: Relación N:1 con User
- `medico`: Relación N:1 con Medico

---

## 🔌 ENDPOINTS DEL BACKEND

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registro de paciente (público)
- `POST /api/auth/login` - Login (público)

### Turnos (`/api/turnos`)
- `GET /api/turnos` - Listar turnos según rol (requiere auth)
  - Admin: todos los turnos
  - Médico: sus turnos
  - Paciente: sus turnos
- `POST /api/turnos` - Crear turno (requiere auth, solo pacientes)
  - Body: `{ medico_id, fecha, hora, motivo? }`
- `GET /api/turnos/disponibilidad/:medicoId?fecha=YYYY-MM-DD` - Obtener horarios disponibles (público)

### Médicos (`/api/medicos`)
- `GET /api/medicos?especialidad_id=X` - Listar médicos (público, filtro opcional por especialidad)

### Admin (`/api/admin`)
- `POST /api/admin/medicos` - Crear médico (requiere admin)
- `PUT /api/admin/medicos/:id` - Actualizar médico (requiere admin)
- `DELETE /api/admin/medicos/:id` - Eliminar médico (requiere admin)
- `GET /api/admin/pacientes` - Listar pacientes (requiere admin)
- `POST /api/admin/pacientes` - Crear paciente (requiere admin)
- `PUT /api/admin/pacientes/:id` - Actualizar paciente (requiere admin)
- `DELETE /api/admin/pacientes/:id` - Eliminar paciente (requiere admin)
- `GET /api/admin/turnos` - Ver todos los turnos (requiere admin)

### Especialidades (`/api/especialidades`)
- (Endpoint no revisado, asumir que existe)

---

## 🎨 PATRONES DE DISEÑO Y ESTÉTICA

### Paleta de Colores
- **Primario**: `#1E6FFB`
- **Fondo**: `#F5F6FA`
- **Texto**: `#1E1E1E`
- **Éxito**: `#2ECC71`
- **Texto Botones**: `#F5F6FA`

### Clases Bootstrap Personalizadas
- `.card-custom`: Border-radius 16px, sombra suave
- `.btn-primary-custom`: Botón primario con color #1E6FFB
- `.btn-success-custom`: Botón éxito con color #2ECC71
- `.form-control-custom`: Inputs con border-radius 12px
- `.rounded-custom`: Border-radius 12px
- `.shadow-soft`: Sombra suave

### Estructura de Layouts
- `main` con clase `container my-5 flex-grow-1`
- `row` para organización en columnas
- `col-lg-*` para responsive design
- Cards con `card-custom` y `card-body p-4` o `p-5`

### Tipografía
- Títulos: `color: '#1E1E1E'`, `fontWeight: '600'`
- Labels: `fontWeight: '500'`
- Links: `color: '#1E6FFB'`, `fontSize: '14px'`

---

## 📄 COMPONENTES EXISTENTES (Frontend)

### Páginas Principales
1. **Home.jsx** ✅
   - Login integrado
   - Chatbot permanente visible
   - Muestra info de sesión si está autenticado

2. **Login.jsx** ✅
   - Formulario de login
   - Redirige según rol

3. **Registro.jsx** ✅
   - Registro de pacientes

4. **AdminDashboard.jsx** ✅
   - Layout con sidebar
   - Navegación a ListadoMedicos y ListadoPacientes
   - Usa `<Outlet />` para rutas anidadas

5. **ListadoMedicos.jsx** ✅
   - Tabla de médicos
   - Modales: Crear, Ver, Editar, Eliminar

6. **ListadoPacientes.jsx** ✅
   - Tabla de pacientes
   - Modales: Crear, Ver, Editar, Eliminar

7. **Perfil.jsx** ✅
   - (No revisado en detalle)

8. **Contacto.jsx** ✅
   - Formulario de contacto

9. **Error404.jsx** ✅
   - Página de error

### Componentes
1. **Navbar.jsx** ✅
   - Navegación según rol
   - Toggle de tema oscuro/claro
   - Logout

2. **Footer.jsx** ✅
   - Footer con links sociales

3. **ProtectedRoute.jsx** ✅
   - Protección de rutas por autenticación y rol
   - Redirige a login si no autenticado
   - Redirige a home si rol incorrecto

4. **Chatbot.jsx** ✅
   - Chatbot ético médico
   - Interfaz fija permanente
   - Derivación de especialidades

### Contextos
1. **AuthContext.jsx** ✅
   - `user`: Usuario actual
   - `isAuthenticated`: Boolean
   - `loading`: Boolean
   - `login(userData, token)`: Función login
   - `logout()`: Función logout

2. **ThemeContext.jsx** ✅
   - `isDarkMode`: Boolean
   - `toggleTheme()`: Función toggle

### Servicios
1. **api.js** ✅
   - Axios configurado con baseURL
   - Interceptor para agregar token en headers
   - Interceptor para manejar 401 (redirige a login)

---

## ⚠️ DASHBOARDS FALTANTES

### ❌ Dashboard Paciente
**NO EXISTE** - Debe crearse desde cero
- Rutas necesarias: `/dashboard/paciente` (no definida en App.jsx)
- Endpoints disponibles:
  - `GET /api/turnos` (devuelve turnos del paciente)
  - `POST /api/turnos` (crear turno)
  - `GET /api/turnos/disponibilidad/:medicoId` (horarios disponibles)
- Funcionalidades requeridas:
  - Ver turnos próximos
  - Historial de turnos pasados
  - Cancelar turnos futuros
  - Solicitar nuevos turnos
  - Ver perfil

### ⚠️ Dashboard Médico
**NO EXISTE** - Debe crearse desde cero
- Rutas necesarias: `/dashboard/medico` (no definida en App.jsx)
- Endpoints disponibles:
  - `GET /api/turnos` (devuelve turnos del médico)
- Funcionalidades requeridas:
  - Ver turnos de hoy
  - Ver turnos futuros
  - Confirmar turnos pendientes
  - Cancelar turnos
  - Agenda semanal

---

## ✅ DASHBOARD ADMIN (Existente - Mejorable)

### Lo que existe:
- Layout con sidebar
- ListadoMedicos con CRUD completo
- ListadoPacientes con CRUD completo

### Lo que falta/mal implementado:
- ❌ **NO HAY** sección de "Todos los Turnos"
- ❌ **NO HAY** estadísticas básicas
- ❌ **NO HAY** filtros por fecha, médico, estado en turnos
- ❌ **NO HAY** header con logout visible
- ❌ **NO HAY** visualización de especialidades más solicitadas

### Mejoras necesarias:
1. Agregar pestaña/sección "Turnos" en el AdminDashboard
2. Agregar estadísticas (turnos hoy, semana, médicos activos)
3. Agregar filtros para turnos
4. Mejorar header con logout
5. Agregar visualización de estadísticas por especialidad

---

## 🔍 OBSERVACIONES TÉCNICAS

### Endpoints Faltantes
- ❌ **NO HAY** endpoint para **cancelar turno** (`PUT /api/turnos/:id/cancelar` o similar)
- ❌ **NO HAY** endpoint para **confirmar turno** (`PUT /api/turnos/:id/confirmar` o similar)
- ⚠️ Necesario implementar en backend o usar PUT genérico con `estado: 'cancelado'`

### Problemas Identificados
1. **Home.jsx** tiene un link a `/dashboard/paciente` pero la ruta no existe en App.jsx
2. **No hay protección de rutas** para dashboards de paciente/médico
3. **AdminDashboard** usa `btn-primary` estándar en lugar de `btn-primary-custom`
4. **Falta coherencia** en estilos entre AdminDashboard y resto de la app

---

## 📝 PATRONES DE CÓDIGO IDENTIFICADOS

### Manejo de Estado
- `useState` para estados locales
- `useEffect` para cargar datos al montar
- Estados: `loading`, `error`, datos (array u objeto)

### Manejo de Errores
- Try/catch en funciones async
- `setError()` para mostrar mensajes
- Alertas con `alert alert-danger`

### Llamadas a API
- Patrón: `try { setLoading(true); const response = await api.get/put/post/delete(); setData(); } catch { setError(); } finally { setLoading(false); }`

### Componentes Modales
- Estado `showModal` para controlar visibilidad
- Props: `show`, `onHide`, `onSuccess`
- Callback `onSuccess` para refrescar datos

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### FASE 1: Endpoints Faltantes en Backend
- [ ] Crear endpoint para cancelar turno
- [ ] Crear endpoint para confirmar turno (médico)

### FASE 2: Dashboard Paciente (Nuevo)
- [ ] Crear componente `DashboardPaciente.jsx`
- [ ] Agregar ruta protegida en App.jsx
- [ ] Integrar con endpoints existentes
- [ ] Implementar cancelación de turnos

### FASE 3: Dashboard Médico (Nuevo)
- [ ] Crear componente `DashboardMedico.jsx`
- [ ] Agregar ruta protegida en App.jsx
- [ ] Implementar confirmación de turnos
- [ ] Agregar agenda semanal

### FASE 4: Mejorar Admin Dashboard
- [ ] Agregar sección "Turnos" con filtros
- [ ] Agregar estadísticas
- [ ] Mejorar header con logout
- [ ] Agregar visualización de especialidades

### FASE 5: Sistema de Logging
- [ ] Implementar logging en todos los dashboards
- [ ] Prefijos: [DashboardPaciente], [DashboardMedico], [DashboardAdmin]
- [ ] Niveles: INFO, WARN, ERROR

---

## ❓ PREGUNTAS PENDIENTES

1. **¿Existe endpoint para cancelar/confirmar turnos?** 
   - Si no, ¿debo crearlo en backend o usar PUT genérico?

2. **¿Qué rutas debo usar para los dashboards?**
   - `/dashboard/paciente` ✅ (mencionado en Home.jsx)
   - `/dashboard/medico` ✅ (lógico)
   - `/admin` ya existe ✅

3. **¿Debo mantener el estilo de AdminDashboard existente (btn-primary) o cambiarlo a btn-primary-custom?**

4. **¿Hay alguna funcionalidad específica que deba tener cada dashboard que no esté en los requisitos?**

---

**Próximo paso**: Esperar confirmación del usuario antes de proceder con la implementación.

