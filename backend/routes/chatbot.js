import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Función para detectar urgencias médicas (fallback si Gemini falla)
const detectUrgency = (text) => {
  const lowerText = text.toLowerCase();
  const urgencyKeywords = [
    'dolor pecho', 'opresión pecho', 'dificultad respirar', 'sangrado intenso',
    'dolor brazo izquierdo', 'presión en el pecho', 'falta de aire',
    'sensación de ahogo', 'sangrado abundante', 'pérdida de conocimiento',
    'convulsiones', 'accidente grave', 'infarto', 'ataque cardiaco'
  ];
  
  return urgencyKeywords.some(keyword => lowerText.includes(keyword));
};

// Función para detectar si es un saludo o mensaje casual
const isCasualMessage = (message) => {
  const lowerMessage = message.toLowerCase().trim();
  const casualKeywords = ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'buen día', 'hey', 'hi', 'hello', 'como estas', 'qué tal', 'gracias', 'ok', 'okay', 'sí', 'si', 'no', 'asd', 'test', 'prueba'];
  return casualKeywords.some(keyword => lowerMessage === keyword || lowerMessage.startsWith(keyword + ' ') || lowerMessage.endsWith(' ' + keyword));
};

// Función para crear prompt conversacional para Gemini
const createConversationalPrompt = (message, especialidades) => {
  const especialidadesList = especialidades.map(e => `- ${e.nombre}`).join('\n');
  
  return `Eres María, una secretaria virtual muy amable y profesional de una clínica médica. Tu personalidad es cálida, empática y conversacional, como si fueras una secretaria real hablando con un paciente.

ESPECIALIDADES DISPONIBLES:
${especialidadesList}

TU ESTILO DE COMUNICACIÓN:
- Sé natural, amigable y conversacional
- Responde saludos de forma cálida (ej: "¡Hola! ¿En qué puedo ayudarte hoy?")
- Si el paciente menciona síntomas, analízalos y recomienda la especialidad adecuada
- Si no hay síntomas claros, pregunta amablemente qué necesita
- Sé empática y profesional, pero no robótica
- Usa un tono cercano pero respetuoso

MENSAJE DEL PACIENTE: "${message}"

Responde de forma natural y conversacional. Si detectas síntomas, menciona la especialidad recomendada de forma amigable. Si es un saludo o mensaje casual, responde de forma cálida y pregunta cómo puedes ayudar.`;
};

// Función para crear prompt estructurado para Gemini (cuando hay síntomas claros)
const createPrompt = (message, especialidades) => {
  const especialidadesList = especialidades.map(e => `- ${e.nombre}`).join('\n');
  
  return `Eres una secretaria virtual amable de una clínica médica. Analiza los síntomas y recomienda la especialidad correcta.

ESPECIALIDADES DISPONIBLES:
${especialidadesList}

SÍNTOMAS: "${message}"

Responde SOLO con el nombre exacto de la especialidad, "URGENCIA" si es urgente, o "GENERAL" si no puedes determinar. Solo el nombre, sin explicaciones.`;
};

// Función de fallback con palabras clave
const detectSpecialtyByKeywords = (message, especialidades) => {
  const lowerMessage = message.toLowerCase();
  
  const keywordMapping = {
    'Gastroenterología': ['panza', 'estómago', 'estomacal', 'digestivo', 'náusea', 'náuseas', 'vómito', 'vómitos', 'diarrea', 'acidez', 'abdominal', 'barriga', 'cólico', 'cólicos', 'reflujo', 'gases', 'estreñimiento', 'indigestión', 'dolor de panza', 'dolor panza'],
    'Oftalmología': ['ojo', 'ojos', 'visión', 'visual', 'oftalm', 'ver', 'ceguera', 'borrosa', 'borroso', 'dolor ojos', 'dolor de ojos', 'conjuntivitis', 'lagrimeo', 'puntos flotantes', 'fotofobia', 'visión borrosa', 'problemas vista', 'problemas de vista'],
    'Cardiología': ['corazón', 'cardiaco', 'cardíaco', 'palpitaciones', 'taquicardia', 'presión arterial', 'pecho', 'hipertensión', 'hipertension', 'hipotensión', 'mareos cardiacos', 'ritmo cardíaco', 'ritmo cardiaco', 'presión alta', 'presión baja', 'cardiac', 'cardiaco'],
    'Dermatología': ['piel', 'dermat', 'sarpullido', 'erupción', 'picazón', 'roncha', 'ronchas', 'mancha piel', 'eczema', 'dermatitis', 'acné', 'manchas', 'irritación'],
    'Neurología': ['cabeza', 'migraña', 'cefalea', 'neurológico', 'mareo', 'mareos', 'vértigo', 'dolor cabeza', 'dolor de cabeza', 'temblores', 'adormecimiento', 'hormigueo', 'dolor de cabeza', 'dolor cabeza']
  };
  
  // Buscar coincidencias
  for (const [esp, keywords] of Object.entries(keywordMapping)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      const especialidadEncontrada = especialidades.find(e => e.nombre === esp);
      if (especialidadEncontrada) {
        return especialidadEncontrada.nombre;
      }
    }
  }
  
  return null;
};

