const PasoTresConfirmar = ({ formData, onConfirm, loading }) => {
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
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
        <i className="bi bi-clipboard-check me-2"></i>
        Confirma tu Turno
      </h3>

      <p className="text-muted mb-4">
        Por favor, revisa la información del turno antes de confirmar. No podrás modificarla después.
      </p>

      {/* Tarjeta de Resumen */}
      <div className="card card-custom mb-4">
        <div className="card-body p-4">
          {/* Médico */}
          <div className="mb-4 pb-3 border-bottom">
            <h5 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
              <i className="bi bi-person-badge me-2" style={{ color: '#1E6FFB' }}></i>
              Médico
            </h5>
            <div className="row">
              <div className="col-12">
                <p className="mb-1">
                  <strong style={{ color: '#1E1E1E' }}>Nombre:</strong> Dr(a). {formData.medico.nombre} {formData.medico.apellido}
                </p>
                <p className="mb-1">
                  <strong style={{ color: '#1E1E1E' }}>Especialidad:</strong> {formData.especialidad.nombre}
                </p>
                <p className="mb-0">
                  <strong style={{ color: '#1E1E1E' }}>Horario de Atención:</strong> {formData.medico.horarioInicio} - {formData.medico.horarioFin}
                </p>
              </div>
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="mb-4 pb-3 border-bottom">
            <h5 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
              <i className="bi bi-calendar-event me-2" style={{ color: '#1E6FFB' }}></i>
              Fecha y Hora
            </h5>
            <div className="row">
              <div className="col-md-6 mb-2">
                <p className="mb-1">
                  <strong style={{ color: '#1E1E1E' }}>Fecha:</strong>
                </p>
                <p style={{ color: '#1E1E1E', fontSize: '16px' }}>
                  {formatearFecha(formData.fecha)}
                </p>
              </div>
              <div className="col-md-6 mb-2">
                <p className="mb-1">
                  <strong style={{ color: '#1E1E1E' }}>Hora:</strong>
                </p>
                <p style={{ color: '#1E1E1E', fontSize: '16px' }}>
                  {formData.hora}
                </p>
              </div>
            </div>
          </div>

          {/* Motivo */}
          {formData.motivo && (
            <div className="mb-4 pb-3 border-bottom">
              <h5 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                <i className="bi bi-chat-left-dots me-2" style={{ color: '#1E6FFB' }}></i>
                Motivo de la Consulta
              </h5>
              <p style={{ color: '#1E1E1E' }}>
                {formData.motivo}
              </p>
            </div>
          )}

          {/* Estado */}
          <div>
            <h5 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
              <i className="bi bi-info-circle me-2" style={{ color: '#1E6FFB' }}></i>
              Estado del Turno
            </h5>
            <div>
              <span className="badge bg-warning text-dark" style={{ padding: '8px 12px', fontSize: '13px' }}>
                <i className="bi bi-clock-history me-1"></i>
                Pendiente de Confirmación
              </span>
              <p className="text-muted mt-2 mb-0" style={{ fontSize: '13px' }}>
                El médico confirmará tu turno en breve. Recibirás una notificación cuando se confirme.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Términos y Condiciones */}
      <div className="alert alert-info rounded-custom mb-4" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Importante:</strong> Al confirmar, aceptas los términos y condiciones de nuestra clínica. 
        Recuerda llegar 10 minutos antes de la hora programada.
      </div>

      {/* Botones de Acción */}
      <div className="d-grid gap-2">
        <button
          className="btn btn-success-custom"
          onClick={onConfirm}
          disabled={loading}
          style={{ padding: '12px', fontWeight: '600' }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Confirmando...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Confirmar Turno
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PasoTresConfirmar;
