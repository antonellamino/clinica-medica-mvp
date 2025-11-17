  import { useState, useEffect } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';
  import api from '../services/api';

  // Sistema de logging
  const logAction = (level, action, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [DashboardPaciente] [${level}] ${action}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  };

  const DashboardPaciente = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      logAction('INFO', 'Componente montado', { userId: user?.id });
      cargarTurnos();
    }, []);

    const cargarTurnos = async () => {
      setLoading(true);
      setError('');

      try {
        logAction('INFO', 'Cargando turnos del paciente');
        const response = await api.get('/turnos');
        setTurnos(response.data);
        logAction('INFO', `Turnos cargados exitosamente: ${response.data.length} turnos`);
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Error al cargar los turnos';
        setError(errorMsg);
        logAction('ERROR', 'Error al cargar turnos', { error: errorMsg });
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
        
        // Recargar turnos
        await cargarTurnos();
        
        alert('Turno cancelado exitosamente');
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Error al cancelar el turno';
        setError(errorMsg);
        logAction('ERROR', 'Error al cancelar turno', { error: errorMsg });
        alert(errorMsg);
      }
    };

    const handleLogout = () => {
      logAction('INFO', 'Usuario cerró sesión');
      logout();
      navigate('/');
    };

    // Separar turnos en próximos y pasados
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const proximosTurnos = turnos.filter(turno => {
      const fechaTurno = new Date(turno.fecha);
      fechaTurno.setHours(0, 0, 0, 0);
      return fechaTurno >= hoy && turno.estado !== 'cancelado' && turno.estado !== 'completado';
    }).sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      if (fechaA.getTime() === fechaB.getTime()) {
        return a.hora.localeCompare(b.hora);
      }
      return fechaA - fechaB;
    });

    const historialTurnos = turnos.filter(turno => {
      const fechaTurno = new Date(turno.fecha);
      fechaTurno.setHours(0, 0, 0, 0);
      return fechaTurno < hoy || turno.estado === 'completado' || turno.estado === 'cancelado';
    }).sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      if (fechaA.getTime() === fechaB.getTime()) {
        return a.hora.localeCompare(b.hora);
      }
      return fechaB - fechaA; // Más recientes primero
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
        {/* Mi Perfil */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card card-custom">
              <div className="card-body p-4">
                <h3 className="mb-4" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                  <i className="bi bi-person me-2"></i>
                  Mi Perfil
                </h3>
                
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-2"><strong>Email:</strong> {user?.email || 'No disponible'}</p>
                    <p className="mb-2"><strong>Nombre:</strong> {user?.nombre || ''} {user?.apellido || ''}</p>
                    <p className="mb-2"><strong>Rol:</strong> {user?.role || 'No disponible'}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2"><strong>Fecha de Registro:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR') : 'No disponible'}</p>
                    {user?.telefono && <p className="mb-2"><strong>Teléfono:</strong> {user.telefono}</p>}
                    {user?.dni && <p className="mb-2"><strong>DNI:</strong> {user.dni}</p>}
                    {user?.obra_social && <p className="mb-2"><strong>Obra Social:</strong> {user.obra_social}</p>}
                    {user?.fecha_nacimiento && <p className="mb-2"><strong>Fecha de Nacimiento:</strong> {new Date(user.fecha_nacimiento).toLocaleDateString('es-AR')}</p>}
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary-custom mt-3"
                  onClick={() => {
                    logAction('INFO', 'Editar perfil - funcionalidad pendiente');
                    alert('Funcionalidad de edición de perfil próximamente disponible');
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
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
                    to="/sacarTurnoForm" 
                    className="btn btn-primary-custom"
                    onClick={() => logAction('INFO', 'Solicitar nuevo turno - redirigiendo')}
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
                            </div>
                            <span className={`badge ${getEstadoBadge(turno.estado)} text-white`}>
                              {getEstadoTexto(turno.estado)}
                            </span>
                          </div>

                          <div className="mb-3">
                            <div className="mb-2">
                              <strong style={{ color: '#1E1E1E', fontSize: '14px' }}>Médico:</strong>
                              <p className="mb-0" style={{ color: '#1E1E1E' }}>
                                {turno.medico?.user?.nombre} {turno.medico?.user?.apellido}
                              </p>
                              <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                {turno.medico?.especialidad?.nombre}
                              </p>
                            </div>

                            {turno.motivo && (
                              <div className="mb-2">
                                <strong style={{ color: '#1E1E1E', fontSize: '14px' }}>Motivo:</strong>
                                <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                  {turno.motivo}
                                </p>
                              </div>
                            )}
                          </div>

                          {turno.estado !== 'cancelado' && turno.estado !== 'completado' && (
                            <div className="d-grid">
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleCancelarTurno(turno.id)}
                              >
                                <i className="bi bi-x-circle me-2"></i>
                                Cancelar Turno
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
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
                            </div>
                            <span className={`badge ${getEstadoBadge(turno.estado)} text-white`}>
                              {getEstadoTexto(turno.estado)}
                            </span>
                          </div>

                          <div>
                            <div className="mb-2">
                              <strong style={{ color: '#1E1E1E', fontSize: '14px' }}>Médico:</strong>
                              <p className="mb-0" style={{ color: '#1E1E1E' }}>
                                {turno.medico?.user?.nombre} {turno.medico?.user?.apellido}
                              </p>
                              <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                {turno.medico?.especialidad?.nombre}
                              </p>
                            </div>

                            {turno.motivo && (
                              <div>
                                <strong style={{ color: '#1E1E1E', fontSize: '14px' }}>Motivo:</strong>
                                <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                  {turno.motivo}
                                </p>
                              </div>
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
      </main>
    );
  };

  export default DashboardPaciente;

