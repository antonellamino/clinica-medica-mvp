import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Perfil = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Esperar a que termine de cargar el estado de autenticación
  if (loading) {
    return (
      <main className="container my-5">
        <p>Cargando...</p>
      </main>
    );
  }

  // Si no está autenticado, redirigir
  if (!isAuthenticated) {
    return <Navigate to="/acceder" replace />;
  }

  return (
    <main className="container my-5">
      <h1>Mi Perfil</h1>
      <p>Email: {user?.email}</p>
      <p>Rol: {user?.role}</p>
      <p>Nombre: {user?.nombre} {user?.apellido}</p>
      <p>Esta es una ruta protegida. Solo puedes verla si estás autenticado.</p>
    </main>
  );
};

export default Perfil;