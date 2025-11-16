import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// PRINCIPIOS ÉTICOS - REGLAS DE DERIVACIÓN MÉDICA
// ============================================================================
const ethicalDerivationRules = {
  URGENCIAS: {
    síntomas: [
      'dolor pecho', 'opresión pecho', 'dificultad respirar', 'sangrado intenso', 
      'dolor brazo izquierdo', 'dolor de pecho', 'presión en el pecho',
      'falta de aire', 'sensación de ahogo', 'sangrado abundante',
      'pérdida de conocimiento', 'convulsiones', 'accidente grave'
    ],
    mensaje: '⚠️ **URGENCIA MÉDICA**: Por favor, acuda inmediatamente a emergencias o llame al 107. Estos síntomas podrían indicar una condición grave que requiere atención inmediata. No puedo ayudarte con urgencias médicas. Busca atención profesional inmediata.',
    prioridad: 'ALTA'
  },
  Cardiología: {
    síntomas: [
      'palpitaciones', 'taquicardia', 'presión arterial', 'mareos cardiacos',
      'dolor en el pecho leve', 'ritmo cardíaco irregular', 'corazón acelerado',
      'hipertensión', 'baja presión', 'mareo al levantarse'
    ],
    mensaje: 'Basado en tus síntomas cardiovasculares, te recomiendo consultar con **Cardiología**.',
    prioridad: 'MEDIA'
  },
  Gastroenterología: {
    síntomas: [
      'dolor estómago', 'náuseas', 'vómitos', 'diarrea', 'acidez', 'dolor abdominal',
      'malestar estomacal', 'indigestión', 'reflujo', 'gases', 'estreñimiento',
      'cólicos', 'dolor de barriga'
    ],
    mensaje: 'Para estos síntomas digestivos, te derivaría a **Gastroenterología**.',
    prioridad: 'MEDIA'
  },
  Oftalmología: {
    síntomas: [
      'problemas vista', 'visión borrosa', 'dolor ojos', 'ojos rojos', 'ceguera temporal',
      'ojos secos', 'lagrimeo', 'conjuntivitis', 'difultad para ver', 'cambio en la visión',
      'puntos flotantes', 'fotofobia'
    ],
    mensaje: 'Para síntomas relacionados con la visión, te recomiendo **Oftalmología**.',
    prioridad: 'MEDIA'
  },
  Pediatría: {
    síntomas: [
      'fiebre niño', 'niño', 'bebé', 'vacunas', 'control niño', 'infantil',
      'niña', 'niñas', 'niños', 'recién nacido', 'lactante', 'adolescente menor'
    ],
    mensaje: 'Para atención infantil, la especialidad adecuada es **Pediatría**.',
    prioridad: 'MEDIA'
  },
  Dermatología: {
    síntomas: [
      'sarpullido', 'erupción', 'piel irritada', 'manchas en la piel', 'picazón',
      'eczema', 'dermatitis', 'acné', 'alergia en la piel', 'ronchas'
    ],
    mensaje: 'Para síntomas relacionados con la piel, te recomiendo **Dermatología**.',
    prioridad: 'MEDIA'
  },
  Neurología: {
    síntomas: [
      'dolor cabeza', 'migraña', 'mareos', 'vértigo', 'mareo constante',
      'cefalea', 'temblores', 'adormecimiento', 'hormigueo', 'pérdida de sensibilidad'
    ],
    mensaje: 'Para síntomas neurológicos, te recomiendo consultar con **Neurología**.',
    prioridad: 'MEDIA'
  }
};

