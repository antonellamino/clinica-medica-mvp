import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Error404 = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <main className="container my-5 flex-grow-1 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <img 
          src={isDarkMode ? "/Assets/error404_oscuro.png" : "/Assets/error404.png"} 
          alt="Error 404" 
          className="img-fluid mb-4"
          style={{ maxWidth: '500px' }}
        />
        <h1 className="mb-3" style={{ color: '#1E1E1E', fontWeight: '600' }}>
          Página no encontrada
        </h1>
        <p className="text-muted mb-4" style={{ fontSize: '18px' }}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link 
          to="/" 
          className="btn btn-primary-custom"
        >
          Volver al Inicio
        </Link>
      </div>
    </main>
  );
};

export default Error404;

