import { useState, useEffect } from 'react';
import api from '../../services/api';
import CrearPacienteModal from '../../components/admin/CrearPacienteModal';
import VerPacienteModal from '../../components/admin/VerPacienteModal';
import EditarPacienteModal from '../../components/admin/EditarPacienteModal';
import ConfirmarEliminarPacienteModal from '../../components/admin/ConfirmarEliminarPacienteModal';

const ListadoPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showVerModal, setShowVerModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pacientes');
      setPacientes(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar pacientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVer = (paciente) => {
    setPacienteSeleccionado(paciente);
    setShowVerModal(true);
  };

  const handleEditar = (paciente) => {
    setPacienteSeleccionado(paciente);
    setShowEditarModal(true);
  };

  const handleEliminar = (paciente) => {
    setPacienteSeleccionado(paciente);
    setShowEliminarModal(true);
  };

  const handleCrearSuccess = () => {
    setShowCrearModal(false);
    fetchPacientes();
  };

  const handleEditarSuccess = () => {
    setShowEditarModal(false);
    setPacienteSeleccionado(null);
    fetchPacientes();
  };

  const handleEliminarSuccess = () => {
    setShowEliminarModal(false);
    setPacienteSeleccionado(null);
    fetchPacientes();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-people me-2"></i>
          Gestión de Pacientes
        </h2>
        <button
          className="btn btn-primary-custom"
          onClick={() => setShowCrearModal(true)}
        >
          <i className="bi bi-person-plus me-2"></i>
          Crear Nuevo Paciente
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
                <th>Turnos</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No hay pacientes registrados
                  </td>
                </tr>
              ) : (
                pacientes.map((paciente) => (
                  <tr key={paciente.id}>
                    <td className="align-middle">{paciente.id}</td>
                    <td className="align-middle">{paciente.nombre}</td>
                    <td className="align-middle">{paciente.apellido || '-'}</td>
                    <td className="align-middle">{paciente.email}</td>
                    <td className="align-middle">
                      <span className="badge bg-info">
                        {paciente._count?.turnosPaciente || 0}
                      </span>
                    </td>
                    <td className="align-middle">
                      <small>{formatDate(paciente.createdAt)}</small>
                    </td>
                    <td className="align-middle">
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-info"
                          onClick={() => handleVer(paciente)}
                          title="Ver detalles"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => handleEditar(paciente)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleEliminar(paciente)}
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
      <CrearPacienteModal
        show={showCrearModal}
        onHide={() => setShowCrearModal(false)}
        onSuccess={handleCrearSuccess}
      />

      {pacienteSeleccionado && (
        <>
          <VerPacienteModal
            show={showVerModal}
            onHide={() => {
              setShowVerModal(false);
              setPacienteSeleccionado(null);
            }}
            paciente={pacienteSeleccionado}
          />

          <EditarPacienteModal
            show={showEditarModal}
            onHide={() => {
              setShowEditarModal(false);
              setPacienteSeleccionado(null);
            }}
            paciente={pacienteSeleccionado}
            onSuccess={handleEditarSuccess}
          />

          <ConfirmarEliminarPacienteModal
            show={showEliminarModal}
            onHide={() => {
              setShowEliminarModal(false);
              setPacienteSeleccionado(null);
            }}
            paciente={pacienteSeleccionado}
            onSuccess={handleEliminarSuccess}
          />
        </>
      )}
    </div>
  );
};

export default ListadoPacientes;