// ============================================================================
// DATOS MOCK DE MÉDICOS - Preparados para backend
// ============================================================================
const mockDoctors = {
  'Cardiología': [
    { id: 1, nombre: 'Juan', apellido: 'Pérez', especialidad: 'Cardiología', horario: 'Lunes a Viernes 9:00-17:00', telefono: '+54 11 1234-5678' }
  ],
  'Gastroenterología': [
    { id: 2, nombre: 'Ana', apellido: 'López', especialidad: 'Gastroenterología', horario: 'Lunes a Jueves 8:00-16:00', telefono: '+54 11 2345-6789' }
  ],
  'Oftalmología': [
    { id: 3, nombre: 'Carlos', apellido: 'Gómez', especialidad: 'Oftalmología', horario: 'Martes a Viernes 10:00-18:00', telefono: '+54 11 3456-7890' }
  ],
  'Pediatría': [
    { id: 4, nombre: 'María', apellido: 'Rodríguez', especialidad: 'Pediatría', horario: 'Lunes a Viernes 8:00-15:00', telefono: '+54 11 4567-8901' }
  ],
  'Dermatología': [
    { id: 5, nombre: 'Roberto', apellido: 'Martínez', especialidad: 'Dermatología', horario: 'Miércoles a Viernes 9:00-17:00', telefono: '+54 11 5678-9012' }
  ],
  'Neurología': [
    { id: 6, nombre: 'Laura', apellido: 'Fernández', especialidad: 'Neurología', horario: 'Lunes a Jueves 10:00-18:00', telefono: '+54 11 6789-0123' }
  ]
};

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
  const { isAuthenticated } = useAuth();
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
  const [conversationState, setConversationState] = useState('waiting_symptoms'); // waiting_symptoms, showing_specialty, selecting_doctor
  const [detectedSpecialty, setDetectedSpecialty] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll automático a nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Función para detectar especialidad basada en síntomas (ÉTICA)
  const detectSpecialty = (text) => {
    const lowerText = text.toLowerCase();
    
    // Primero verificar urgencias
    const urgenciaSymptoms = ethicalDerivationRules.URGENCIAS.síntomas;
    if (urgenciaSymptoms.some(symptom => lowerText.includes(symptom))) {
      return 'URGENCIAS';
    }

    // Luego verificar otras especialidades
    for (const [specialty, rule] of Object.entries(ethicalDerivationRules)) {
      if (specialty === 'URGENCIAS') continue;
      if (rule.síntomas.some(symptom => lowerText.includes(symptom))) {
        return specialty;
      }
    }

    return null;
  };

  // Función para obtener médicos disponibles (Mock - preparado para backend)
  const getAvailableDoctors = async (specialty) => {
    // Simulación: cuando el backend esté listo, usar:
    // const response = await api.get(`/doctors?specialty=${specialty}`);
    // return response.data;
    
    // Por ahora retornamos datos mock
    return mockDoctors[specialty] || [];
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Simular delay de procesamiento
    setTimeout(async () => {
      let botResponse = '';

      if (conversationState === 'waiting_symptoms') {
        const specialty = detectSpecialty(inputMessage);

        if (specialty === 'URGENCIAS') {
          botResponse = ethicalDerivationRules.URGENCIAS.mensaje;
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: botResponse,
            sender: 'bot',
            timestamp: new Date()
          }]);
          setLoading(false);
          return;
        }

        if (specialty) {
          setDetectedSpecialty(specialty);
          const doctors = await getAvailableDoctors(specialty);
          setAvailableDoctors(doctors);

          botResponse = `${ethicalDerivationRules[specialty].mensaje}\n\n`;
          
          if (doctors.length > 0) {
            botResponse += `**Médicos disponibles en ${specialty}:**\n\n`;
            doctors.forEach((doctor, index) => {
              botResponse += `${index + 1}. **Dr. ${doctor.nombre} ${doctor.apellido}**\n`;
              botResponse += `   📅 ${doctor.horario}\n`;
              botResponse += `   📞 ${doctor.telefono}\n\n`;
            });
            botResponse += `¿Te gustaría agendar un turno con alguno de estos profesionales?`;
          } else {
            botResponse += `Por el momento no hay médicos disponibles en esta especialidad. Te recomiendo contactarnos para coordinar una cita.`;
          }

          setConversationState('showing_specialty');
        } else {
          botResponse = `Entiendo. Para poder ayudarte mejor, ¿podrías describir con más detalle tus síntomas? Por ejemplo: dolor, localización, intensidad, duración, etc.\n\nRecuerda: Si tienes síntomas graves, acude inmediatamente a urgencias.`;
        }
      } else if (conversationState === 'showing_specialty') {
        const lowerText = inputMessage.toLowerCase();
        if (lowerText.includes('sí') || lowerText.includes('si') || lowerText.includes('agendar') || lowerText.includes('turno')) {
          if (!isAuthenticated) {
            botResponse = `Para agendar un turno, necesitas tener una cuenta. Por favor, regístrate o inicia sesión para continuar.`;
            setConversationState('waiting_symptoms');
          } else {
            botResponse = `¡Perfecto! Para agendar tu turno, por favor visita tu Dashboard o contacta directamente con el profesional seleccionado.\n\n¿Hay algo más en lo que pueda ayudarte?`;
            setConversationState('waiting_symptoms');
          }
        } else {
          botResponse = `Entiendo. Si necesitas algo más, por favor describe tus síntomas nuevamente.`;
          setConversationState('waiting_symptoms');
          setDetectedSpecialty(null);
          setAvailableDoctors([]);
        }
      }

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);

      setLoading(false);
    }, 1000);
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
        <form onSubmit={handleSendMessage}>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-custom"
              placeholder="Escribe tus síntomas aquí..."
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
        <small className="text-muted" style={{ fontSize: '11px', display: 'block', marginTop: '5px' }}>
          <i className="bi bi-shield-check me-1"></i>
          Este asistente NO diagnostica ni receta medicamentos. Busca atención profesional para condiciones graves.
        </small>
      </div>
    </div>
  );
};

export default Chatbot;

