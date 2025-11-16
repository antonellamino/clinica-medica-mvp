import { useState, useEffect } from 'react';
import api from '../../services/api';

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

const ListadoTurnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    logAction('INFO', 'Componente montado');
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      logAction('INFO', 'Cargando turnos y médicos');
      const [turnosResponse, medicosResponse] = await Promise.all([
        api.get('/turnos'),
        api.get('/medicos')
      ]);
      setTurnos(turnosResponse.data);
      setMedicos(medicosResponse.data);
      logAction('INFO', `Datos cargados: ${turnosResponse.data.length} turnos, ${medicosResponse.data.length} médicos`);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al cargar los datos';
      setError(errorMsg);
      logAction('ERROR', 'Error al cargar datos', { error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const turnosFiltrados = turnos.filter(turno => {
    if (filtroFecha) {
      const fechaTurno = new Date(turno.fecha).toISOString().split('T')[0];
      if (fechaTurno !== filtroFecha) return false;
    }
    if (filtroMedico && turno.medico?.id !== parseInt(filtroMedico)) return false;
    if (filtroEstado && turno.estado !== filtroEstado) return false;
    return true;
  });

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR');
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-calendar-event me-2"></i>
          Todos los Turnos
        </h2>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="card card-custom mb-4">
        <div className="card-body p-4">
          <h5 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
            Filtros
          </h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label" style={{ fontWeight: '500' }}>
                Filtrar por Fecha
              </label>
              <input
                type="date"
                className="form-control form-control-custom"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label" style={{ fontWeight: '500' }}>
                Filtrar por Médico
              </label>
              <select
                className="form-select form-control-custom"
                value={filtroMedico}
                onChange={(e) => setFiltroMedico(e.target.value)}
              >
                <option value="">Todos los médicos</option>
                {medicos.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} {m.apellido} - {m.especialidad.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label" style={{ fontWeight: '500' }}>
                Filtrar por Estado
              </label>
              <select
                className="form-select form-control-custom"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="confirmado">Confirmado</option>
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          {(filtroFecha || filtroMedico || filtroEstado) && (
            <div className="mt-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setFiltroFecha('');
                  setFiltroMedico('');
                  setFiltroEstado('');
                }}
              >
                <i className="bi bi-x-circle me-1"></i>
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Email</th>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Motivo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {turnosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No hay turnos con los filtros aplicados
                  </td>
                </tr>
              ) : (
                turnosFiltrados.map(turno => (
                  <tr key={turno.id}>
                    <td className="align-middle">{formatearFecha(turno.fecha)}</td>
                    <td className="align-middle">{turno.hora}</td>
                    <td className="align-middle">
                      {turno.paciente?.nombre} {turno.paciente?.apellido}
                    </td>
                    <td className="align-middle">
                      <small>{turno.paciente?.email}</small>
                    </td>
                    <td className="align-middle">
                      {turno.medico?.user?.nombre} {turno.medico?.user?.apellido}
                    </td>
                    <td className="align-middle">
                      {turno.medico?.especialidad?.nombre}
                    </td>
                    <td className="align-middle">
                      <small>{turno.motivo || '-'}</small>
                    </td>
                    <td className="align-middle">
                      <span className={`badge ${getEstadoBadge(turno.estado)} text-white`}>
                        {getEstadoTexto(turno.estado)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListadoTurnos;

