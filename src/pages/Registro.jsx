import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Aquí iría la llamada al API cuando esté configurado
      // const response = await api.post('/auth/register', {
      //   nombre: formData.nombre,
      //   apellido: formData.apellido,
      //   email: formData.email,
      //   password: formData.password
      // });
      // Por ahora simulamos el registro
      console.log('Registro intentado con:', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/acceder');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card card-custom">
            <div className="card-body p-5">
              <h2 className="card-title mb-4 text-center" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                Crear Cuenta
              </h2>
              <p className="text-center text-muted mb-4">
                Completa el formulario para registrarte en ChatMedic
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="nombre" className="form-label" style={{ fontWeight: '500' }}>
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-custom"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="apellido" className="form-label" style={{ fontWeight: '500' }}>
                      Apellido
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-custom"
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      required
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label" style={{ fontWeight: '500' }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-custom"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label" style={{ fontWeight: '500' }}>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-custom"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength="6"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label" style={{ fontWeight: '500' }}>
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-custom"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repite tu contraseña"
                    minLength="6"
                  />
                </div>

                {error && (
                  <div className="alert alert-danger rounded-custom mb-3" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success rounded-custom mb-3" role="alert">
                    ¡Registro exitoso! Redirigiendo al login...
                  </div>
                )}

                <div className="text-center mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary-custom px-5"
                    disabled={loading || success}
                  >
                    {loading ? 'Registrando...' : 'Registrarse'}
                  </button>
                </div>

                <div className="text-center">
                  <p className="mb-0" style={{ fontSize: '14px' }}>
                    ¿Ya tienes una cuenta?{' '}
                    <Link 
                      to="/acceder" 
                      className="text-decoration-none"
                      style={{ color: '#1E6FFB' }}
                    >
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Registro;

