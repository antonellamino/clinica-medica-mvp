import { createPortal } from 'react-dom';

const VerMedicoModal = ({ show, onHide, medico }) => {
  if (!medico || !show) return null;

  const diasSemana = Array.isArray(medico.diasSemana) 
    ? medico.diasSemana 
    : medico.diasSemana.split(',').map(d => d.trim());

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
        aria-labelledby="verMedicoModalLabel"
        aria-hidden={false}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onHide();
          }
        }}
      >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-eye me-2"></i>
              Detalles del Médico
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body">
            <h6 className="mb-3">Datos del Usuario</h6>
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Nombre:</strong>
                <p>{medico.nombre}</p>
              </div>
              <div className="col-md-6">
                <strong>Apellido:</strong>
                <p>{medico.apellido || '-'}</p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Email:</strong>
                <p>{medico.email}</p>
              </div>
              <div className="col-md-6">
                <strong>ID Usuario:</strong>
                <p>{medico.userId}</p>
              </div>
            </div>

            <hr className="my-4" />
            <h6 className="mb-3">Datos del Médico</h6>
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>ID Médico:</strong>
                <p>{medico.id}</p>
              </div>
              <div className="col-md-6">
                <strong>Especialidad:</strong>
                <p>{medico.especialidad?.nombre || '-'}</p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Horario de Inicio:</strong>
                <p>{medico.horarioInicio}</p>
              </div>
              <div className="col-md-6">
                <strong>Horario de Fin:</strong>
                <p>{medico.horarioFin}</p>
              </div>
            </div>
            <div className="mb-3">
              <strong>Días de la Semana:</strong>
              <p>{diasSemana.join(', ')}</p>
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

export default VerMedicoModal;

