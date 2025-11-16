import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Sistema de logging
const logAction = (level, action, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [DashboardMedico] [${level}] ${action}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

const DashboardMedico = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [medico, setMedico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    logAction('INFO', 'Componente montado', { userId: user?.id });
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');

    try {
      logAction('INFO', 'Cargando turnos del médico');
      const [turnosResponse, medicosResponse] = await Promise.all([
        api.get('/turnos'),
        api.get('/medicos')
      ]);

      // Buscar el médico actual en la lista
      const medicoActual = medicosResponse.data.find(m => m.userId === user?.id);
      setMedico(medicoActual);
      
      setTurnos(turnosResponse.data);
      logAction('INFO', `Datos cargados exitosamente: ${turnosResponse.data.length} turnos`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al cargar los datos';
      setError(errorMsg);
      logAction('ERROR', 'Error al cargar datos', { error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarTurno = async (turnoId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este turno?')) {
      return;
    }

    setError('');

    try {
      logAction('WARN', `Cancelando turno ${turnoId}`);
      await api.put(`/turnos/${turnoId}/cancelar`);
      logAction('INFO', `Turno ${turnoId} cancelado exitosamente`);
      
      await cargarDatos();
      alert('Turno cancelado exitosamente');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al cancelar el turno';
      setError(errorMsg);
      logAction('ERROR', 'Error al cancelar turno', { error: errorMsg });
      alert(errorMsg);
    }
  };

  const handleConfirmarTurno = async (turnoId) => {
    setError('');

    try {
      logAction('INFO', `Confirmando turno ${turnoId}`);
      await api.put(`/turnos/${turnoId}/confirmar`);
      logAction('INFO', `Turno ${turnoId} confirmado exitosamente`);
      
      await cargarDatos();
      alert('Turno confirmado exitosamente');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al confirmar el turno';
      setError(errorMsg);
      logAction('ERROR', 'Error al confirmar turno', { error: errorMsg });
      alert(errorMsg);
    }
  };

  const handleLogout = () => {
    logAction('INFO', 'Usuario cerró sesión');
    logout();
    navigate('/');
  };

  // Obtener fecha de hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Separar turnos
  const turnosHoy = turnos.filter(turno => {
    const fechaTurno = new Date(turno.fecha);
    fechaTurno.setHours(0, 0, 0, 0);
    return fechaTurno.getTime() === hoy.getTime() && turno.estado !== 'cancelado';
  }).sort((a, b) => a.hora.localeCompare(b.hora));

  const turnosFuturos = turnos.filter(turno => {
    const fechaTurno = new Date(turno.fecha);
    fechaTurno.setHours(0, 0, 0, 0);
    return fechaTurno > hoy && turno.estado !== 'cancelado';
  }).sort((a, b) => {
    const fechaA = new Date(a.fecha);
    const fechaB = new Date(b.fecha);
    if (fechaA.getTime() === fechaB.getTime()) {
      return a.hora.localeCompare(b.hora);
    }
    return fechaA - fechaB;
  });

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'confirmado': 'bg-success',
      'pendiente': 'bg-warning',
      'completado': 'bg-info',
      'cancelado': 'bg-danger'
    };
    return badges[estado] || 'bg-secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'confirmado': 'Confirmado',
      'pendiente': 'Pendiente',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  };

  const nombreCompleto = user?.nombre && user?.apellido 
    ? `Dr. ${user.nombre} ${user.apellido}` 
    : user?.email || 'Médico';
  
  const especialidad = medico?.especialidad?.nombre || 'Especialidad no especificada';

  const fechaHoy = hoy.toLocaleDateString('es-AR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
                {fechaHoy}
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
                    <div key={turno.id} className="card card-custom mb-3">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="card-title mb-1" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                              <i className="bi bi-clock me-2"></i>
                              {turno.hora}
                            </h5>
                            <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                              Paciente: {turno.paciente?.nombre} {turno.paciente?.apellido}
                            </p>
                            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                              {turno.paciente?.email}
                            </p>
                          </div>
                          <span className={`badge ${getEstadoBadge(turno.estado)} text-white`}>
                            {getEstadoTexto(turno.estado)}
                          </span>
                        </div>

                        {turno.motivo && (
                          <div className="mb-3">
                            <strong style={{ color: '#1E1E1E', fontSize: '14px' }}>Motivo/Síntomas:</strong>
                            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                              {turno.motivo}
                            </p>
                          </div>
                        )}

                        <div className="d-flex gap-2">
                          {turno.estado === 'pendiente' && (
                            <button
                              className="btn btn-success-custom btn-sm"
                              onClick={() => handleConfirmarTurno(turno.id)}
                            >
                              <i className="bi bi-check-circle me-2"></i>
                              Confirmar Turno
                            </button>
                          )}
                          {turno.estado !== 'completado' && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleCancelarTurno(turno.id)}
                            >
                              <i className="bi bi-x-circle me-2"></i>
                              Cancelar Turno
                            </button>
                          )}
                        </div>
                      </div>
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
                          <div className="card card-custom">
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="mb-1" style={{ color: '#1E1E1E', fontWeight: '600', fontSize: '14px' }}>
                                    {formatearFecha(turno.fecha)}
                                  </h6>
                                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                                    <i className="bi bi-clock me-1"></i>
                                    {turno.hora}
                                  </p>
                                </div>
                                <span className={`badge ${getEstadoBadge(turno.estado)} text-white`} style={{ fontSize: '11px' }}>
                                  {getEstadoTexto(turno.estado)}
                                </span>
                              </div>

                              <p className="mb-2" style={{ color: '#1E1E1E', fontSize: '13px' }}>
                                <strong>Paciente:</strong> {turno.paciente?.nombre} {turno.paciente?.apellido}
                              </p>

                              {turno.motivo && (
                                <p className="text-muted mb-2" style={{ fontSize: '12px' }}>
                                  {turno.motivo.substring(0, 50)}{turno.motivo.length > 50 ? '...' : ''}
                                </p>
                              )}

                              <div className="d-flex gap-2">
                                {turno.estado === 'pendiente' && (
                                  <button
                                    className="btn btn-success-custom btn-sm"
                                    style={{ fontSize: '11px', padding: '4px 8px' }}
                                    onClick={() => handleConfirmarTurno(turno.id)}
                                  >
                                    <i className="bi bi-check-circle"></i>
                                  </button>
                                )}
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  style={{ fontSize: '11px', padding: '4px 8px' }}
                                  onClick={() => handleCancelarTurno(turno.id)}
                                >
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              </div>
                            </div>
                          </div>
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
                        <div key={turno.id} className="card card-custom mb-3">
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h5 className="card-title mb-1" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                                  {formatearFecha(turno.fecha)}
                                </h5>
                                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                  <i className="bi bi-clock me-2"></i>
                                  {turno.hora}
                                </p>
                                <p className="mb-0" style={{ color: '#1E1E1E' }}>
                                  Paciente: {turno.paciente?.nombre} {turno.paciente?.apellido}
                                </p>
                                <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                  {turno.paciente?.email}
                                </p>
                              </div>
                              <span className={`badge ${getEstadoBadge(turno.estado)} text-white`}>
                                {getEstadoTexto(turno.estado)}
                              </span>
                            </div>

                            {turno.motivo && (
                              <div className="mb-3">
                                <strong style={{ color: '#1E1E1E', fontSize: '14px' }}>Motivo/Síntomas:</strong>
                                <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                  {turno.motivo}
                                </p>
                              </div>
                            )}

                            <div className="d-flex gap-2">
                              {turno.estado === 'pendiente' && (
                                <button
                                  className="btn btn-success-custom btn-sm"
                                  onClick={() => handleConfirmarTurno(turno.id)}
                                >
                                  <i className="bi bi-check-circle me-2"></i>
                                  Confirmar Turno
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleCancelarTurno(turno.id)}
                              >
                                <i className="bi bi-x-circle me-2"></i>
                                Cancelar Turno
                              </button>
                            </div>
                          </div>
                        </div>
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

