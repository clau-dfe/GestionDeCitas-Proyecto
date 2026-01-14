const btnPacientes = document.getElementById("btn-pacientes");
const btnEspecialistas = document.getElementById("btn-especialista");
const btnCitas = document.getElementById("btn-citas");

btnPacientes.addEventListener("click", (e)=>{
    e.preventDefault();
    window.location.href = "../gestion-pacientes/pacientes.html"
});

btnEspecialistas.addEventListener("click", ()=>{
    window.location.href = "../gestion-medicos/medicos.html"
});

btnCitas.addEventListener("click", ()=>{
    window.location.href = "../gestion-citas/citas.html"
});