import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <main className="container my-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </main>
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
      return <Navigate to="/admin/medicos" replace />;
    }
    // Si no tiene rol válido, redirigir a home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

