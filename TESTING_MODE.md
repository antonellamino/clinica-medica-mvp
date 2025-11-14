# 🧪 MODO DE TESTING - AUTENTICACIÓN DESACTIVADA

## ⚠️ IMPORTANTE: ESTO ES TEMPORAL SOLO PARA TESTING VISUAL

Este archivo documenta los cambios temporales realizados para probar los dashboards sin backend.

---

## 📋 Cambios Realizados

### 1. **AuthContext.jsx**
- ✅ Usuario hardcodeado con `role: "admin"` por defecto
- ✅ `isAuthenticated` siempre `true`
- ✅ `loading` siempre `false`
- ✅ `useEffect` de verificación de localStorage comentado
- ✅ `login()` y `logout()` no hacen cambios reales

### 2. **App.jsx**
- ✅ Rutas de dashboard directamente accesibles (sin protección)
- ✅ `ProtectedRoute` comentado temporalmente
- ✅ No hay redirecciones a login

### 3. **Dashboards**
- ✅ Usan datos mock existentes
- ✅ No tienen verificaciones que impidan renderizar
- ✅ Funcionalidad UI intacta

---

## 🚀 Cómo Usar el Modo de Testing

### Para Probar Dashboard de Paciente:
1. Abre `src/context/AuthContext.jsx`
2. Cambia el `role` a `"paciente"`:
   ```javascript
   role: "paciente", // CAMBIAR MANUALMENTE
   ```
3. Guarda el archivo
4. Recarga la página
5. Navega a: `http://localhost:3000/dashboard/paciente`

### Para Probar Dashboard de Médico:
1. Abre `src/context/AuthContext.jsx`
2. Cambia el `role` a `"medico"`:
   ```javascript
   role: "medico", // CAMBIAR MANUALMENTE
   especialidad: "Cardiología" // Mantener esto
   ```
3. Guarda el archivo
4. Recarga la página
5. Navega a: `http://localhost:3000/dashboard/medico`

### Para Probar Dashboard de Admin:
1. Abre `src/context/AuthContext.jsx`
2. Cambia el `role` a `"admin"`:
   ```javascript
   role: "admin", // CAMBIAR MANUALMENTE
   ```
3. Guarda el archivo
4. Recarga la página
5. Navega a: `http://localhost:3000/dashboard/admin`

---

## 🔗 URLs Directas (Sin Necesidad de Login)

Puedes acceder directamente a:
- `http://localhost:3000/dashboard/paciente`
- `http://localhost:3000/dashboard/medico`
- `http://localhost:3000/dashboard/admin`

**Nota:** Cambia el `role` en AuthContext para que cada dashboard muestre la información correcta según el rol.

---

## 📝 Datos Mock Disponibles

Todos los dashboards usan datos de `src/data/mockData.js`:

### Turnos Mock:
- ID 1: Hoy 10:00 - Dr. Juan Pérez (Cardiología) - Confirmado
- ID 2: Hoy 14:30 - Dra. Ana López (Pediatría) - Confirmado
- ID 3: Mañana 09:00 - Dr. Juan Pérez (Cardiología) - Pendiente
- ID 4: Pasado - Dra. Ana López (Pediatría) - Completado

### Médicos Mock:
- ID 1: Dr. Juan Pérez - Cardiología (Activo)
- ID 2: Dra. Ana López - Pediatría (Activo)
- ID 3: Dr. Roberto Martínez - Dermatología (Inactivo)

### Pacientes Mock:
- ID 1: María González
- ID 2: Carlos Martínez

---

## 🔄 Cómo Revertir los Cambios (Cuando el Backend Esté Listo)

### Paso 1: Restaurar AuthContext.jsx

Busca la sección marcada con:
```javascript
// ============================================================================
// TEMPORAL: Desactivar autenticación para testing
// ============================================================================
```

Y reemplázala con:
```javascript
const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [loading, setLoading] = useState(true);

useEffect(() => {
  // Verificar si hay un usuario guardado en localStorage
  const savedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (savedUser && token) {
    try {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  setLoading(false);
}, []);

const login = (userData, token) => {
  setUser(userData);
  setIsAuthenticated(true);
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', token);
};

const logout = () => {
  setUser(null);
  setIsAuthenticated(false);
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};
```

### Paso 2: Restaurar App.jsx

1. Descomenta el import:
   ```javascript
   import ProtectedRoute from './components/ProtectedRoute';
   ```

2. Reemplaza las rutas directas:
   ```javascript
   <Route path="/dashboard/paciente" element={<DashboardPaciente />} />
   <Route path="/dashboard/medico" element={<DashboardMedico />} />
   <Route path="/dashboard/admin" element={<DashboardAdmin />} />
   ```

   Por las rutas protegidas:
   ```javascript
   <Route 
     path="/dashboard/paciente" 
     element={
       <ProtectedRoute requiredRole="paciente">
         <DashboardPaciente />
       </ProtectedRoute>
     } 
   />
   <Route 
     path="/dashboard/medico" 
     element={
       <ProtectedRoute requiredRole="medico">
         <DashboardMedico />
       </ProtectedRoute>
     } 
   />
   <Route 
     path="/dashboard/admin" 
     element={
       <ProtectedRoute requiredRole="admin">
         <DashboardAdmin />
       </ProtectedRoute>
     } 
   />
   ```

### Paso 3: Verificar Dashboards

Los dashboards ya están preparados para usar API real. Solo necesitas:
1. Descomentar las llamadas a API en cada dashboard
2. Comentar o eliminar las secciones de datos mock
3. Configurar `VITE_API_URL` en variables de entorno

---

## ✅ Checklist de Testing

- [ ] Dashboard Paciente carga correctamente
- [ ] Dashboard Médico carga correctamente
- [ ] Dashboard Admin carga correctamente
- [ ] Todos los botones funcionan (sin efecto real, pero sin errores)
- [ ] Los datos mock se muestran correctamente
- [ ] No hay errores en la consola del navegador
- [ ] La UI es responsive y se ve bien

---

## 🐛 Problemas Comunes

### El dashboard muestra "Usuario Test" en lugar del nombre real
**Solución:** Esto es normal en modo testing. Cuando restaures la autenticación, se usará el usuario real del backend.

### El Navbar no muestra el enlace correcto
**Solución:** Verifica que el `role` en AuthContext coincida con el dashboard que quieres probar.

### Los botones de cancelar/confirmar no hacen nada
**Solución:** Esto es esperado. Solo actualizan el estado local con datos mock. Con el backend real, harán las llamadas a API.

---

**Fecha de activación del modo testing:** 2024-12-19  
**Fecha estimada para revertir:** Cuando el backend esté listo

