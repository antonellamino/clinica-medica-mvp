import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// TEMPORAL: Comentado para desactivar protección de rutas
// import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Error404 from './pages/Error404';
import DashboardPaciente from './pages/DashboardPaciente';
import DashboardMedico from './pages/DashboardMedico';
import DashboardAdmin from './pages/DashboardAdmin';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/acceder" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/404" element={<Error404 />} />
              
              {/* ======================================================================
                  TEMPORAL: Rutas sin protección para testing
                  COMENTAR cuando el backend esté listo y restaurar las rutas protegidas
                  ====================================================================== */}
              
              {/* Rutas de dashboard directamente accesibles para testing */}
              <Route path="/dashboard/paciente" element={<DashboardPaciente />} />
              <Route path="/dashboard/medico" element={<DashboardMedico />} />
              <Route path="/dashboard/admin" element={<DashboardAdmin />} />
              
              {/* COMENTAR TEMPORALMENTE - Rutas protegidas originales:
              <Route 
                path="/dashboard/paciente" 
                element={
                  <ProtectedRoute requiredRole="paciente">
                    <DashboardPaciente />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/medico" 
                element={
                  <ProtectedRoute requiredRole="medico">
                    <DashboardMedico />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <DashboardAdmin />
                  </ProtectedRoute>
                } 
              />
              */}
              
              <Route path="*" element={<Error404 />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

