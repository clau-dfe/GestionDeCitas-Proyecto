document.addEventListener("DOMContentLoaded", () => {
  // Capturamos el formulario y el contenedor del mensaje
  const registroForm = document.getElementById("registroForm");
  const mensajeExito = document.getElementById("mensajeExito");

  if (registroForm) {
    registroForm.addEventListener("submit", function(event) {
      event.preventDefault(); // Evita recargar la página

      // Mostrar el anuncio solo cuando se crea el registro
      mensajeExito.style.display = "block";

      // Limpiar el formulario
      registroForm.reset();

      // Ocultar el anuncio automáticamente después de 4 segundos
      setTimeout(() => {
        mensajeExito.style.display = "none";
      }, 4000);
    });
  }
});
