// script.js

let recognition;
let isRecognizing = false;
let interimTranscript = ""; // Almacena el texto en tiempo real
let step = 0; // Para rastrear el paso actual en el flujo de conversación
let userName = ""; // Para almacenar el nombre del usuario
const availableConsultations = ["Medicina General", "Oftalmología", "Psicología"]; // Tipos de consultas disponibles

// Inicializa el reconocimiento de voz
function initializeRecognition() {
  try {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-ES';
    recognition.interimResults = true; // Habilitar resultados intermedios para el texto en tiempo real

    recognition.onstart = () => {
      console.log("Reconocimiento de voz iniciado");
      document.getElementById("output").textContent = "Puedes hablar ahora...";
      document.getElementById("liveText").textContent = ""; // Limpia el texto en tiempo real
    };

    recognition.onresult = (event) => {
      interimTranscript = ""; // Restablece el texto interino en cada actualización

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          interimTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      document.getElementById("liveText").textContent = interimTranscript;
    };

    recognition.onend = () => {
      console.log("Reconocimiento de voz detenido");
      isRecognizing = false;
      document.getElementById("output").textContent = "Presiona el botón para hablar.";

      if (interimTranscript) {
        processInput(interimTranscript.trim()); // Procesar el texto completo capturado
      }
    };

    recognition.onerror = (event) => {
      console.error("Error en el reconocimiento de voz: ", event.error);
      document.getElementById("output").textContent = "Error de reconocimiento. Intenta de nuevo.";
      isRecognizing = false;
    };
  } catch (error) {
    console.error("API de reconocimiento de voz no soportada o no disponible", error);
    document.getElementById("output").textContent = "API de reconocimiento no soportada en este navegador.";
  }
}

// Alterna el reconocimiento de voz al presionar el botón
function toggleRecognition() {
  if (isRecognizing) {
    recognition.stop();
  } else {
    recognition.start();
    isRecognizing = true;
  }
}

// Procesa el texto de voz y responde
function processInput(input) {
  let response = "";

  // Flujos de conversación
  if (step === 0) {
    response = "Hola, bienvenido al sistema de reservas de citas médicas. ¿En qué puedo ayudarte hoy?";
    step++;
  } else if (step === 1 && input.includes("reserva")) {
    response = `Perfecto. Por favor, indícame el tipo de consulta que deseas realizar. Puedes elegir entre: ${availableConsultations.join(", ")}.`;
    step++;
  } else if (step === 2) {
    const chosenConsultation = availableConsultations.find(consultation => input.toLowerCase().includes(consultation.toLowerCase()));
    if (chosenConsultation) {
      response = `Has elegido ${chosenConsultation}. ¿Qué día te gustaría programar la cita? Puedes decirme una fecha o si prefieres, puedo ofrecerte las próximas tres disponibles.`;
      step++;
    } else {
      response = "No entendí, ¿puedes repetir el tipo de consulta?";
    }
  } else if (step === 3) {
    response = "Tengo disponibles: 1) 5 de noviembre a las 10:00 AM, 2) 6 de noviembre a las 11:30 AM, 3) 8 de noviembre a las 3:00 PM. ¿Cuál prefieres?";
    step++;
  } else if (step === 4) {
    response = `Has elegido el ${input}. ¿Es correcto?`;
    step++;
  } else if (step === 5 && input.includes("sí")) {
    response = "Excelente. Necesitaré algunos datos para completar la reserva. Por favor, proporciona tu nombre completo.";
    step++;
  } else if (step === 6) {
    userName = input; // Guardar el nombre del usuario
    response = "Gracias. Ahora, por favor, indícame tu número de teléfono.";
    step++;
  } else if (step === 7) {
    // Guardar el número de teléfono y confirmar la cita
    response = "Perfecto. He registrado tu cita para el 6 de noviembre a las 11:30 AM. ¿Te gustaría recibir un recordatorio un día antes de la cita?";
    step++;
  } else if (step === 8 && input.includes("sí")) {
    response = "Listo, recibirás un recordatorio el 5 de noviembre. ¿Hay algo más en lo que pueda ayudarte hoy? Puedes decirme 'no' si has terminado.";
    step++;
  } else if (step === 9 && input.includes("no")) {
    response = `Gracias por usar nuestro sistema. Que tengas un buen día, ${userName}!`;
    step = 0; // Reiniciar el flujo
  } else {
    response = "No entendí completamente, pero estoy aquí para ayudarte.";
  }

  document.getElementById("output").textContent = `Asistente: ${response}`;
  speak(response);
}

// Función para hacer que el asistente hable
function speak(text) {
  if (!window.speechSynthesis) {
    console.error("API de síntesis de voz no soportada en este navegador.");
    document.getElementById("output").textContent += "\nAPI de síntesis de voz no soportada.";
    return;
  }

  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';

  utterance.onstart = () => {
    console.log("Sintetizador de voz iniciado.");
  };

  utterance.onend = () => {
    console.log("Sintetizador de voz finalizado.");
  };

  utterance.onerror = (error) => {
    console.error("Error en el sintetizador de voz: ", error);
    document.getElementById("output").textContent += "\nError al reproducir la respuesta.";
  };

  window.speechSynthesis.speak(utterance);
}

// Inicializar reconocimiento de voz al cargar la página
initializeRecognition();
