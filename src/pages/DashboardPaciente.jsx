import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TurnoCard from '../components/TurnoCard';
import { logAction, getTurnosByPaciente, getTurnosFuturos, getTurnosPasados } from '../data/mockData';
import api from '../services/api';

const DashboardPaciente = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [proximosTurnos, setProximosTurnos] = useState([]);
  const [historialTurnos, setHistorialTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    logAction('DashboardPaciente', 'INFO', 'Componente montado', { userId: user?.id });
    cargarTurnos();
  }, []);

  const cargarTurnos = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulación: cuando el backend esté listo, usar:
      // const response = await api.get('/turnos/mis-turnos');
      // const turnos = response.data;

      // Por ahora usamos datos mock
      const pacienteId = user?.id || 1; // Simulamos ID del paciente
      const todosTurnos = getTurnosByPaciente(pacienteId);
      const futuros = getTurnosFuturos().filter(t => 
        todosTurnos.some(turno => turno.id === t.id)
      );
      const pasados = getTurnosPasados().filter(t => 
        todosTurnos.some(turno => turno.id === t.id)
      );

      setProximosTurnos(futuros);
      setHistorialTurnos(pasados);

      logAction('DashboardPaciente', 'INFO', `Turnos cargados: ${futuros.length} próximos, ${pasados.length} pasados`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al cargar los turnos';
      setError(errorMsg);
      logAction('DashboardPaciente', 'ERROR', 'Error al cargar turnos', { error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarTurno = async (turnoId) => {
    setError('');

    try {
      logAction('DashboardPaciente', 'WARN', `Cancelando turno ${turnoId}`);
      
      // Simulación: cuando el backend esté listo, usar:
      // await api.delete(`/turnos/${turnoId}`);
      
      // Actualizar estado local
      setProximosTurnos(prev => prev.filter(t => t.id !== turnoId));
      
      logAction('DashboardPaciente', 'INFO', `Turno ${turnoId} cancelado exitosamente`);
      
      // Mostrar mensaje de éxito
      alert('Turno cancelado exitosamente');
      
      // Recargar turnos
      cargarTurnos();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al cancelar el turno';
      setError(errorMsg);
      logAction('DashboardPaciente', 'ERROR', 'Error al cancelar turno', { error: errorMsg });
    }
  };

  const handleLogout = () => {
    logAction('DashboardPaciente', 'INFO', 'Usuario cerró sesión');
    logout();
    navigate('/');
  };

  const nombreCompleto = user?.nombre && user?.apellido 
    ? `${user.nombre} ${user.apellido}` 
    : user?.email || 'Paciente';

  if (loading) {
    return (
      <main className="container my-5 flex-grow-1">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container my-5 flex-grow-1">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                    Bienvenido, {nombreCompleto}
                  </h2>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                    Dashboard de Paciente
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

      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger rounded-custom" role="alert">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Mis Próximos Turnos */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                  <i className="bi bi-calendar-check me-2"></i>
                  Mis Próximos Turnos
                </h3>
                <Link 
                  to="/" 
                  className="btn btn-primary-custom"
                  onClick={() => logAction('DashboardPaciente', 'INFO', 'Solicitar nuevo turno - redirigiendo')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Solicitar Nuevo Turno
                </Link>
              </div>

              {proximosTurnos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <p className="text-muted mt-3 mb-0">
                    No tienes turnos próximos. Solicita uno nuevo para comenzar.
                  </p>
                </div>
              ) : (
                <div>
                  {proximosTurnos.map(turno => (
                    <TurnoCard
                      key={turno.id}
                      turno={turno}
                      onCancelar={handleCancelarTurno}
                      userRole="paciente"
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Turnos */}
      <div className="row">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body p-4">
              <h3 className="mb-4" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                <i className="bi bi-clock-history me-2"></i>
                Historial de Turnos
              </h3>

              {historialTurnos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <p className="text-muted mt-3 mb-0">
                    No tienes turnos anteriores.
                  </p>
                </div>
              ) : (
                <div>
                  {historialTurnos.map(turno => (
                    <TurnoCard
                      key={turno.id}
                      turno={turno}
                      userRole="paciente"
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPaciente;

