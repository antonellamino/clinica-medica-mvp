import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TurnoCard from '../components/TurnoCard';
import { logAction, getTurnosByMedico, getTurnosToday, getTurnosFuturos } from '../data/mockData';
import api from '../services/api';

const DashboardMedico = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [turnosFuturos, setTurnosFuturos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    logAction('DashboardMedico', 'INFO', 'Componente montado', { userId: user?.id });
    cargarTurnos();
  }, []);

  const cargarTurnos = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulación: cuando el backend esté listo, usar:
      // const response = await api.get('/turnos/mis-turnos-hoy');
      // const turnosHoy = response.data;
      // const responseFuturos = await api.get('/turnos/mis-turnos-futuros');
      // const turnosFuturos = responseFuturos.data;

      // Por ahora usamos datos mock
      const medicoId = user?.id || 1; // Simulamos ID del médico
      const todosTurnos = getTurnosByMedico(medicoId);
      const hoy = getTurnosToday().filter(t => 
        todosTurnos.some(turno => turno.id === t.id)
      );
      const futuros = getTurnosFuturos().filter(t => 
        todosTurnos.some(turno => turno.id === t.id) && 
        !hoy.some(turno => turno.id === t.id)
      );

      setTurnosHoy(hoy);
      setTurnosFuturos(futuros);

      logAction('DashboardMedico', 'INFO', `Turnos cargados: ${hoy.length} hoy, ${futuros.length} futuros`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al cargar los turnos';
      setError(errorMsg);
      logAction('DashboardMedico', 'ERROR', 'Error al cargar turnos', { error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarTurno = async (turnoId) => {
    setError('');

    try {
      logAction('DashboardMedico', 'WARN', `Cancelando turno ${turnoId}`);
      
      // Simulación: cuando el backend esté listo, usar:
      // await api.delete(`/turnos/${turnoId}`);
      
      // Actualizar estado local
      setTurnosHoy(prev => prev.filter(t => t.id !== turnoId));
      setTurnosFuturos(prev => prev.filter(t => t.id !== turnoId));
      
      logAction('DashboardMedico', 'INFO', `Turno ${turnoId} cancelado exitosamente`);
      
      alert('Turno cancelado exitosamente');
      cargarTurnos();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al cancelar el turno';
      setError(errorMsg);
      logAction('DashboardMedico', 'ERROR', 'Error al cancelar turno', { error: errorMsg });
    }
  };

  const handleConfirmarTurno = async (turnoId) => {
    setError('');

    try {
      logAction('DashboardMedico', 'INFO', `Confirmando turno ${turnoId}`);
      
      // Simulación: cuando el backend esté listo, usar:
      // await api.put(`/turnos/${turnoId}/confirmar`);
      
      logAction('DashboardMedico', 'INFO', `Turno ${turnoId} confirmado exitosamente`);
      
      alert('Turno confirmado exitosamente');
      cargarTurnos();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al confirmar el turno';
      setError(errorMsg);
      logAction('DashboardMedico', 'ERROR', 'Error al confirmar turno', { error: errorMsg });
    }
  };

  const handleLogout = () => {
    logAction('DashboardMedico', 'INFO', 'Usuario cerró sesión');
    logout();
    navigate('/');
  };

  const nombreCompleto = user?.nombre && user?.apellido 
    ? `Dr. ${user.nombre} ${user.apellido}` 
    : user?.email || 'Médico';
  
  const especialidad = user?.especialidad || 'Especialidad no especificada';

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

  // Obtener fecha de hoy formateada
  const hoy = new Date().toLocaleDateString('es-AR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
                    {nombreCompleto}
                  </h2>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                    {especialidad}
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

      {/* Turnos de Hoy */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body p-4">
              <h3 className="mb-4" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                <i className="bi bi-calendar-day me-2"></i>
                Turnos de Hoy
                <span className="badge bg-primary ms-2">{turnosHoy.length}</span>
              </h3>
              <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
                {hoy}
              </p>

              {turnosHoy.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <p className="text-muted mt-3 mb-0">
                    No tienes turnos programados para hoy.
                  </p>
                </div>
              ) : (
                <div>
                  {turnosHoy.map(turno => (
                    <div key={turno.id} className="mb-3">
                      <TurnoCard
                        turno={turno}
                        onCancelar={handleCancelarTurno}
                        userRole="medico"
                        showActions={true}
                      />
                      {turno.estado === 'pendiente' && (
                        <div className="mt-2">
                          <button
                            className="btn btn-success-custom btn-sm"
                            onClick={() => handleConfirmarTurno(turno.id)}
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            Confirmar Turno
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Turnos Futuros */}
      <div className="row">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body p-4">
              <h3 className="mb-4" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                <i className="bi bi-calendar-week me-2"></i>
                Turnos Futuros
              </h3>

              {turnosFuturos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <p className="text-muted mt-3 mb-0">
                    No tienes turnos futuros programados.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Visualización de agenda semanal simple */}
                  <div className="mb-4">
                    <h5 className="mb-3" style={{ color: '#1E1E1E', fontSize: '16px', fontWeight: '600' }}>
                      Vista Semanal
                    </h5>
                    <div className="row">
                      {turnosFuturos.slice(0, 7).map(turno => (
                        <div key={turno.id} className="col-md-6 col-lg-4 mb-3">
                          <TurnoCard
                            turno={turno}
                            onCancelar={handleCancelarTurno}
                            userRole="medico"
                            showActions={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resto de turnos futuros */}
                  {turnosFuturos.length > 7 && (
                    <div>
                      <h5 className="mb-3" style={{ color: '#1E1E1E', fontSize: '16px', fontWeight: '600' }}>
                        Próximas Semanas
                      </h5>
                      {turnosFuturos.slice(7).map(turno => (
                        <TurnoCard
                          key={turno.id}
                          turno={turno}
                          onCancelar={handleCancelarTurno}
                          userRole="medico"
                          showActions={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardMedico;

