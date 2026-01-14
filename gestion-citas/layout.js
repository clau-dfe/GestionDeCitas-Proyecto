const btnListado = document.getElementById("btn-listado"); 
const btnAgendar = document.getElementById("btn-agendar");
const btnReprogramar = document.getElementById("btn-reprogramar");
const btnCancelar = document.getElementById("btn-cancelar");
const btnVolver = document.getElementById("btn-volver");

const capaListado = document.getElementById("listado-citas");
const capaAgendar = document.getElementById("agendar-citas");

btnListado.addEventListener("click", (e)=>{
    e.preventDefault();
    capaListado.style.display = "block";
    capaAgendar.style.display = "none";
})

btnAgendar.addEventListener("click", (e)=>{
    e.preventDefault();
    capaAgendar.style.display = "block";
    capaListado.style.display = "none";
})

btnReprogramar.addEventListener("click", (e)=>{
    e.preventDefault();
    capaListado.style.display = "block";
    capaAgendar.style.display = "none";
})


btnCancelar.addEventListener("click", (e)=>{
    e.preventDefault();
    capaListado.style.display = "block";
    capaAgendar.style.display = "none";
})

btnVolver.addEventListener("click", ()=>{
    window.location.href = "../menu/menuPrincipal.html"
})