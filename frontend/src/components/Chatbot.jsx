import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Las reglas hardcodeadas ya no se usan, ahora usamos Gemini API desde el backend

// ============================================================================
// MENSAJE INICIAL ÉTICO OBLIGATORIO
// ============================================================================
const initialEthicalMessage = `🤖 **Asistente Virtual de Derivación Médica**

¡Hola! Soy un asistente IA que te ayudará a encontrar el especialista adecuado según tus síntomas.

**IMPORTANTE:**

✅ **PUEDO:**
- Derivarte a la especialidad médica correcta
- Basar mis recomendaciones en síntomas descritos
- Proteger tu privacidad

❌ **NO PUEDO:**
- Diagnosticar condiciones médicas
- Recetar medicamentos
- Reemplazar consulta profesional

⚠️ Si tienes síntomas graves como dolor de pecho, dificultad para respirar o sangrado intenso, acude inmediatamente a urgencias.

¿Podrías contarme brevemente qué síntomas tienes?`;

const Chatbot = () => {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: initialEthicalMessage,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationState, setConversationState] = useState('waiting_symptoms'); // waiting_symptoms, showing_specialty, selecting_doctor, selecting_date, selecting_time, confirming
  const [detectedSpecialty, setDetectedSpecialty] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Verificar si el usuario es paciente
  const isPatient = isAuthenticated && user?.role === 'paciente';

  // Scroll automático a nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Función para enviar mensaje al backend y obtener respuesta de Gemini
  const sendMessageToBackend = async (message) => {
    try {
      const response = await api.post('/chatbot', { message });
      return response.data;
    } catch (error) {
      console.error('Error al comunicarse con el chatbot:', error);
      throw error;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading || !isPatient) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputMessage.trim();
    
    // Guardar síntomas si estamos en el estado inicial
    if (conversationState === 'waiting_symptoms') {
      setSymptoms(messageText);
    }
    
    setInputMessage('');
    setLoading(true);

    try {
      // Enviar mensaje al backend con Gemini
      const response = await sendMessageToBackend(messageText);

      // Procesar respuesta del backend
      if (response.isUrgency) {
        // Caso de urgencia médica
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: response.response,
          sender: 'bot',
          timestamp: new Date()
        }]);
        setConversationState('waiting_symptoms');
      } else if (response.specialty && response.doctors.length > 0) {
        // Se detectó especialidad y hay médicos disponibles
        setDetectedSpecialty(response.specialty);
        setAvailableDoctors(response.doctors);
        setConversationState('showing_specialty');
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: response.response,
          sender: 'bot',
          timestamp: new Date()
        }]);
      } else if (response.specialty && response.doctors.length === 0) {
        // Se detectó especialidad pero no hay médicos
        setDetectedSpecialty(response.specialty);
        setAvailableDoctors([]);
        setConversationState('waiting_symptoms');
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: response.response,
          sender: 'bot',
          timestamp: new Date()
        }]);
      } else {
        // No se pudo determinar especialidad
        setConversationState('waiting_symptoms');
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: response.response,
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      // Manejo de errores
      let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.response?.status === 403) {
        errorMessage = 'El chatbot está disponible solo para pacientes. Por favor, inicia sesión con una cuenta de paciente.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener horarios disponibles
  const loadAvailableSlots = async (medicoId, fecha) => {
    try {
      setLoadingSlots(true);
      const response = await api.get(`/turnos/disponibilidad/${medicoId}?fecha=${fecha}`);
      setAvailableSlots(response.data.horarios || []);
      return response.data.horarios || [];
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      setAvailableSlots([]);
      return [];
    } finally {
      setLoadingSlots(false);
    }
  };

  // Función para seleccionar médico
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setConversationState('selecting_date');
    
    // Agregar mensaje del bot
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: `Perfecto, has seleccionado a **Dr. ${doctor.nombre} ${doctor.apellido}**.\n\nAhora elige una fecha para tu turno:`,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  // Función para seleccionar fecha
  const handleSelectDate = async (date) => {
    if (!selectedDoctor) return;
    
    setSelectedDate(date);
    
    // Validar que el médico atiende ese día
    const dateObj = new Date(date);
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dayName = dias[dateObj.getDay()];
    
    if (!selectedDoctor.diasSemana.includes(dayName)) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: `⚠️ El Dr. ${selectedDoctor.nombre} ${selectedDoctor.apellido} no atiende los ${dayName}s. Por favor, elige otro día.`,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setSelectedDate('');
      return;
    }

    // Cargar horarios disponibles
    setLoadingSlots(true);
    const slots = await loadAvailableSlots(selectedDoctor.id, date);
    
    if (slots.length === 0) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: `No hay horarios disponibles para el ${dateObj.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Por favor, elige otra fecha.`,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setSelectedDate('');
      setLoadingSlots(false);
      return;
    }

    setConversationState('selecting_time');
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: `Excelente. Horarios disponibles para el ${dateObj.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}:`,
      sender: 'bot',
      timestamp: new Date()
    }]);
    setLoadingSlots(false);
  };

  // Función para seleccionar hora
  const handleSelectTime = (time) => {
    setSelectedTime(time);
    setConversationState('confirming');
    
    const dateObj = new Date(selectedDate);
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: `Perfecto. ¿Confirmas este turno?\n\n**Dr. ${selectedDoctor.nombre} ${selectedDoctor.apellido}**\n📅 ${dateObj.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n🕐 ${time}`,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  // Función para confirmar y crear turno
  const handleConfirmAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    setLoading(true);
    
    try {
      const response = await api.post('/turnos', {
        medico_id: selectedDoctor.id,
        fecha: selectedDate,
        hora: selectedTime,
        motivo: symptoms || null
      });

      // Mostrar mensaje de éxito
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: `✅ **¡Turno confirmado exitosamente!**\n\nTu turno ha sido agendado. Puedes ver todos tus turnos en tu Dashboard.\n\n¿Necesitas agendar otro turno? Escribe tus síntomas nuevamente.`,
        sender: 'bot',
        timestamp: new Date()
      }]);

      // Resetear estados
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setAvailableSlots([]);
      setDetectedSpecialty(null);
      setAvailableDoctors([]);
      setSymptoms('');
      setConversationState('waiting_symptoms');

    } catch (error) {
      let errorMessage = 'Error al crear el turno. Por favor, intenta nuevamente.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: `❌ ${errorMessage}`,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar y volver atrás
  const handleCancel = () => {
    if (conversationState === 'selecting_date') {
      setSelectedDoctor(null);
      setConversationState('showing_specialty');
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: 'De acuerdo. ¿Quieres seleccionar otro médico?',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } else if (conversationState === 'selecting_time') {
      setSelectedDate('');
      setAvailableSlots([]);
      setConversationState('selecting_date');
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: 'De acuerdo. Elige otra fecha:',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } else if (conversationState === 'confirming') {
      setSelectedTime('');
      setConversationState('selecting_time');
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: 'De acuerdo. Elige otro horario:',
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const handleReset = () => {
    setMessages([{
      id: 1,
      text: initialEthicalMessage,
      sender: 'bot',
      timestamp: new Date()
    }]);
    setConversationState('waiting_symptoms');
    setDetectedSpecialty(null);
    setAvailableDoctors([]);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
    setSymptoms('');
  };

  const formatMessage = (text) => {
    // Convertir markdown básico a HTML
    let formatted = text;
    
    // Negritas **texto**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Dividir por líneas y crear elementos
    const lines = formatted.split('\n');
    
    return lines.map((line, index) => {
      // Detectar si hay mención de links
      if (line.includes('Dashboard')) {
        const parts = line.split('Dashboard');
        return (
          <span key={index}>
            <span dangerouslySetInnerHTML={{ __html: parts[0] }} />
            <Link to="/dashboard/paciente" className="text-decoration-none fw-bold" style={{ color: '#1E6FFB' }}>
              Dashboard
            </Link>
            <span dangerouslySetInnerHTML={{ __html: parts[1] || '' }} />
            <br />
          </span>
        );
      }
      if (line.includes('regístrate') || line.includes('inicia sesión')) {
        const parts = line.split('regístrate');
        if (parts.length > 1) {
          const afterParts = parts[1].split('inicia sesión');
          return (
            <span key={index}>
              <span dangerouslySetInnerHTML={{ __html: parts[0] }} />
              <Link to="/registro" className="text-decoration-none fw-bold" style={{ color: '#1E6FFB' }}>
                regístrate
              </Link>
              <span dangerouslySetInnerHTML={{ __html: afterParts[0] || ' o ' }} />
              <Link to="/acceder" className="text-decoration-none fw-bold" style={{ color: '#1E6FFB' }}>
                inicia sesión
              </Link>
              <span dangerouslySetInnerHTML={{ __html: afterParts[1] || '' }} />
              <br />
            </span>
          );
        }
      }
      return (
        <span key={index}>
          <span dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
          <br />
        </span>
      );
    });
  };

  return (
    <div className="card card-custom" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Header del Chat */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid #e0e0e0' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-robot me-2" style={{ fontSize: '20px', color: '#1E6FFB' }}></i>
          <h5 className="mb-0" style={{ color: '#1E1E1E', fontWeight: '600' }}>
            Asistente Virtual Médico
          </h5>
        </div>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={handleReset}
          title="Reiniciar conversación"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      {/* Área de Mensajes */}
      <div 
        ref={chatContainerRef}
        className="flex-grow-1 p-3 overflow-auto"
        style={{ 
          backgroundColor: '#F5F6FA',
          maxHeight: '450px',
          minHeight: '450px'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 d-flex ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div
              className={`p-3 rounded-custom`}
              style={{
                maxWidth: '75%',
                backgroundColor: message.sender === 'user' ? '#1E6FFB' : '#ffffff',
                color: message.sender === 'user' ? '#ffffff' : '#1E1E1E',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            >
              {formatMessage(message.text)}
              <div 
                className="mt-1"
                style={{ 
                  fontSize: '11px', 
                  opacity: 0.7,
                  color: message.sender === 'user' ? 'rgba(255,255,255,0.8)' : '#999'
                }}
              >
                {message.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Botones de selección de médicos */}
        {conversationState === 'showing_specialty' && availableDoctors.length > 0 && (
          <div className="mb-3">
            <div className="d-flex flex-column gap-2">
              {availableDoctors.map((doctor) => (
                <button
                  key={doctor.id}
                  className="btn btn-outline-primary text-start"
                  onClick={() => handleSelectDoctor(doctor)}
                  style={{
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid #1E6FFB',
                    backgroundColor: '#fff'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Dr. {doctor.nombre} {doctor.apellido}</strong>
                      <br />
                      <small className="text-muted">
                        {doctor.diasSemana.join(', ')} | {doctor.horarioInicio} - {doctor.horarioFin}
                      </small>
                    </div>
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de fecha */}
        {conversationState === 'selecting_date' && selectedDoctor && (
          <div className="mb-3">
            <div className="card" style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <div className="card-body p-3">
                <label className="form-label fw-bold mb-2">Selecciona una fecha:</label>
                <input
                  type="date"
                  className="form-control mb-2"
                  min={(() => {
                    const hoy = new Date();
                    return hoy.toISOString().split('T')[0];
                  })()}
                  max={(() => {
                    const hoy = new Date();
                    hoy.setDate(hoy.getDate() + 30);
                    return hoy.toISOString().split('T')[0];
                  })()}
                  value={selectedDate}
                  onChange={(e) => handleSelectDate(e.target.value)}
                  disabled={loadingSlots}
                />
                {loadingSlots && (
                  <div className="text-center mt-2">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                )}
                <button
                  className="btn btn-sm btn-outline-secondary mt-2"
                  onClick={handleCancel}
                  disabled={loadingSlots}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Volver
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selector de hora */}
        {conversationState === 'selecting_time' && availableSlots.length > 0 && (
          <div className="mb-3">
            <div className="card" style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <div className="card-body p-3">
                <label className="form-label fw-bold mb-2">Selecciona un horario:</label>
                <div className="d-flex flex-wrap gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      className="btn btn-outline-primary"
                      onClick={() => handleSelectTime(slot)}
                      style={{
                        minWidth: '80px',
                        borderRadius: '6px'
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary mt-3"
                  onClick={handleCancel}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Volver
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmación */}
        {conversationState === 'confirming' && (
          <div className="mb-3">
            <div className="card" style={{ border: '1px solid #1E6FFB', borderRadius: '8px' }}>
              <div className="card-body p-3">
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success flex-grow-1"
                    onClick={handleConfirmAppointment}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Confirmar Turno
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {loading && (
          <div className="d-flex justify-content-start mb-3">
            <div
              className="p-3 rounded-custom"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Escribiendo...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensaje */}
      <div className="card-footer bg-white" style={{ borderTop: '1px solid #e0e0e0' }}>
        {!isPatient ? (
          <div className="text-center p-3">
            <div className="alert alert-warning mb-0" role="alert" style={{ fontSize: '14px' }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              El chatbot está disponible solo para pacientes. Por favor,{' '}
              <Link to="/acceder" className="text-decoration-none fw-bold" style={{ color: '#1E6FFB' }}>
                inicia sesión
              </Link>
              {' '}con una cuenta de paciente para continuar.
            </div>
          </div>
        ) : (
          <>
            {conversationState === 'waiting_symptoms' || conversationState === 'showing_specialty' ? (
              <form onSubmit={handleSendMessage}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    placeholder={conversationState === 'waiting_symptoms' ? "Escribe tus síntomas aquí..." : "Escribe tu respuesta aquí..."}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={loading}
                    style={{ border: 'none', boxShadow: 'none' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary-custom"
                    disabled={loading || !inputMessage.trim()}
                    style={{ borderRadius: '0 12px 12px 0' }}
                  >
                    <i className="bi bi-send-fill"></i>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-muted text-center p-2" style={{ fontSize: '12px' }}>
                <i className="bi bi-info-circle me-1"></i>
                {conversationState === 'selecting_date' && 'Selecciona una fecha arriba'}
                {conversationState === 'selecting_time' && 'Selecciona un horario arriba'}
                {conversationState === 'confirming' && 'Confirma tu turno arriba'}
              </div>
            )}
            <small className="text-muted" style={{ fontSize: '11px', display: 'block', marginTop: '5px' }}>
              <i className="bi bi-shield-check me-1"></i>
              Este asistente NO diagnostica ni receta medicamentos. Busca atención profesional para condiciones graves.
            </small>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;

