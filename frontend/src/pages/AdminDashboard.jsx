import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

// Sistema de logging
const logAction = (level, action, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [DashboardAdmin] [${level}] ${action}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [estadisticas, setEstadisticas] = useState({
    turnosHoy: 0,
    turnosSemana: 0,
    medicosActivos: 0,
    especialidadesPopulares: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Si estamos en /admin exacto, redirigir a /admin/medicos por defecto
  if (location.pathname === '/admin') {
    return <Navigate to="/admin/medicos" replace />;
  }

  useEffect(() => {
    logAction('INFO', 'Componente montado');
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoadingStats(true);
      logAction('INFO', 'Cargando estadísticas');
      const [turnosResponse, medicosResponse] = await Promise.all([
        api.get('/turnos'),
        api.get('/medicos')
      ]);

      const turnos = turnosResponse.data;
      const medicos = medicosResponse.data;

      // Turnos de hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const turnosHoy = turnos.filter(t => {
        const fechaTurno = new Date(t.fecha);
        fechaTurno.setHours(0, 0, 0, 0);
        return fechaTurno.getTime() === hoy.getTime();
      }).length;

      // Turnos de esta semana
      const semana = new Date();
      semana.setDate(semana.getDate() + 7);
      const turnosSemana = turnos.filter(t => {
        const fechaTurno = new Date(t.fecha);
        return fechaTurno >= hoy && fechaTurno <= semana;
      }).length;

      // Médicos activos (todos los médicos por ahora)
      const medicosActivos = medicos.length;

      // Especialidades más solicitadas
      const especialidadesCount = {};
      turnos.forEach(t => {
        const esp = t.medico?.especialidad?.nombre;
        if (esp) {
          especialidadesCount[esp] = (especialidadesCount[esp] || 0) + 1;
        }
      });
      const especialidadesPopulares = Object.entries(especialidadesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nombre, count]) => ({ nombre, count }));

      setEstadisticas({
        turnosHoy,
        turnosSemana,
        medicosActivos,
        especialidadesPopulares
      });

      logAction('INFO', 'Estadísticas cargadas exitosamente');
    } catch (err) {
      logAction('ERROR', 'Error al cargar estadísticas', { error: err.response?.data?.error });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    logAction('INFO', 'Usuario cerró sesión');
    logout();
    navigate('/');
  };

  return (
    <main className="container-fluid my-5 flex-grow-1">
      {/* Header con Logout */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                    Panel de Administración
                  </h2>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                    Bienvenido, <strong>{user?.nombre}</strong>
                  </p>
                </div>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {!loadingStats && (
        <>
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card card-custom">
                <div className="card-body p-4 text-center">
                  <h3 className="mb-2" style={{ color: '#1E6FFB', fontWeight: '600' }}>
                    {estadisticas.turnosHoy}
                  </h3>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                    Turnos Hoy
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card card-custom">
                <div className="card-body p-4 text-center">
                  <h3 className="mb-2" style={{ color: '#2ECC71', fontWeight: '600' }}>
                    {estadisticas.turnosSemana}
                  </h3>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                    Turnos Esta Semana
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card card-custom">
                <div className="card-body p-4 text-center">
                  <h3 className="mb-2" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                    {estadisticas.medicosActivos}
                  </h3>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                    Médicos Activos
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card card-custom">
                <div className="card-body p-4 text-center">
                  <h3 className="mb-2" style={{ color: '#1E6FFB', fontWeight: '600' }}>
                    {estadisticas.especialidadesPopulares.length}
                  </h3>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                    Especialidades
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Especialidades Populares */}
          {estadisticas.especialidadesPopulares.length > 0 && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card card-custom">
                  <div className="card-body p-4">
                    <h4 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                      Especialidades Más Solicitadas
                    </h4>
                    <div className="d-flex flex-wrap gap-2">
                      {estadisticas.especialidadesPopulares.map((esp, index) => (
                        <span key={index} className="badge bg-primary" style={{ fontSize: '14px', padding: '8px 12px' }}>
                          {esp.nombre}: {esp.count} turnos
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 mb-4">
          <div className="card card-custom">
            <div className="card-body p-3">
              <h5 className="mb-4" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                <i className="bi bi-speedometer2 me-2"></i>
                Panel Admin
              </h5>
              <nav className="nav flex-column">
                <NavLink
                  to="/admin/medicos"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active bg-primary text-white rounded' : 'text-dark'}`
                  }
                  style={{ marginBottom: '8px' }}
                >
                  <i className="bi bi-person-badge me-2"></i>
                  Médicos
                </NavLink>
                <NavLink
                  to="/admin/pacientes"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active bg-primary text-white rounded' : 'text-dark'}`
                  }
                  style={{ marginBottom: '8px' }}
                >
                  <i className="bi bi-people me-2"></i>
                  Pacientes
                </NavLink>
                <NavLink
                  to="/admin/turnos"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active bg-primary text-white rounded' : 'text-dark'}`
                  }
                  style={{ marginBottom: '8px' }}
                >
                  <i className="bi bi-calendar-event me-2"></i>
                  Turnos
                </NavLink>
              </nav>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="col-md-9">
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
