import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logAction, mockTurnos, mockMedicos, mockPacientes, especialidades } from '../data/mockData';
import api from '../services/api';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('medicos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para Médicos
  const [medicos, setMedicos] = useState([]);
  const [showFormMedico, setShowFormMedico] = useState(false);
  const [medicoEditando, setMedicoEditando] = useState(null);
  const [formMedico, setFormMedico] = useState({
    nombre: '',
    apellido: '',
    email: '',
    especialidad: '',
    telefono: '',
    activo: true
  });

  // Estados para Pacientes
  const [pacientes, setPacientes] = useState([]);
  const [busquedaPaciente, setBusquedaPaciente] = useState('');

  // Estados para Turnos
  const [turnos, setTurnos] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Estados para Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    turnosHoy: 0,
    turnosSemana: 0,
    especialidadesPopulares: []
  });

  useEffect(() => {
    logAction('DashboardAdmin', 'INFO', 'Componente montado', { userId: user?.id });
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulación: cuando el backend esté listo, usar:
      // const [medicosRes, pacientesRes, turnosRes] = await Promise.all([
      //   api.get('/admin/medicos'),
      //   api.get('/admin/usuarios?role=paciente'),
      //   api.get('/admin/turnos')
      // ]);

      // Por ahora usamos datos mock
      setMedicos(mockMedicos);
      setPacientes(mockPacientes);
      setTurnos(mockTurnos);
      calcularEstadisticas(mockTurnos);

      logAction('DashboardAdmin', 'INFO', 'Datos cargados exitosamente');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al cargar los datos';
      setError(errorMsg);
      logAction('DashboardAdmin', 'ERROR', 'Error al cargar datos', { error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (turnosData) => {
    const hoy = new Date().toISOString().split('T')[0];
    const turnosHoy = turnosData.filter(t => t.fecha === hoy).length;
    
    const semana = new Date();
    semana.setDate(semana.getDate() + 7);
    const turnosSemana = turnosData.filter(t => {
      const fechaTurno = new Date(t.fecha);
      return fechaTurno >= new Date(hoy) && fechaTurno <= semana;
    }).length;

    const especialidadesCount = {};
    turnosData.forEach(t => {
      const esp = t.medico.especialidad;
      especialidadesCount[esp] = (especialidadesCount[esp] || 0) + 1;
    });
    const especialidadesPopulares = Object.entries(especialidadesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, count]) => ({ nombre, count }));

    setEstadisticas({
      turnosHoy,
      turnosSemana,
      especialidadesPopulares
    });
  };

  // Funciones para Gestión de Médicos
  const handleSubmitMedico = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (medicoEditando) {
        logAction('DashboardAdmin', 'INFO', `Editando médico ${medicoEditando.id}`);
        // Simulación: await api.put(`/admin/medicos/${medicoEditando.id}`, formMedico);
        setMedicos(prev => prev.map(m => 
          m.id === medicoEditando.id ? { ...m, ...formMedico } : m
        ));
        logAction('DashboardAdmin', 'INFO', `Médico ${medicoEditando.id} actualizado`);
      } else {
        logAction('DashboardAdmin', 'INFO', 'Creando nuevo médico');
        // Simulación: const response = await api.post('/admin/medicos', formMedico);
        const nuevoMedico = {
          id: medicos.length + 1,
          ...formMedico
        };
        setMedicos(prev => [...prev, nuevoMedico]);
        logAction('DashboardAdmin', 'INFO', 'Médico creado exitosamente');
      }

      setShowFormMedico(false);
      setMedicoEditando(null);
      setFormMedico({
        nombre: '',
        apellido: '',
        email: '',
        especialidad: '',
        telefono: '',
        activo: true
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al guardar el médico';
      setError(errorMsg);
      logAction('DashboardAdmin', 'ERROR', 'Error al guardar médico', { error: errorMsg });
    }
  };

  const handleEditarMedico = (medico) => {
    setMedicoEditando(medico);
    setFormMedico(medico);
    setShowFormMedico(true);
  };

  const handleDesactivarMedico = async (medicoId) => {
    if (!window.confirm('¿Estás seguro de desactivar este médico?')) return;

    try {
      logAction('DashboardAdmin', 'WARN', `Desactivando médico ${medicoId}`);
      // Simulación: await api.put(`/admin/medicos/${medicoId}`, { activo: false });
      setMedicos(prev => prev.map(m => 
        m.id === medicoId ? { ...m, activo: false } : m
      ));
      logAction('DashboardAdmin', 'INFO', `Médico ${medicoId} desactivado`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al desactivar el médico';
      setError(errorMsg);
      logAction('DashboardAdmin', 'ERROR', 'Error al desactivar médico', { error: errorMsg });
    }
  };

  const handleActivarMedico = async (medicoId) => {
    try {
      logAction('DashboardAdmin', 'INFO', `Activando médico ${medicoId}`);
      // Simulación: await api.put(`/admin/medicos/${medicoId}`, { activo: true });
      setMedicos(prev => prev.map(m => 
        m.id === medicoId ? { ...m, activo: true } : m
      ));
      logAction('DashboardAdmin', 'INFO', `Médico ${medicoId} activado`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al activar el médico';
      setError(errorMsg);
      logAction('DashboardAdmin', 'ERROR', 'Error al activar médico', { error: errorMsg });
    }
  };

  const handleLogout = () => {
    logAction('DashboardAdmin', 'INFO', 'Usuario cerró sesión');
    logout();
    navigate('/');
  };

  const turnosFiltrados = turnos.filter(t => {
    if (filtroFecha && t.fecha !== filtroFecha) return false;
    if (filtroMedico && t.medico.id !== parseInt(filtroMedico)) return false;
    if (filtroEstado && t.estado !== filtroEstado) return false;
    return true;
  });

  const pacientesFiltrados = pacientes.filter(p => {
    if (!busquedaPaciente) return true;
    const busqueda = busquedaPaciente.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(busqueda) ||
      p.apellido.toLowerCase().includes(busqueda) ||
      p.email.toLowerCase().includes(busqueda)
    );
  });

  if (loading) {
    return (
      <main className="container my-5 flex-grow-1">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container my-5 flex-grow-1">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                    Panel de Administración
                  </h2>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                    Gestión completa del sistema
                  </p>
                </div>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger rounded-custom" role="alert">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card card-custom">
            <div className="card-body p-4 text-center">
              <h3 className="mb-2" style={{ color: '#1E6FFB', fontWeight: '600' }}>
                {estadisticas.turnosHoy}
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                Turnos Hoy
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card card-custom">
            <div className="card-body p-4 text-center">
              <h3 className="mb-2" style={{ color: '#2ECC71', fontWeight: '600' }}>
                {estadisticas.turnosSemana}
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                Turnos Esta Semana
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card card-custom">
            <div className="card-body p-4 text-center">
              <h3 className="mb-2" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                {medicos.filter(m => m.activo).length}
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                Médicos Activos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Especialidades Populares */}
      {estadisticas.especialidadesPopulares.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card card-custom">
              <div className="card-body p-4">
                <h4 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                  Especialidades Más Solicitadas
                </h4>
                <div className="d-flex flex-wrap gap-2">
                  {estadisticas.especialidadesPopulares.map((esp, index) => (
                    <span key={index} className="badge bg-primary" style={{ fontSize: '14px', padding: '8px 12px' }}>
                      {esp.nombre}: {esp.count} turnos
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="row">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body p-4">
              <ul className="nav nav-tabs mb-4" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'medicos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('medicos')}
                    style={{ fontWeight: '500' }}
                  >
                    Gestión de Médicos
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'pacientes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pacientes')}
                    style={{ fontWeight: '500' }}
                  >
                    Gestión de Pacientes
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'turnos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('turnos')}
                    style={{ fontWeight: '500' }}
                  >
                    Todos los Turnos
                  </button>
                </li>
              </ul>

              {/* Tab: Gestión de Médicos */}
              {activeTab === 'medicos' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                      Médicos
                    </h4>
                    <button
                      className="btn btn-primary-custom"
                      onClick={() => {
                        setMedicoEditando(null);
                        setFormMedico({
                          nombre: '',
                          apellido: '',
                          email: '',
                          especialidad: '',
                          telefono: '',
                          activo: true
                        });
                        setShowFormMedico(true);
                      }}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Nuevo Médico
                    </button>
                  </div>

                  {showFormMedico && (
                    <div className="card card-custom mb-4">
                      <div className="card-body p-4">
                        <h5 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                          {medicoEditando ? 'Editar Médico' : 'Nuevo Médico'}
                        </h5>
                        <form onSubmit={handleSubmitMedico}>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label" style={{ fontWeight: '500' }}>
                                Nombre
                              </label>
                              <input
                                type="text"
                                className="form-control form-control-custom"
                                value={formMedico.nombre}
                                onChange={(e) => setFormMedico({ ...formMedico, nombre: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label" style={{ fontWeight: '500' }}>
                                Apellido
                              </label>
                              <input
                                type="text"
                                className="form-control form-control-custom"
                                value={formMedico.apellido}
                                onChange={(e) => setFormMedico({ ...formMedico, apellido: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label" style={{ fontWeight: '500' }}>
                                Email
                              </label>
                              <input
                                type="email"
                                className="form-control form-control-custom"
                                value={formMedico.email}
                                onChange={(e) => setFormMedico({ ...formMedico, email: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label" style={{ fontWeight: '500' }}>
                                Teléfono
                              </label>
                              <input
                                type="tel"
                                className="form-control form-control-custom"
                                value={formMedico.telefono}
                                onChange={(e) => setFormMedico({ ...formMedico, telefono: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label" style={{ fontWeight: '500' }}>
                              Especialidad
                            </label>
                            <select
                              className="form-select form-control-custom"
                              value={formMedico.especialidad}
                              onChange={(e) => setFormMedico({ ...formMedico, especialidad: e.target.value })}
                              required
                            >
                              <option value="">Seleccionar especialidad</option>
                              {especialidades.map(esp => (
                                <option key={esp} value={esp}>{esp}</option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-3">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={formMedico.activo}
                                onChange={(e) => setFormMedico({ ...formMedico, activo: e.target.checked })}
                              />
                              <label className="form-check-label" style={{ fontWeight: '500' }}>
                                Médico activo
                              </label>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary-custom">
                              {medicoEditando ? 'Actualizar' : 'Crear'} Médico
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                setShowFormMedico(false);
                                setMedicoEditando(null);
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Especialidad</th>
                          <th>Teléfono</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicos.map(medico => (
                          <tr key={medico.id}>
                            <td>{medico.nombre} {medico.apellido}</td>
                            <td>{medico.email}</td>
                            <td>{medico.especialidad}</td>
                            <td>{medico.telefono}</td>
                            <td>
                              {medico.activo ? (
                                <span className="badge bg-success">Activo</span>
                              ) : (
                                <span className="badge bg-secondary">Inactivo</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleEditarMedico(medico)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              {medico.activo ? (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDesactivarMedico(medico.id)}
                                >
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleActivarMedico(medico.id)}
                                >
                                  <i className="bi bi-check-circle"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Gestión de Pacientes */}
              {activeTab === 'pacientes' && (
                <div>
                  <div className="mb-4">
                    <h4 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                      Pacientes
                    </h4>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control form-control-custom"
                        placeholder="Buscar por nombre, apellido o email..."
                        value={busquedaPaciente}
                        onChange={(e) => setBusquedaPaciente(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Teléfono</th>
                          <th>Fecha de Nacimiento</th>
                          <th>Obra Social</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pacientesFiltrados.map(paciente => (
                          <tr key={paciente.id}>
                            <td>{paciente.nombre} {paciente.apellido}</td>
                            <td>{paciente.email}</td>
                            <td>{paciente.telefono}</td>
                            <td>{paciente.fechaNacimiento}</td>
                            <td>{paciente.obraSocial || 'N/A'}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => logAction('DashboardAdmin', 'INFO', `Ver historial paciente ${paciente.id}`)}
                              >
                                <i className="bi bi-clock-history me-1"></i>
                                Ver Historial
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Todos los Turnos */}
              {activeTab === 'turnos' && (
                <div>
                  <div className="mb-4">
                    <h4 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                      Todos los Turnos
                    </h4>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontWeight: '500' }}>
                          Filtrar por Fecha
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-custom"
                          value={filtroFecha}
                          onChange={(e) => setFiltroFecha(e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontWeight: '500' }}>
                          Filtrar por Médico
                        </label>
                        <select
                          className="form-select form-control-custom"
                          value={filtroMedico}
                          onChange={(e) => setFiltroMedico(e.target.value)}
                        >
                          <option value="">Todos los médicos</option>
                          {medicos.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.nombre} {m.apellido}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontWeight: '500' }}>
                          Filtrar por Estado
                        </label>
                        <select
                          className="form-select form-control-custom"
                          value={filtroEstado}
                          onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                          <option value="">Todos los estados</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="completado">Completado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Paciente</th>
                          <th>Médico</th>
                          <th>Especialidad</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {turnosFiltrados.map(turno => (
                          <tr key={turno.id}>
                            <td>{turno.fecha}</td>
                            <td>{turno.hora}</td>
                            <td>{turno.paciente.nombre} {turno.paciente.apellido}</td>
                            <td>{turno.medico.nombre} {turno.medico.apellido}</td>
                            <td>{turno.medico.especialidad}</td>
                            <td>
                              <span className={`badge ${
                                turno.estado === 'confirmado' ? 'bg-success' :
                                turno.estado === 'pendiente' ? 'bg-warning' :
                                turno.estado === 'completado' ? 'bg-info' :
                                'bg-danger'
                              }`}>
                                {turno.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {turnosFiltrados.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-muted mb-0">No se encontraron turnos con los filtros aplicados.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardAdmin;

