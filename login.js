// Capturar el formulario de inicio de sesión
const loginForm = document.querySelector(".box-form");
loginForm.addEventListener("submit", (event)=>{
  event.preventDefault();

  const correoLogin = document.getElementById("email").value;
  const contrasenaLogin = document.getElementById("password").value;

  if (correoLogin === "admin@gmail.com" && contrasenaLogin === "1234") {
    alert("Inicio de sesión exitoso 🎉");
    window.location.href = "./menu/menuPrincipal.html"
    correoLogin.value = "";
    contrasenaLogin.value= "";
  } else {
    alert("Correo o contraseña incorrectos ❌");
  }
});