import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <footer className="bg-white mt-auto shadow-soft fixed-bottom" style={{ padding: '40px 0', zIndex: 1030 }}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
            <img 
              src={isDarkMode ? "/Assets/logoChatMedica_oscuro.png" : "/Assets/logoChatMedica.png"} 
              alt="ChatMedic Logo" 
              height="40"
            />
          </div>
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <p className="mb-0" style={{ fontSize: '14px' }}>
              © Todos los Derechos reservados a ChatMedic
            </p>
          </div>
          <div className="col-md-4 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1E6FFB', fontSize: '24px', textDecoration: 'none' }}
                aria-label="Facebook"
              >
                <i className="bi bi-facebook"></i>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1E6FFB', fontSize: '24px', textDecoration: 'none' }}
                aria-label="Instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1E6FFB', fontSize: '24px', textDecoration: 'none' }}
                aria-label="Twitter"
              >
                <i className="bi bi-twitter"></i>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1E6FFB', fontSize: '24px', textDecoration: 'none' }}
                aria-label="LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

    