import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      
      // Redirigir según el rol
      if (response.data.user.role === 'admin') {
        navigate('/admin/medicos');
      } else if (response.data.user.role === 'medico') {
        navigate('/dashboard/medico');
      } else if (response.data.user.role === 'paciente') {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Aquí iría la llamada al API cuando esté configurado
      // const response = await api.post('/chat', { message: chatMessage });
      // Por ahora simulamos la respuesta
      console.log('Mensaje enviado:', chatMessage);
      setChatResponse('Gracias por tu consulta. Esta funcionalidad estará disponible cuando el backend esté configurado.');
      setChatMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row">
        {/* Columna Izquierda: Login o Info de Sesión */}
        <div className="col-lg-6 mb-4">
          {!isAuthenticated ? (
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
                    <form onSubmit={handleLogin}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label" style={{ fontWeight: '500' }}>
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-custom"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                        />
                      </div>
                      {error && (
                        <div className="alert alert-danger rounded-custom" role="alert">
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
          ) : (
            <div className="card card-custom">
              <div className="row g-0">
                <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light">
                  <img 
                    src="/Assets/asistenteMedica.png" 
                    alt="Asistente Médica" 
                    className="img-fluid"
                    style={{ maxHeight: '300px', padding: '20px' }}
                  />
                </div>
                <div className="col-md-6">
                  <div className="card-body p-4">
                    <h3 className="card-title mb-4" style={{ color: '#1E1E1E', fontWeight: '600' }}>
                      Información de Sesión
                    </h3>
                    <p className="text-muted">Sesión iniciada correctamente</p>
                    <Link 
                      to="/dashboard/paciente" 
                      className="btn btn-primary-custom mt-3"
                    >
                      Ir a mi Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Chatbot Ético - SIEMPRE VISIBLE */}
        <div className="col-lg-6 mb-4">
          <Chatbot />
        </div>
      </div>
    </main>
  );
};

export default Home;



