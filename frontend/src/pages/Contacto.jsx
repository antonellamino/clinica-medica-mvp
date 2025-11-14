import { useState } from 'react';
import api from '../services/api';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    consulta: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Aquí iría la llamada al API cuando esté configurado
      // const response = await api.post('/contacto', formData);
      // Por ahora simulamos el envío
      console.log('Formulario enviado:', formData);
      setMessage({ 
        type: 'success', 
        text: 'Gracias por contactarnos. Tu mensaje ha sido enviado correctamente.' 
      });
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        consulta: ''
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error al enviar el formulario. Por favor, intenta nuevamente.' 
      });
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
                Contáctanos
              </h2>
              <p className="text-center text-muted mb-4">
                Estamos aquí para ayudarte. Completa el formulario y nos pondremos en contacto contigo.
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
                
                <div className="mb-4">
                  <label htmlFor="consulta" className="form-label" style={{ fontWeight: '500' }}>
                    Consulta
                  </label>
                  <textarea
                    className="form-control form-control-custom"
                    id="consulta"
                    name="consulta"
                    rows="5"
                    value={formData.consulta}
                    onChange={handleChange}
                    required
                    placeholder="Escribe tu consulta aquí..."
                  ></textarea>
                </div>

                {message.text && (
                  <div 
                    className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} rounded-custom mb-3`}
                    role="alert"
                  >
                    {message.text}
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary-custom px-5"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contacto;

