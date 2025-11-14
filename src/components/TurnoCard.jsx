import { logAction } from '../data/mockData';

const TurnoCard = ({ turno, onCancelar, showActions = true, userRole = null }) => {
  const formatearFecha = (fecha) => {
    const date = new Date(fecha + 'T12:00:00');
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

  const handleCancelar = () => {
    if (window.confirm('¿Estás seguro de que deseas cancelar este turno?')) {
      logAction(userRole || 'Dashboard', 'WARN', `Cancelando turno ${turno.id}`);
      if (onCancelar) {
        onCancelar(turno.id);
      }
    }
  };

  const esFuturo = new Date(turno.fecha + 'T' + turno.hora) > new Date();

  return (
    <div className="card card-custom mb-3">
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
          {userRole === 'paciente' && (
            <div className="mb-2">
              <strong style={{ color: '#1E1E1E', fontSize: '14px' }}>Médico:</strong>
              <p className="mb-0" style={{ color: '#1E1E1E' }}>
                {turno.medico.nombre} {turno.medico.apellido}
              </p>
              <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                {turno.medico.especialidad}
              </p>
            </div>
          )}

          {userRole === 'medico' && (
            <div className="mb-2">
              <strong style={{ color: '#1E1E1E', fontSize: '14px' }}>Paciente:</strong>
              <p className="mb-0" style={{ color: '#1E1E1E' }}>
                {turno.paciente.nombre} {turno.paciente.apellido}
              </p>
              <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                {turno.paciente.email}
              </p>
            </div>
          )}

          {turno.sintomas && (
            <div className="mb-2">
              <strong style={{ color: '#1E1E1E', fontSize: '14px' }}>Síntomas/Motivo:</strong>
              <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                {turno.sintomas}
              </p>
            </div>
          )}

          <div>
            <span className="badge bg-light text-dark me-2">
              <i className="bi bi-laptop me-1"></i>
              {turno.tipo === 'teleconsulta' ? 'Teleconsulta' : 'Presencial'}
            </span>
          </div>
        </div>

        {showActions && esFuturo && turno.estado !== 'cancelado' && turno.estado !== 'completado' && (
          <div className="d-grid">
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleCancelar}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar Turno
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TurnoCard;

