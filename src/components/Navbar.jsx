import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogoClick = () => {
    navigate('/');
    window.location.reload();
  };

  const handleInicioClick = () => {
    navigate('/');
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-soft">
      <div className="container">
        <Link 
          to="/" 
          className="navbar-brand d-flex align-items-center"
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        >
          <img 
            src={isDarkMode ? "/Assets/logoChatMedica_oscuro.png" : "/Assets/logoChatMedica.png"} 
            alt="ChatMedic Logo" 
            height="50"
            style={{ marginRight: '10px' }}
          />
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link 
                to="/" 
                className="nav-link"
                onClick={handleInicioClick}
                style={{ 
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/contacto" 
                className="nav-link"
                style={{ 
                  fontWeight: '500'
                }}
              >
                Contacto
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                {/* Enlaces según rol del usuario */}
                {isAuthenticated && (
                  <>
                    {(() => {
                      const role = localStorage.getItem('user') 
                        ? JSON.parse(localStorage.getItem('user'))?.role 
                        : null;
                      
                      if (role === 'paciente') {
                        return (
                          <li className="nav-item">
                            <Link 
                              to="/dashboard/paciente" 
                              className="nav-link"
                              style={{ fontWeight: '500' }}
                            >
                              Mi Dashboard
                            </Link>
                          </li>
                        );
                      } else if (role === 'medico') {
                        return (
                          <li className="nav-item">
                            <Link 
                              to="/dashboard/medico" 
                              className="nav-link"
                              style={{ fontWeight: '500' }}
                            >
                              Mi Dashboard
                            </Link>
                          </li>
                        );
                      } else if (role === 'admin') {
                        return (
                          <li className="nav-item">
                            <Link 
                              to="/dashboard/admin" 
                              className="nav-link"
                              style={{ fontWeight: '500' }}
                            >
                              Panel Admin
                            </Link>
                          </li>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={handleLogout}
                    style={{ 
                      fontWeight: '500',
                      border: 'none',
                      background: 'none',
                      textDecoration: 'none'
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link 
                  to="/acceder" 
                  className="nav-link"
                  style={{ 
                    fontWeight: '500'
                  }}
                >
                  Acceder
                </Link>
              </li>
            )}
            <li className="nav-item">
              <button
                className="btn btn-link nav-link"
                onClick={toggleTheme}
                style={{ 
                  border: 'none',
                  background: 'none',
                  padding: '8px 12px',
                  fontSize: '20px',
                  color: 'inherit'
                }}
                aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
                title={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {isDarkMode ? (
                  <i className="bi bi-sun-fill"></i>
                ) : (
                  <i className="bi bi-moon-fill"></i>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

