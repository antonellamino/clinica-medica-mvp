import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Si estamos en /admin exacto, redirigir a /admin/medicos
  if (location.pathname === '/admin') {
    return <Navigate to="/admin/medicos" replace />;
  }

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Sidebar */}
      <div className="bg-light border-end" style={{ width: '100%', maxWidth: '250px', minHeight: '100%' }}>
        <div className="p-3">
          <h5 className="mb-4">
            <i className="bi bi-speedometer2 me-2"></i>
            Panel Admin
          </h5>
          <p className="text-muted small mb-3">
            Bienvenido, <strong>{user?.nombre}</strong>
          </p>
          <nav className="nav flex-column">
            <NavLink
              to="/admin/medicos"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active bg-primary text-white rounded' : 'text-dark'}`
              }
            >
              <i className="bi bi-person-badge me-2"></i>
              Médicos
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
