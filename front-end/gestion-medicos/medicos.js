// Capturar el formulario de registro
const registroForm = document.querySelector(".formulario form");
registroForm.addEventListener("submit", function(event) {
  event.preventDefault(); // Evita que se recargue la página

  // Obtener valores
  const tipoDocumento = registroForm.querySelector("select").value;
  const numeroDocumento = registroForm.querySelector("input[placeholder='Número de documento']").value;
  const nombre = registroForm.querySelector("input[placeholder='Nombre completo']").value;
  const especialidad = registroForm.querySelector("input[placeholder='Especialidad']").value;
  const correo = registroForm.querySelector("input[placeholder='Correo electrónico']").value;
  const contrasena = registroForm.querySelector("input[placeholder='Contraseña']").value;

  tipoDocumento.value = 0;
  numeroDocumento.value = "";
  nombre.value = "";
  especialidad.value = "";
  correo.value = "";
  contrasena.value = "";

  alert("Registro exitoso ✅");
});
