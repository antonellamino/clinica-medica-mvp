import { createPortal } from 'react-dom';

const VerPacienteModal = ({ show, onHide, paciente }) => {
  if (!paciente || !show) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {typeof document !== 'undefined' && createPortal(
        <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>,
        document.body
      )}
      <div
        className={`modal fade show`}
        style={{ display: 'block', zIndex: 1050 }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="verPacienteModalLabel"
        aria-hidden={false}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onHide();
          }
        }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-eye me-2"></i>
                Detalles del Paciente
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>ID:</strong>
                  <p>{paciente.id}</p>
                </div>
                <div className="col-md-6">
                  <strong>Nombre:</strong>
                  <p>{paciente.nombre}</p>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Apellido:</strong>
                  <p>{paciente.apellido || '-'}</p>
                </div>
                <div className="col-md-6">
                  <strong>Email:</strong>
                  <p>{paciente.email}</p>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Rol:</strong>
                  <p>
                    <span className="badge bg-primary">{paciente.role}</span>
                  </p>
                </div>
                <div className="col-md-6">
                  <strong>Turnos:</strong>
                  <p>
                    <span className="badge bg-info">
                      {paciente._count?.turnosPaciente || 0}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <strong>Fecha de Registro:</strong>
                <p>{formatDate(paciente.createdAt)}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHide}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerPacienteModal;

