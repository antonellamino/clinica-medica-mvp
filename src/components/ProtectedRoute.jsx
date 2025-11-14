import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="container my-5 flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/acceder" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirigir al dashboard correspondiente según el rol del usuario
    if (user?.role === 'paciente') {
      return <Navigate to="/dashboard/paciente" replace />;
    } else if (user?.role === 'medico') {
      return <Navigate to="/dashboard/medico" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    }
    // Si no tiene rol válido, redirigir a home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

