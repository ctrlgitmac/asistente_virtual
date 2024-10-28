// script.js

let recognition;
let isRecognizing = false;
let interimTranscript = ""; // Almacena el texto en tiempo real

// Inicializa el reconocimiento de voz
function initializeRecognition() {
  try {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-ES';
    recognition.interimResults = true; // Habilitar resultados intermedios para el texto en tiempo real

    // Evento cuando empieza a escuchar
    recognition.onstart = () => {
      console.log("Reconocimiento de voz iniciado");
      document.getElementById("output").textContent = "Puedes hablar ahora...";
      document.getElementById("liveText").textContent = ""; // Limpia el texto en tiempo real
    };

    // Evento para recibir el resultado en tiempo real
    recognition.onresult = (event) => {
      interimTranscript = ""; // Restablece el texto interino en cada actualización

      // Concatenar todos los resultados parciales en tiempo real
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          interimTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Muestra el texto reconocido en tiempo real en la pantalla
      document.getElementById("liveText").textContent = interimTranscript;
    };

    // Evento cuando se detiene el reconocimiento
    recognition.onend = () => {
      console.log("Reconocimiento de voz detenido");
      isRecognizing = false;
      document.getElementById("output").textContent = "Presiona el botón para hablar.";

      // Procesar la última transcripción capturada como el comando completo
      if (interimTranscript) {
        processInput(interimTranscript.trim()); // Procesar el texto completo capturado
      }
    };

    // Evento en caso de error
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

  // Respuestas del asistente según palabras clave
  if (input.includes("reserva")) {
    response = "¿Para qué fecha deseas hacer la reserva?";
  } else if (input.includes("fecha")) {
    response = "Tu cita ha sido reservada para la fecha indicada.";
  } else {
    response = "No entendí completamente, pero estoy aquí para ayudarte.";
  }

  // Mostrar la respuesta en pantalla y hacer que el asistente hable
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

  // Detener cualquier síntesis en curso antes de hablar
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
