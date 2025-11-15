import { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';

const ConfirmarEliminarPacienteModal = ({ show, onHide, paciente, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEliminar = async () => {
    setLoading(true);
    setError('');

    try {
      await api.delete(`/admin/pacientes/${paciente.id}`);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar paciente');
    } finally {
      setLoading(false);
    }
  };

  if (!paciente || !show) return null;

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
        aria-labelledby="eliminarPacienteModalLabel"
        aria-hidden={false}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onHide();
          }
        }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Confirmar Eliminación
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <p>
                ¿Estás seguro de que deseas eliminar al paciente{' '}
                <strong>
                  {paciente.nombre} {paciente.apellido}
                </strong>?
              </p>
              <p className="text-muted small mb-0">
                Esta acción eliminará el paciente y todos sus turnos asociados de forma permanente.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHide}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleEliminar}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>
                    Sí, Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmarEliminarPacienteModal;

