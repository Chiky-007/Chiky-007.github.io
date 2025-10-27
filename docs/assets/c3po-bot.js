function toggleC3POChat() {
    const chat = document.getElementById('c3po-chat');
    chat.style.display = (chat.style.display === 'flex') ? 'none' : 'flex';
}

function sendMessage() {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (text === "") return;

    const body = document.getElementById("chat-body");

    // Mensaje del usuario
    const userMsg = document.createElement("div");
    userMsg.className = "user-msg";
    userMsg.textContent = text;
    body.appendChild(userMsg);

    // Respuesta del asistente
    const reply = document.createElement("div");
    reply.className = "c3po-msg";

    const lowerText = text.toLowerCase();
    
    // Lógica de respuestas
    if (lowerText.includes("cv") || lowerText.includes("hoja de vida")) {
        reply.innerHTML = '📁 Puedes ver el <a href="assets/cv-andrey-romero.pdf" target="_blank" style="color:#00faff;">CV aquí</a>.';
    } else if (lowerText.includes("linkedin")) {
        reply.innerHTML = '🔗 Aquí tienes mi <a href="https://www.linkedin.com/in/andreycamiloromero/" target="_blank" style="color:#00faff;">perfil de LinkedIn</a>.';
    } else if (lowerText.includes("contacto") || lowerText.includes("email")) {
        reply.innerHTML = '📞 Puedes escribirme a <strong>andreycamilo@gmail.com</strong> o al +57 324 790 2352.';
    } else if (lowerText.includes("hola") || lowerText.includes("buenas") || lowerText.includes("saludos")) {
        reply.textContent = "¡Saludos, humano! Soy C-3PO, tu asistente protocolario. ¿En qué puedo ayudarte?";
    } else {
        reply.textContent = "Lo siento, mi programación conversacional básica solo está entrenada para proveer enlaces a mi CV, LinkedIn o información de contacto.";
    }

    body.appendChild(reply);
    input.value = "";
    // Desplazar hacia abajo
    body.scrollTop = body.scrollHeight; 
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("⭐ C-3PO Asistente listo para servir.");
});