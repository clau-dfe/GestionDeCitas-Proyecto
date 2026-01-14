//Datos locales de especialistas
const documentos = [
    { nombre: "Cédula de ciudadanía" },
    { nombre: "Cédula de extranjería" },
    { nombre: "Pasaporte"}
];

// Cargar listas en los select
const documentSelect = document.getElementById("documento");

// Cargar listas en los select
documentos.forEach((tipo, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = tipo.nombre;
    documentSelect.appendChild(option);
});

// Crear cita
document.getElementById("crearCita").addEventListener("click", (e) => {
    e.preventDefault();
    const documentIndex = documentSelect.value;
    const numeroDocumento = document.getElementById("nDocumento").value;
    const nombreDelPaciente = document.getElementById("nombrePaciente").value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const msjError = document.getElementById("msj-error");

    if (!fecha || !hora) {
        alert("Debe llenar todos los campos.");
        return;}
        
    if (!/^[0-9]+$/.test(numeroDocumento)) {
        msjError.textContent = "⚠️ Solo se permiten números";
    } else {
        msjError.textContent = ""; // limpia el mensaje si está correcto
    }

    const cita = {
        tipoDocumento: documentos[documentIndex],
        numeroDocumento,
        nombreDelPaciente,
        fecha,
        hora
    };

    console.log("Cita creada:", cita);

    // Guardar en LocalStorage
    let citasGuardadas = JSON.parse(localStorage.getItem("citas")) || [];
    citasGuardadas.push(cita);
    localStorage.setItem("citas", JSON.stringify(citasGuardadas));

    // Mensaje temporal
    const mensaje = document.getElementById("mensaje");
    mensaje.style.display = "block";
    setTimeout(() => mensaje.style.display = "none", 200000);

    // Limpiar formulario
    documentSelect.selectedIndex = 0;
    document.getElementById("nDocumento").value = "";
    document.getElementById("nombrePaciente").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("hora").value = "";
});