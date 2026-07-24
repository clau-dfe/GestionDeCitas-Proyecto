// historial-medico-paciente.js
let pacienteId = null;
let citaId = null;
let datosFijosGuardados = false;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    pacienteId = urlParams.get('paciente');
    citaId = urlParams.get('cita');

    if (!pacienteId) {
        const datosPacienteDiv = document.getElementById('datosPaciente');
        if (datosPacienteDiv) {
            datosPacienteDiv.innerHTML = '<p style="color: red;">Error: Paciente no especificado.</p>';
        }
        return;
    }

    console.log('🔍 Inicializando historial para paciente:', pacienteId);
    if (citaId) {
        console.log('🔍 Atendiendo cita:', citaId);
    }

    cargarDatosPaciente();
    cargarHistorialCompleto();
    cargarConsultasAnteriores();

    if (citaId) {
        cargarDatosCita(citaId);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    const historialForm = document.getElementById('historialForm');
    if (historialForm) {
        historialForm.addEventListener('submit', guardarHistorial);
    }

    const hoy = new Date().toISOString().split('T')[0];
    const proximaCitaInput = document.getElementById('proximaCita');
    if (proximaCitaInput) {
        proximaCitaInput.min = hoy;
    }
    
    const fechaActualSpan = document.getElementById('fechaActual');
    if (fechaActualSpan) {
        fechaActualSpan.textContent = new Date().toLocaleDateString('es-ES');
    }
});

// ==================== CARGAR DATOS DEL PACIENTE ====================
async function cargarDatosPaciente() {
    try {
        console.log('🔍 Cargando datos del paciente:', pacienteId);
        const data = await fetchAPI(`/usuarios/${pacienteId}`);
        console.log('🔍 Respuesta datos paciente:', data);
        
        if (data.success && data.usuario) {
            const p = data.usuario;
            const nombrePaciente = document.getElementById('nombrePaciente');
            const emailPaciente = document.getElementById('emailPaciente');
            const telefonoPaciente = document.getElementById('telefonoPaciente');
            
            if (nombrePaciente) nombrePaciente.textContent = p.nombre;
            if (emailPaciente) emailPaciente.textContent = p.email;
            if (telefonoPaciente) telefonoPaciente.textContent = p.telefono || 'No registrado';
        }
    } catch (error) {
        console.error('❌ Error al cargar datos del paciente:', error);
    }
}

// ==================== CARGAR HISTORIAL COMPLETO ====================
async function cargarHistorialCompleto() {
    try {
        console.log('🔍 Cargando historial para paciente:', pacienteId);
        const data = await fetchAPI(`/historial/${pacienteId}`);
        console.log('🔍 Respuesta historial:', data);
        
        if (data.success && data.historial) {
            const h = data.historial;
            
            const fechaNacimientoInput = document.getElementById('fechaNacimiento');
            const edadInput = document.getElementById('edad');
            const direccionInput = document.getElementById('direccion');
            const ciudadInput = document.getElementById('ciudad');
            const ocupacionInput = document.getElementById('ocupacion');

            if (h.fechaNacimiento) {
                if (fechaNacimientoInput) {
                    fechaNacimientoInput.value = h.fechaNacimiento.split('T')[0];
                }
                datosFijosGuardados = true;
            }
            if (h.edad && edadInput) edadInput.value = h.edad;
            if (h.direccion && direccionInput) direccionInput.value = h.direccion;
            if (h.ciudad && ciudadInput) ciudadInput.value = h.ciudad;
            if (h.ocupacion && ocupacionInput) ocupacionInput.value = h.ocupacion;

            const edadPaciente = document.getElementById('edadPaciente');
            const direccionPaciente = document.getElementById('direccionPaciente');
            const ciudadPaciente = document.getElementById('ciudadPaciente');
            const ocupacionPaciente = document.getElementById('ocupacionPaciente');

            if (edadPaciente) edadPaciente.textContent = h.edad || 'No registrada';
            if (direccionPaciente) direccionPaciente.textContent = h.direccion || 'No registrada';
            if (ciudadPaciente) ciudadPaciente.textContent = h.ciudad || 'No registrada';
            if (ocupacionPaciente) ocupacionPaciente.textContent = h.ocupacion || 'No registrada';

            // Si tiene datos fijos, deshabilitar campos
            if (datosFijosGuardados) {
                if (fechaNacimientoInput) {
                    fechaNacimientoInput.disabled = true;
                    fechaNacimientoInput.style.background = '#f0f0f0';
                }
                if (edadInput) {
                    edadInput.disabled = true;
                    edadInput.style.background = '#f0f0f0';
                }
                if (direccionInput) {
                    direccionInput.disabled = true;
                    direccionInput.style.background = '#f0f0f0';
                }
                if (ciudadInput) {
                    ciudadInput.disabled = true;
                    ciudadInput.style.background = '#f0f0f0';
                }
                if (ocupacionInput) {
                    ocupacionInput.disabled = true;
                    ocupacionInput.style.background = '#f0f0f0';
                }
            }
        }
    } catch (error) {
        console.error('❌ Error al cargar historial:', error);
    }
}

// ==================== CARGAR DATOS DE LA CITA ====================
async function cargarDatosCita(citaId) {
    try {
        console.log('🔍 Cargando datos de la cita:', citaId);
        const data = await fetchAPI(`/citas/${citaId}`);
        console.log('🔍 Respuesta cita:', data);
        
        if (data.success && data.data) {
            const cita = data.data;
            const motivoInput = document.getElementById('motivo');
            if (motivoInput) {
                motivoInput.value = cita.motivo || '';
            }
            const tituloConsulta = document.querySelector('#historialForm h3');
            if (tituloConsulta) {
                tituloConsulta.innerHTML = `
                    <i class="fas fa-notes-medical"></i> Registro de Consulta - Atendiendo cita del ${new Date(cita.fecha).toLocaleDateString('es-ES')}
                `;
            }
        }
    } catch (error) {
        console.error('❌ Error al cargar datos de la cita:', error);
    }
}

