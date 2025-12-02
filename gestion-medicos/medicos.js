<script>
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

  // Mostrar en consola
  console.log("Registro de Médico:");
  console.log("Tipo de documento:", tipoDocumento);
  console.log("Número de documento:", numeroDocumento);
  console.log("Nombre:", nombre);
  console.log("Especialidad:", especialidad);
  console.log("Correo:", correo);
  console.log("Contraseña:", contrasena);

  alert("Registro exitoso ✅");
});

// Capturar el formulario de inicio de sesión
const loginForm = document.querySelectorAll(".formulario form")[1];
loginForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const correoLogin = loginForm.querySelector("input[placeholder='Correo electrónico']").value;
  const contrasenaLogin = loginForm.querySelector("input[placeholder='Contraseña']").value;

  console.log("Inicio de Sesión:");
  console.log("Correo:", correoLogin);
  console.log("Contraseña:", contrasenaLogin);

  // Validación simple
  if (correoLogin === "medico@ejemplo.com" && contrasenaLogin === "1234") {
    alert("Inicio de sesión exitoso 🎉");
  } else {
    alert("Correo o contraseña incorrectos ❌");
  }
});
</script>
