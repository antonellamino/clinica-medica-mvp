import { useState, useEffect } from 'react';
import api from '../../services/api';
import CrearMedicoModal from '../../components/admin/CrearMedicoModal';
import VerMedicoModal from '../../components/admin/VerMedicoModal';
import EditarMedicoModal from '../../components/admin/EditarMedicoModal';
import ConfirmarEliminarModal from '../../components/admin/ConfirmarEliminarModal';

const ListadoMedicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showVerModal, setShowVerModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);

  useEffect(() => {
    fetchMedicos();
  }, []);

  const fetchMedicos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medicos');
      setMedicos(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar médicos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVer = (medico) => {
    setMedicoSeleccionado(medico);
    setShowVerModal(true);
  };

  const handleEditar = (medico) => {
    setMedicoSeleccionado(medico);
    setShowEditarModal(true);
  };

  const handleEliminar = (medico) => {
    setMedicoSeleccionado(medico);
    setShowEliminarModal(true);
  };

  const handleCrearSuccess = () => {
    setShowCrearModal(false);
    fetchMedicos();
  };

  const handleEditarSuccess = () => {
    setShowEditarModal(false);
    setMedicoSeleccionado(null);
    fetchMedicos();
  };

  const handleEliminarSuccess = () => {
    setShowEliminarModal(false);
    setMedicoSeleccionado(null);
    fetchMedicos();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-person-badge me-2"></i>
          Gestión de Médicos
        </h2>
        <button
          className="btn btn-primary-custom"
          onClick={() => setShowCrearModal(true)}
        >
          <i className="bi bi-person-plus me-2"></i>
          Crear Nuevo Médico
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

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
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Especialidad</th>
                <th>Horarios</th>
                <th>Días</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No hay médicos registrados
                  </td>
                </tr>
              ) : (
                medicos.map((medico) => (
                  <tr key={medico.id}>
                    <td className="align-middle">{medico.id}</td>
                    <td className="align-middle">{medico.nombre}</td>
                    <td className="align-middle">{medico.apellido || '-'}</td>
                    <td className="align-middle">{medico.email}</td>
                    <td className="align-middle">{medico.especialidad.nombre}</td>
                    <td className="align-middle">
                      {medico.horarioInicio} - {medico.horarioFin}
                    </td>
                    <td className="align-middle">
                      <small>{Array.isArray(medico.diasSemana) ? medico.diasSemana.join(', ') : medico.diasSemana}</small>
                    </td>
                    <td className="align-middle">
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-info"
                          onClick={() => handleVer(medico)}
                          title="Ver detalles"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => handleEditar(medico)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleEliminar(medico)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      <CrearMedicoModal
        show={showCrearModal}
        onHide={() => setShowCrearModal(false)}
        onSuccess={handleCrearSuccess}
      />

      {medicoSeleccionado && (
        <>
          <VerMedicoModal
            show={showVerModal}
            onHide={() => {
              setShowVerModal(false);
              setMedicoSeleccionado(null);
            }}
            medico={medicoSeleccionado}
          />

          <EditarMedicoModal
            show={showEditarModal}
            onHide={() => {
              setShowEditarModal(false);
              setMedicoSeleccionado(null);
            }}
            medico={medicoSeleccionado}
            onSuccess={handleEditarSuccess}
          />

          <ConfirmarEliminarModal
            show={showEliminarModal}
            onHide={() => {
              setShowEliminarModal(false);
              setMedicoSeleccionado(null);
            }}
            medico={medicoSeleccionado}
            onSuccess={handleEliminarSuccess}
          />
        </>
      )}
    </div>
  );
};

export default ListadoMedicos;

