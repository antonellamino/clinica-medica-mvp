import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PasoUnoMedico from '../components/sacarTurno/PasoUnoMedico';
import PasoDosFechaHora from '../components/sacarTurno/PasoDosFechaHora';
import PasoTresConfirmar from '../components/sacarTurno/PasoTresConfirmar';

// Sistema de logging
const logAction = (level, action, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [SacarTurnoForm] [${level}] ${action}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

const SacarTurnoForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    medicoId: null,
    medico: null,
    especialidad: null,
    fecha: null,
    hora: null,
    motivo: ''
  });

  useEffect(() => {
    logAction('INFO', 'Componente montado', { userId: user?.id, paso });
  }, []);

  const handlePasoUnoSubmit = (medico) => {
    logAction('INFO', 'Paso 1 completado', { medicoId: medico.id, nombre: medico.nombre });
    setFormData(prev => ({
      ...prev,
      medicoId: medico.id,
      medico: medico,
      especialidad: medico.especialidad
    }));
    setPaso(2);
  };

  const handlePasoDosSubmit = (fecha, hora, motivo) => {
    logAction('INFO', 'Paso 2 completado', { fecha, hora });
    setFormData(prev => ({
      ...prev,
      fecha,
      hora,
      motivo
    }));
    setPaso(3);
  };

  const handlePasoTresConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      logAction('INFO', 'Confirmando turno', { 
        medicoId: formData.medicoId, 
        fecha: formData.fecha, 
        hora: formData.hora 
      });

      const response = await api.post('/turnos', {
        medico_id: formData.medicoId,
        fecha: formData.fecha,
        hora: formData.hora,
        motivo: formData.motivo || null
      });

      logAction('INFO', 'Turno creado exitosamente', { turnoId: response.data.turno.id });
      
      // Redirigir al dashboard del paciente
      alert('¡Turno solicitado exitosamente!');
      navigate('/dashboard/paciente');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al crear el turno';
      setError(errorMsg);
      logAction('ERROR', 'Error al crear turno', { error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    if (paso > 1) {
      logAction('INFO', `Volviendo del paso ${paso} al paso ${paso - 1}`);
      setPaso(paso - 1);
    } else {
      logAction('INFO', 'Cancelando formulario y volviendo al dashboard');
      navigate('/dashboard/paciente');
    }
  };

  const handleCancelar = () => {
    logAction('INFO', 'Usuario canceló el formulario');
    navigate('/dashboard/paciente');
  };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          {/* Header */}
          <div className="mb-4">
            <h1 className="mb-2" style={{ color: '#1E1E1E', fontWeight: '600' }}>
              <i className="bi bi-calendar-plus me-2"></i>
              Solicitar Nuevo Turno
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
              Completa los siguientes pasos para agendar tu cita médica
            </p>
          </div>

          {/* Indicador de progreso */}
          <div className="card card-custom mb-4">
            <div className="card-body p-4">
              <div className="progress mb-3" style={{ height: '4px' }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${(paso / 3) * 100}%` }}
                  aria-valuenow={paso}
                  aria-valuemin="1"
                  aria-valuemax="3"
                ></div>
              </div>
              <div className="d-flex justify-content-between text-center">
                <div className={paso >= 1 ? 'text-primary' : 'text-muted'}>
                  <div className="fw-bold">Paso 1</div>
                  <small>Médico</small>
                </div>
                <div className={paso >= 2 ? 'text-primary' : 'text-muted'}>
                  <div className="fw-bold">Paso 2</div>
                  <small>Fecha y Hora</small>
                </div>
                <div className={paso >= 3 ? 'text-primary' : 'text-muted'}>
                  <div className="fw-bold">Paso 3</div>
                  <small>Confirmar</small>
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes de error */}
          {error && (
            <div className="alert alert-danger rounded-custom mb-4" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Contenido de los pasos */}
          <div className="card card-custom mb-4">
            <div className="card-body p-4">
              {paso === 1 && (
                <PasoUnoMedico 
                  onSubmit={handlePasoUnoSubmit}
                  loading={loading}
                />
              )}

              {paso === 2 && (
                <PasoDosFechaHora
                  medico={formData.medico}
                  onSubmit={handlePasoDosSubmit}
                  loading={loading}
                />
              )}

              {paso === 3 && (
                <PasoTresConfirmar
                  formData={formData}
                  onConfirm={handlePasoTresConfirm}
                  loading={loading}
                />
              )}
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="d-flex justify-content-between gap-3 mb-4">
            <button
              className="btn btn-outline-secondary"
              onClick={handleVolver}
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-2"></i>
              {paso === 1 ? 'Cancelar' : 'Volver'}
            </button>

            {paso === 3 && (
              <button
                className="btn btn-outline-secondary"
                onClick={handleCancelar}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SacarTurnoForm;
