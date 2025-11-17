import { useState, useEffect } from 'react';
import api from '../../services/api';

const PasoUnoMedico = ({ onSubmit, loading }) => {
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [cargandoEspecialidades, setCargandoEspecialidades] = useState(true);
  const [cargandoMedicos, setCargandoMedicos] = useState(false);
  const [error, setError] = useState('');

  // Cargar especialidades al montar
  useEffect(() => {
    cargarEspecialidades();
  }, []);

  // Cargar médicos cuando cambia la especialidad
  useEffect(() => {
    if (especialidadSeleccionada) {
      cargarMedicos(especialidadSeleccionada);
    } else {
      setMedicos([]);
      setMedicoSeleccionado(null);
    }
  }, [especialidadSeleccionada]);

  const cargarEspecialidades = async () => {
    try {
      setCargandoEspecialidades(true);
      setError('');
      const response = await api.get('/especialidades');
      setEspecialidades(response.data);
    } catch (err) {
      const errorMsg = 'Error al cargar especialidades';
      setError(errorMsg);
      console.error(errorMsg, err);
    } finally {
      setCargandoEspecialidades(false);
    }
  };

  const cargarMedicos = async (especialidadId) => {
    try {
      setCargandoMedicos(true);
      setError('');
      const response = await api.get(`/medicos?especialidad_id=${especialidadId}`);
      setMedicos(response.data);
      setMedicoSeleccionado(null);
    } catch (err) {
      const errorMsg = 'Error al cargar médicos';
      setError(errorMsg);
      console.error(errorMsg, err);
    } finally {
      setCargandoMedicos(false);
    }
  };

  const handleContinuar = () => {
    if (!medicoSeleccionado) {
      setError('Debes seleccionar un médico para continuar');
      return;
    }
    onSubmit(medicoSeleccionado);
  };

  return (
    <div>
      <h3 className="mb-4" style={{ color: '#1E1E1E', fontWeight: '600' }}>
        <i className="bi bi-person-badge me-2"></i>
        Selecciona un Médico
      </h3>

      {error && (
        <div className="alert alert-danger rounded-custom mb-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Selector de Especialidad */}
      <div className="mb-4">
        <label htmlFor="especialidadSelect" className="form-label fw-500" style={{ fontWeight: '500' }}>
          <i className="bi bi-stethoscope me-2"></i>
          Selecciona una Especialidad
        </label>
        <select
          id="especialidadSelect"
          className="form-control form-control-custom"
          value={especialidadSeleccionada}
          onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
          disabled={cargandoEspecialidades || loading}
        >
          <option value="">-- Selecciona una especialidad --</option>
          {especialidades.map(esp => (
            <option key={esp.id} value={esp.id}>
              {esp.nombre}
            </option>
          ))}
        </select>
        {cargandoEspecialidades && (
          <small className="text-muted d-block mt-2">
            <i className="bi bi-hourglass-split me-1"></i>
            Cargando especialidades...
          </small>
        )}
      </div>

      {/* Selector de Médico */}
      {especialidadSeleccionada && (
        <div className="mb-4">
          <label className="form-label fw-500" style={{ fontWeight: '500' }}>
            <i className="bi bi-person-check me-2"></i>
            Selecciona un Médico
          </label>

          {cargandoMedicos ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <span className="text-muted">Cargando médicos...</span>
            </div>
          ) : medicos.length === 0 ? (
            <div className="alert alert-info rounded-custom" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              No hay médicos disponibles en esta especialidad
            </div>
          ) : (
            <div className="row g-3">
              {medicos.map(medico => (
                <div key={medico.id} className="col-12">
                  <div
                    className={`card card-custom cursor-pointer transition-all ${
                      medicoSeleccionado?.id === medico.id
                        ? 'border-primary border-2'
                        : ''
                    }`}
                    onClick={() => setMedicoSeleccionado(medico)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: medicoSeleccionado?.id === medico.id ? '#f0f7ff' : '',
                      borderWidth: medicoSeleccionado?.id === medico.id ? '2px' : '1px',
                      borderColor: medicoSeleccionado?.id === medico.id ? '#1E6FFB' : 'transparent'
                    }}
                  >
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                            <i className="bi bi-person-fill me-2"></i>
                            Dr(a). {medico.nombre} {medico.apellido}
                          </h5>
                          <p className="text-muted mb-2" style={{ fontSize: '13px' }}>
                            <i className="bi bi-stethoscope me-1"></i>
                            {medico.especialidad.nombre}
                          </p>
                          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                            <i className="bi bi-calendar-event me-1"></i>
                            Atiende: {medico.diasSemana.join(', ')}
                          </p>
                          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                            <i className="bi bi-clock me-1"></i>
                            {medico.horarioInicio} - {medico.horarioFin}
                          </p>
                        </div>
                        {medicoSeleccionado?.id === medico.id && (
                          <div className="badge bg-primary">
                            <i className="bi bi-check-circle me-1"></i>
                            Seleccionado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botón Continuar */}
      <div className="d-grid">
        <button
          className="btn btn-primary-custom"
          onClick={handleContinuar}
          disabled={!medicoSeleccionado || loading || cargandoMedicos}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Cargando...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-right me-2"></i>
              Continuar al Paso 2
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PasoUnoMedico;
