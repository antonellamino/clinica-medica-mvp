import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // ============================================================================
  // TEMPORAL: Desactivar autenticación para testing
  // INSTRUCCIONES: Cambiar manualmente el "role" para probar distintos dashboards
  // Valores posibles: "paciente", "medico", "admin"
  // ============================================================================
  
  // Usuario hardcodeado para testing - cambiar role manualmente para probar distintos dashboards
  const [user, setUser] = useState({
    id: 1,
    email: "test@clinica.com",
    nombre: "Usuario",
    apellido: "Test", 
    role: "admin", // CAMBIAR MANUALMENTE: "paciente", "medico", "admin"
    especialidad: "Cardiología" // solo para medico
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Siempre autenticado
  const [loading, setLoading] = useState(false); // Sin loading

  // COMENTAR TEMPORALMENTE TODO EL USEEFFECT:
  /*
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
  */

  // Mantener estas funciones pero que no hagan nada crítico
  const login = (userData, token) => {
    console.log("Login simulador:", userData);
    setUser(userData);
    setIsAuthenticated(true);
    // No guardar en localStorage temporalmente
  };

  // Helper para obtener el rol del usuario
  const getUserRole = () => {
    return user?.role || null;
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user?.role === role;
  };

  const logout = () => {
    console.log("Logout simulador - manteniendo usuario hardcodeado");
    // No hacer nada, mantener usuario hardcodeado para testing
    // setUser(null);
    // setIsAuthenticated(false);
    // localStorage.removeItem('user');
    // localStorage.removeItem('token');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    getUserRole,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

