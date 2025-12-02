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