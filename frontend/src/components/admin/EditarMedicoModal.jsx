import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';

const EditarMedicoModal = ({ show, onHide, medico, onSuccess }) => {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    especialidad_id: '',
    horario_inicio: '09:00',
    horario_fin: '17:00',
    dias_semana: []
  });

  const diasSemanaOptions = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  useEffect(() => {
    if (show && medico) {
      fetchEspecialidades();
      // Pre-llenar formulario con datos del médico
      const dias = Array.isArray(medico.diasSemana) 
        ? medico.diasSemana 
        : medico.diasSemana.split(',').map(d => d.trim());
      
      setFormData({
        nombre: medico.nombre || '',
        apellido: medico.apellido || '',
        email: medico.email || '',
        password: '', // No pre-llenar password
        especialidad_id: medico.especialidad?.id || '',
        horario_inicio: medico.horarioInicio || '09:00',
        horario_fin: medico.horarioFin || '17:00',
        dias_semana: dias
      });
    }
  }, [show, medico]);

  const fetchEspecialidades = async () => {
    try {
      const response = await api.get('/especialidades');
      setEspecialidades(response.data);
    } catch (err) {
      console.error('Error al cargar especialidades:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleDiasChange = (e) => {
    const { value, checked } = e.target;
    let newDias = [...formData.dias_semana];
    
    if (checked) {
      newDias.push(value);
    } else {
      newDias = newDias.filter(dia => dia !== value);
    }
    
    setFormData({
      ...formData,
      dias_semana: newDias
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.dias_semana.length === 0) {
      setError('Debes seleccionar al menos un día de la semana');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        especialidad_id: parseInt(formData.especialidad_id),
        horario_inicio: formData.horario_inicio,
        horario_fin: formData.horario_fin,
        dias_semana: formData.dias_semana.join(',')
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (formData.password) {
        payload.password = formData.password;
      }

      await api.put(`/admin/medicos/${medico.id}`, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar médico');
    } finally {
      setLoading(false);
    }
  };

  if (!medico || !show) return null;

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
        aria-labelledby="editarMedicoModalLabel"
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
              <i className="bi bi-pencil me-2"></i>
              Editar Médico
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <h6 className="mb-3">Datos del Usuario</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="nombre-edit" className="form-label">
                    Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre-edit"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="apellido-edit" className="form-label">
                    Apellido
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="apellido-edit"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="email-edit" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email-edit"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="password-edit" className="form-label">
                    Nueva Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password-edit"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="6"
                    placeholder="Dejar vacío para no cambiar"
                  />
                  <small className="form-text text-muted">
                    Dejar vacío para mantener la password actual
                  </small>
                </div>
              </div>

              <hr className="my-4" />
              <h6 className="mb-3">Datos del Médico</h6>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="especialidad_id-edit" className="form-label">
                    Especialidad <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="especialidad_id-edit"
                    name="especialidad_id"
                    value={formData.especialidad_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona una especialidad</option>
                    {especialidades.map((esp) => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="horario_inicio-edit" className="form-label">
                    Horario de Inicio <span className="text-danger">*</span>
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    id="horario_inicio-edit"
                    name="horario_inicio"
                    value={formData.horario_inicio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="horario_fin-edit" className="form-label">
                    Horario de Fin <span className="text-danger">*</span>
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    id="horario_fin-edit"
                    name="horario_fin"
                    value={formData.horario_fin}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Días de la Semana <span className="text-danger">*</span>
                </label>
                <div className="row">
                  {diasSemanaOptions.map((dia) => (
                    <div key={dia.value} className="col-md-3 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`dia-edit-${dia.value}`}
                          value={dia.value}
                          checked={formData.dias_semana.includes(dia.value)}
                          onChange={handleDiasChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`dia-edit-${dia.value}`}
                        >
                          {dia.label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default EditarMedicoModal;

