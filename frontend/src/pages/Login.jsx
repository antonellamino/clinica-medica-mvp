import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      // Aquí iría la llamada al API cuando esté configurado
      // const response = await api.post('/auth/login', formData);
      // login(response.data.user, response.data.token);
      // Por ahora simulamos el login
      console.log('Login intentado con:', formData);
      setError('Backend no configurado aún. Esta funcionalidad estará disponible pronto.');
      // Simulación de login exitoso (descomentar cuando el backend esté listo):
      // login({ email: formData.email, name: 'Usuario' }, 'fake-token');
      // navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card card-custom">
            <div className="row g-0">
              <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light">
                <img 
                  src="/Assets/asistenteMedica.png" 
                  alt="Asistente Médica" 
                  className="img-fluid"
                  style={{ maxHeight: '400px', padding: '20px' }}
                />
              </div>
              <div className="col-md-6">
                <div className="card-body p-4">
                  <h3 className="card-title mb-4" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                    Iniciar Sesión
                  </h3>
                  <form onSubmit={handleSubmit}>
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
                        placeholder="••••••••"
                      />
                    </div>
                    {error && (
                      <div className="alert alert-danger rounded-custom mb-3" role="alert">
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary-custom w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                    <div className="text-center">
                      <Link 
                        to="/registro" 
                        className="text-decoration-none"
                        style={{ color: '#1E6FFB', fontSize: '14px' }}
                      >
                        Registrarse
                      </Link>
                      <span className="mx-2" style={{ color: '#ccc' }}>|</span>
                      <Link 
                        to="/404" 
                        className="text-decoration-none"
                        style={{ color: '#1E6FFB', fontSize: '14px' }}
                      >
                        ¿Olvidaste la contraseña?
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;

