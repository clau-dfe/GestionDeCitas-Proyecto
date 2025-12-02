// Seleccionar el formulario
const registroForm = document.querySelector(".formulario form");

// Crear un contenedor para mostrar el mensaje de éxito
const mensajeExito = document.createElement("div");
mensajeExito.style.display = "none";
mensajeExito.style.marginTop = "20px";
mensajeExito.style.textAlign = "center";
mensajeExito.style.backgroundColor = "#dff0d8";
mensajeExito.style.color = "#3c763d";
mensajeExito.style.padding = "15px";
mensajeExito.style.borderRadius = "8px";
mensajeExito.style.fontWeight = "bold";

// Insertar el contenedor al final del formulario
registroForm.appendChild(mensajeExito);

// Evento de envío del formulario (Registro de Paciente)
registroForm.addEventListener("submit", function(event) {
  event.preventDefault(); // Evita recargar la página

  // Obtener valores
  const tipoDocumento = registroForm.querySelector("select").value;
  const numeroDocumento = registroForm.querySelector("input[placeholder='Número de documento']").value.trim();
  const nombre = registroForm.querySelector("input[placeholder='Nombre completo']").value.trim();
  const correo = registroForm.querySelector("input[placeholder='Correo electrónico']").value.trim();
  const telefono = registroForm.querySelector("input[placeholder='Teléfono']").value.trim();

  // Validar que los campos requeridos estén llenos
  if (tipoDocumento && numeroDocumento && nombre && correo) {
    // Mostrar mensaje con datos
    mensajeExito.innerHTML = `
      <p>Registro creado exitosamente ✅</p>
      <p>Nombre: ${nombre}</p>
      <p>Correo: ${correo}</p>
      <p>Teléfono: ${telefono ? telefono : "No registrado"}</p>
    `;
    mensajeExito.style.display = "block";

    // Limpiar formulario
    registroForm.reset();
  } else {
    alert("Por favor completa todos los campos requeridos.");
  }
});

// --- BOTÓN DE INICIO DE SESIÓN ---
const botonLogin = registroForm.querySelector("button[type='button']");
botonLogin.addEventListener("click", function() {
  // Aquí puedes redirigir a otra página de login
  // Ejemplo: window.location.href = "login.html";

  // O mostrar un mensaje simulado
  alert("Redirigiendo a la página de inicio de sesión...");
});