// ==================== CARGAR CONSULTAS ANTERIORES ====================
async function cargarConsultasAnteriores() {
    const container = document.getElementById('consultasAnteriores');
    if (!container) return;
    
    container.innerHTML = '<p style="color: var(--text-light);">Cargando consultas anteriores...</p>';

    try {
        const data = await fetchAPI(`/historial/${pacienteId}`);
        if (data.success && data.historial && data.historial.consultasPrevias) {
            const consultas = data.historial.consultasPrevias;
            if (consultas.length === 0) {
                container.innerHTML = '<p style="color: var(--text-light);">No hay consultas previas registradas.</p>';
                return;
            }

            let html = '';
            consultas.forEach((c, index) => {
                const fecha = c.fecha ? new Date(c.fecha).toLocaleDateString('es-ES') : 'Fecha no disponible';
                html += `
                    <div style="border: 1px solid #e2e8f0; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 5px solid var(--pastel-medium); background: white;">
                        <h4 style="margin: 0 0 8px 0;">Consulta ${index + 1} - ${fecha}</h4>
                        <p><strong>Motivo:</strong> ${c.motivo || 'No especificado'}</p>
                        ${c.diagnostico ? `<p><strong>Diagnóstico:</strong> ${c.diagnostico}</p>` : ''}
                        ${c.tratamiento ? `<p><strong>Tratamiento:</strong> ${c.tratamiento}</p>` : ''}
                        ${c.observaciones ? `<p><strong>Observaciones:</strong> ${c.observaciones}</p>` : ''}
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p style="color: var(--text-light);">No hay consultas previas.</p>';
        }
    } catch (error) {
        console.error('❌ Error al cargar consultas:', error);
        container.innerHTML = '<p style="color: red;">Error al cargar consultas.</p>';
    }
}

// ==================== GUARDAR HISTORIAL ====================
async function guardarHistorial(event) {
    event.preventDefault();

    console.log('🔍 Guardando historial...');

    // Obtener valores de los campos con validación de existencia
    const getValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value : '';
    };

    const getValueTrim = (id) => {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    };

    const fechaNacimiento = getValue('fechaNacimiento') || null;
    const edad = getValue('edad') || null;
    const direccion = getValue('direccion');
    const ciudad = getValue('ciudad');
    const ocupacion = getValue('ocupacion');
    const motivo = getValueTrim('motivo');
    const alergias = getValueTrim('alergias');
    const enfermedades = getValueTrim('enfermedades');
    const medicamentos = getValueTrim('medicamentos');
    const cirugias = getValueTrim('cirugias');
    const examenFisico = getValueTrim('examenFisico');
    const diagnostico = getValueTrim('diagnostico');
    const tratamiento = getValueTrim('tratamiento');
    const proximaCita = getValue('proximaCita') || null;
    const observaciones = getValueTrim('observaciones');

    console.log('📤 Datos a enviar:', {
        pacienteId,
        fechaNacimiento,
        edad,
        direccion,
        ciudad,
        ocupacion,
        motivo,
        diagnostico,
        tratamiento,
        citaId
    });

    // Validar campos obligatorios
    if (!motivo || !diagnostico || !tratamiento) {
        alert('❌ Los campos Motivo, Diagnóstico y Tratamiento son obligatorios.');
        return;
    }

    try {
        const data = {
            pacienteId: parseInt(pacienteId),
            fechaNacimiento: fechaNacimiento,
            edad: edad ? parseInt(edad) : null,
            direccion: direccion,
            ciudad: ciudad,
            ocupacion: ocupacion,
            motivo: motivo,
            alergias: alergias,
            enfermedades: enfermedades,
            medicamentos: medicamentos,
            cirugias: cirugias,
            examenFisico: examenFisico,
            diagnostico: diagnostico,
            tratamiento: tratamiento,
            proximaCita: proximaCita,
            observaciones: observaciones,
            citaId: citaId ? parseInt(citaId) : null
        };

        console.log('📤 Enviando datos al servidor:', data);

        const response = await fetchAPI(`/historial/${pacienteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('📥 Respuesta del servidor:', response);

        if (response.success) {
            alert('✅ Historial médico guardado exitosamente.');

            // Si hay una cita asociada, marcarla como completada
            if (citaId) {
                try {
                    await fetchAPI(`/citas/${citaId}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            estado: 'completada',
                            diagnostico: diagnostico,
                            tratamiento: tratamiento
                        })
                    });
                    console.log('✅ Cita marcada como completada');
                } catch (citaError) {
                    console.error('❌ Error al marcar cita como completada:', citaError);
                }
            }

            // Resetear el formulario (solo campos de consulta)
            const resetFields = ['motivo', 'alergias', 'enfermedades', 'medicamentos', 
                                'cirugias', 'examenFisico', 'diagnostico', 
                                'tratamiento', 'observaciones', 'proximaCita'];
            resetFields.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.value = '';
            });

            // Recargar consultas anteriores
            await cargarConsultasAnteriores();
            await cargarHistorialCompleto();

            setTimeout(() => {
                window.location.href = 'mis-citas-dermatologo.html';
            }, 1500);
        } else {
            alert('❌ ' + (response.error || 'Error al guardar el historial.'));
        }
    } catch (error) {
        console.error('❌ Error al guardar historial:', error);
        alert('❌ Error al guardar el historial. Revisa la consola para más detalles.');
    }
}