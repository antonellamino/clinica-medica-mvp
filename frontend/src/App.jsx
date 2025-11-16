import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Error404 from './pages/Error404';
import Perfil from './pages/Perfil';
import AdminDashboard from './pages/AdminDashboard';
import ListadoMedicos from './pages/admin/ListadoMedicos';
import ListadoPacientes from './pages/admin/ListadoPacientes';
import ListadoTurnos from './pages/admin/ListadoTurnos';
import DashboardPaciente from './pages/DashboardPaciente';
import DashboardMedico from './pages/DashboardMedico';
import SacarTurnoForm from './pages/SacarTurnoForm';
import ProtectedRoute from './components/ProtectedRoute';
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
              <Route path="*" element={<Error404 />} />
              <Route path="/perfil" element={<Perfil />} />
              
              {/* Rutas protegidas por rol */}
              <Route 
                path="/sacarTurnoForm" 
                element={
                  <ProtectedRoute requiredRole="paciente">
                    <SacarTurnoForm />
                  </ProtectedRoute>
                }
              />
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
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="medicos" element={<ListadoMedicos />} />
                <Route path="pacientes" element={<ListadoPacientes />} />
                <Route path="turnos" element={<ListadoTurnos />} />
              </Route>
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

