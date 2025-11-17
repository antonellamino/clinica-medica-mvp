import { useState, useEffect } from 'react';
import api from '../../services/api';

const PasoDosFechaHora = ({ medico, onSubmit, loading }) => {
  const [horarios, setHorarios] = useState([]);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [error, setError] = useState('');

  // Calcular fecha mínima (hoy)
  const getMinFecha = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calcular fecha máxima (30 días desde hoy)
  const getMaxFecha = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 30);
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Cargar horarios disponibles cuando cambia la fecha
  useEffect(() => {
    if (fecha) {
      cargarHorarios();
    } else {
      setHorarios([]);
      setHora('');
    }
  }, [fecha]);

  const cargarHorarios = async () => {
    try {
      setCargandoHorarios(true);
      setError('');
      setHora(''); // Limpiar hora seleccionada

      const response = await api.get(`/turnos/disponibilidad/${medico.id}?fecha=${fecha}`);
      setHorarios(response.data.horarios);

      if (response.data.horarios.length === 0) {
        setError(response.data.mensaje || 'No hay horarios disponibles para esta fecha');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al cargar horarios disponibles';
      setError(errorMsg);
      console.error(errorMsg, err);
      setHorarios([]);
    } finally {
      setCargandoHorarios(false);
    }
  };

  const handleContinuar = () => {
    if (!fecha || !hora) {
      setError('Debes seleccionar una fecha y hora para continuar');
      return;
    }
    onSubmit(fecha, hora, motivo);
  };

  // Validar que la fecha sea un día en el que el médico atienda
  const isValidDayForMedico = (dateString) => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dayName = dias[date.getDay()];
    const medicoDays = medico.diasSemana || [];
    
    return medicoDays.includes(dayName);
  };

  const formatearFecha = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <h3 className="mb-4" style={{ color: '#1E1E1E', fontWeight: '600' }}>
        <i className="bi bi-calendar2-week me-2"></i>
        Selecciona Fecha y Hora
      </h3>

      {/* Información del médico */}
      <div className="alert alert-info rounded-custom mb-4" role="alert">
        <div className="d-flex align-items-center">
          <i className="bi bi-info-circle me-2"></i>
          <div>
            <strong>Médico seleccionado:</strong> Dr(a). {medico.nombre} {medico.apellido}
            <br />
            <small className="text-muted">
              Atiende: {medico.diasSemana.join(', ')} | {medico.horarioInicio} - {medico.horarioFin}
            </small>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-custom mb-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Selector de Fecha */}
      <div className="mb-4">
        <label htmlFor="fechaInput" className="form-label fw-500" style={{ fontWeight: '500' }}>
          <i className="bi bi-calendar-event me-2"></i>
          Selecciona una Fecha
        </label>
        <input
          id="fechaInput"
          type="date"
          className="form-control form-control-custom"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          min={getMinFecha()}
          max={getMaxFecha()}
          disabled={loading}
        />
        {fecha && !isValidDayForMedico(fecha) && (
          <small className="text-danger d-block mt-2">
            <i className="bi bi-exclamation-triangle me-1"></i>
            El médico no atiende este día de la semana
          </small>
        )}
        {fecha && isValidDayForMedico(fecha) && (
          <small className="text-success d-block mt-2">
            <i className="bi bi-check-circle me-1"></i>
            {formatearFecha(fecha)}
          </small>
        )}
      </div>

      {/* Selector de Hora */}
      {fecha && isValidDayForMedico(fecha) && (
        <div className="mb-4">
          <label className="form-label fw-500" style={{ fontWeight: '500' }}>
            <i className="bi bi-clock me-2"></i>
            Selecciona una Hora
          </label>

          {cargandoHorarios ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <span className="text-muted">Cargando horarios disponibles...</span>
            </div>
          ) : horarios.length === 0 ? (
            <div className="alert alert-warning rounded-custom" role="alert">
              <i className="bi bi-exclamation-circle me-2"></i>
              No hay horarios disponibles para esta fecha
            </div>
          ) : (
            <div className="row g-2">
              {horarios.map(horario => (
                <div key={horario} className="col-6 col-sm-4">
                  <button
                    type="button"
                    className={`btn w-100 ${
                      hora === horario
                        ? 'btn-primary'
                        : 'btn-outline-primary'
                    }`}
                    onClick={() => setHora(horario)}
                    disabled={loading}
                    style={{
                      borderRadius: '8px',
                      fontWeight: '500',
                      padding: '10px'
                    }}
                  >
                    {horario}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Campo de Motivo (opcional) */}
      {fecha && hora && (
        <div className="mb-4">
          <label htmlFor="motivoInput" className="form-label fw-500" style={{ fontWeight: '500' }}>
            <i className="bi bi-chat-left-dots me-2"></i>
            Motivo de la Consulta <span className="text-muted">(opcional)</span>
          </label>
          <textarea
            id="motivoInput"
            className="form-control form-control-custom"
            rows="3"
            placeholder="Describe brevemente el motivo de tu consulta..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            disabled={loading}
            maxLength="500"
          />
          <small className="text-muted d-block mt-1">
            {motivo.length}/500 caracteres
          </small>
        </div>
      )}

      {/* Resumen antes de continuar */}
      {fecha && hora && (
        <div className="alert alert-success rounded-custom mb-4" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          <strong>Resumen:</strong> {formatearFecha(fecha)} a las {hora}
        </div>
      )}

      {/* Botón Continuar */}
      <div className="d-grid">
        <button
          className="btn btn-primary-custom"
          onClick={handleContinuar}
          disabled={!fecha || !hora || loading || cargandoHorarios || !isValidDayForMedico(fecha)}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Cargando...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-right me-2"></i>
              Continuar al Paso 3
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PasoDosFechaHora;