// POST /api/chatbot - Analizar síntomas y recomendar especialidad
router.post('/', verifyToken, requireRole('paciente'), async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const userMessage = message.trim().toLowerCase();
    const originalMessage = message.trim();

    // Obtener especialidades disponibles de la BD (necesario para todos los flujos)
    const especialidades = await prisma.especialidad.findMany({
      orderBy: { nombre: 'asc' }
    });

    if (especialidades.length === 0) {
      return res.status(500).json({ error: 'No hay especialidades disponibles en el sistema' });
    }

    // Detectar si es un mensaje casual (saludo, etc.)
    const isCasual = isCasualMessage(originalMessage);
    
    // Si es mensaje casual, usar Gemini para respuesta conversacional
    if (isCasual) {
      try {
        const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        let conversationalResponse = null;
        
        for (const modelName of modelsToTry) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = createConversationalPrompt(originalMessage, especialidades);
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            conversationalResponse = response.text().trim();
            
            console.log(`💬 Respuesta conversacional de ${modelName}:`, conversationalResponse);
            break;
          } catch (modelError) {
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
              throw modelError;
            }
            continue;
          }
        }
        
        if (conversationalResponse) {
          return res.json({
            response: conversationalResponse,
            specialty: null,
            specialtyId: null,
            doctors: [],
            isUrgency: false
          });
        }
      } catch (error) {
        console.error('Error en respuesta conversacional:', error);
        // Continuar con el flujo normal si falla
      }
    }

    // Verificar urgencias primero (fallback rápido)
    if (detectUrgency(userMessage)) {
      return res.json({
        response: '⚠️ **URGENCIA MÉDICA**: Por favor, acuda inmediatamente a emergencias o llame al 107. Estos síntomas podrían indicar una condición grave que requiere atención inmediata. No puedo ayudarte con urgencias médicas. Busca atención profesional inmediata.',
        specialty: null,
        specialtyId: null,
        doctors: [],
        isUrgency: true
      });
    }

    let specialtyName = null;
    let isUrgency = false;

    // Intentar usar Gemini API
    try {
      // Intentar con gemini-2.5-flash primero, si falla usar gemini-1.5-flash
      const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
      let rawResponse = null;
      let modelUsed = null;
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`🔄 Intentando con modelo: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = createPrompt(message, especialidades);
          
          console.log('📤 Enviando a Gemini:', { message, especialidades: especialidades.map(e => e.nombre), model: modelName });
          
          const result = await model.generateContent(prompt);
          const response = await result.response;
          rawResponse = response.text().trim();
          modelUsed = modelName;
          
          console.log(`✅ Respuesta recibida de ${modelName}:`, rawResponse);
          break; // Si funciona, salir del loop
        } catch (modelError) {
          console.log(`❌ Modelo ${modelName} no disponible:`, modelError.message);
          if (modelName === modelsToTry[modelsToTry.length - 1]) {
            // Si es el último modelo, lanzar el error
            throw modelError;
          }
          // Continuar con el siguiente modelo
          continue;
        }
      }
      
      if (!rawResponse) {
        throw new Error('No se pudo obtener respuesta de ningún modelo de Gemini');
      }

      // Limpiar respuesta de Gemini
      specialtyName = rawResponse
        .replace(/['"]/g, '') // Quitar comillas
        .replace(/\n/g, ' ') // Quitar saltos de línea
        .trim();

      // Verificar si es urgencia
      if (specialtyName.toUpperCase().includes('URGENCIA')) {
        isUrgency = true;
        specialtyName = null;
        console.log('🚨 Urgencia detectada');
      } else if (specialtyName.toUpperCase().includes('GENERAL')) {
        specialtyName = null;
        console.log('⚠️ Respuesta GENERAL de Gemini');
      } else {
        // Buscar especialidad en la respuesta (búsqueda flexible)
        let especialidadEncontrada = null;
        
        // Primero búsqueda exacta
        especialidadEncontrada = especialidades.find(
          e => e.nombre.toLowerCase() === specialtyName.toLowerCase()
        );
        
        // Si no encuentra, búsqueda parcial
        if (!especialidadEncontrada) {
          especialidadEncontrada = especialidades.find(
            e => specialtyName.toLowerCase().includes(e.nombre.toLowerCase()) ||
                 e.nombre.toLowerCase().includes(specialtyName.toLowerCase())
          );
        }
        
        // Si aún no encuentra, buscar cualquier mención de especialidad en el texto
        if (!especialidadEncontrada) {
          for (const esp of especialidades) {
            if (rawResponse.toLowerCase().includes(esp.nombre.toLowerCase())) {
              especialidadEncontrada = esp;
              break;
            }
          }
        }
        
        if (especialidadEncontrada) {
          specialtyName = especialidadEncontrada.nombre;
          console.log('✅ Especialidad detectada:', specialtyName);
        } else {
          console.log('⚠️ Especialidad no encontrada en respuesta de Gemini:', specialtyName);
          specialtyName = null;
        }
      }
    } catch (geminiError) {
      console.error('❌ Error al usar Gemini API:', geminiError);
      console.error('Error details:', geminiError.message);
      specialtyName = null;
    }

    // Si Gemini no funcionó, usar fallback con palabras clave
    if (!specialtyName && !isUrgency) {
      console.log('🔄 Usando fallback de palabras clave');
      specialtyName = detectSpecialtyByKeywords(message, especialidades);
      if (specialtyName) {
        console.log('✅ Especialidad detectada por fallback:', specialtyName);
      }
    }

    // Si no se pudo determinar especialidad, usar Gemini para respuesta conversacional
    if (!specialtyName && !isUrgency) {
      try {
        const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        let conversationalResponse = null;
        
        for (const modelName of modelsToTry) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = createConversationalPrompt(originalMessage, especialidades);
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            conversationalResponse = response.text().trim();
            
            console.log(`💬 Respuesta conversacional de ${modelName}:`, conversationalResponse);
            break;
          } catch (modelError) {
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
              throw modelError;
            }
            continue;
          }
        }
        
        if (conversationalResponse) {
          return res.json({
            response: conversationalResponse,
            specialty: null,
            specialtyId: null,
            doctors: [],
            isUrgency: false
          });
        }
      } catch (error) {
        console.error('Error en respuesta conversacional:', error);
        // Fallback a respuestas predefinidas si Gemini falla
      }
      
      // Fallback: respuestas más variadas y naturales
      const responses = [
        'Entiendo. Para poder ayudarte mejor, ¿podrías contarme qué síntomas estás teniendo? Por ejemplo: ¿dónde sientes el malestar?',
        'Gracias por contactarnos. Para encontrar el especialista adecuado, necesito saber más sobre lo que estás sintiendo. ¿Qué te está pasando?',
        'Comprendo. Para derivarte al médico correcto, sería útil que me cuentes qué síntomas tienes. ¿Qué tipo de molestia estás experimentando?'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      return res.json({
        response: randomResponse,
        specialty: null,
        specialtyId: null,
        doctors: [],
        isUrgency: false
      });
    }

    // Si es urgencia, ya respondimos arriba
    if (isUrgency) {
      return res.json({
        response: '⚠️ **URGENCIA MÉDICA**: Por favor, acuda inmediatamente a emergencias o llame al 107. Estos síntomas podrían indicar una condición grave que requiere atención inmediata. No puedo ayudarte con urgencias médicas. Busca atención profesional inmediata.',
        specialty: null,
        specialtyId: null,
        doctors: [],
        isUrgency: true
      });
    }

    // Buscar la especialidad en la BD
    const especialidad = especialidades.find(
      e => e.nombre.toLowerCase() === specialtyName.toLowerCase()
    );

    if (!especialidad) {
      return res.json({
        response: 'No pude determinar una especialidad específica para tus síntomas. Te recomiendo consultar con medicina general o contactar directamente con la clínica.',
        specialty: null,
        specialtyId: null,
        doctors: [],
        isUrgency: false
      });
    }

    // Obtener médicos disponibles de esa especialidad
    const medicos = await prisma.medico.findMany({
      where: {
        especialidadId: especialidad.id
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        especialidad: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        user: {
          nombre: 'asc'
        }
      }
    });

    // Formatear médicos
    const medicosFormateados = medicos.map(medico => ({
      id: medico.id,
      userId: medico.userId,
      nombre: medico.user.nombre,
      apellido: medico.user.apellido,
      email: medico.user.email,
      especialidad: {
        id: medico.especialidad.id,
        nombre: medico.especialidad.nombre
      },
      horarioInicio: medico.horarioInicio,
      horarioFin: medico.horarioFin,
      diasSemana: medico.diasSemana.split(',').map(d => d.trim())
    }));

    // Crear mensaje de respuesta más conversacional
    const responses = [
      `Perfecto, según lo que me comentas, te recomendaría consultar con **${especialidad.nombre}**.`,
      `Entiendo. Para estos síntomas, lo ideal sería que te atienda un especialista en **${especialidad.nombre}**.`,
      `Basado en lo que describes, te derivaría a **${especialidad.nombre}**.`
    ];
    
    let responseMessage = responses[Math.floor(Math.random() * responses.length)] + '\n\n';

    if (medicosFormateados.length > 0) {
      responseMessage += `Tenemos los siguientes profesionales disponibles:\n\n`;
      medicosFormateados.forEach((doctor, index) => {
        responseMessage += `${index + 1}. **Dr. ${doctor.nombre} ${doctor.apellido}**\n`;
        responseMessage += `   📅 Atiende: ${doctor.diasSemana.join(', ')} de ${doctor.horarioInicio} a ${doctor.horarioFin}\n\n`;
      });
      responseMessage += `¿Con cuál de estos médicos te gustaría agendar tu turno?`;
    } else {
      responseMessage += `Por el momento no tenemos médicos disponibles en esta especialidad. Te recomiendo que nos contactes directamente para coordinar una cita.`;
    }

    res.json({
      response: responseMessage,
      specialty: especialidad.nombre,
      specialtyId: especialidad.id,
      doctors: medicosFormateados,
      isUrgency: false
    });

  } catch (error) {
    console.error('Error en chatbot:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

