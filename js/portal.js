let alumnoActivoGlobal = null;
let fechaSeleccionadaReserva = null;
let nodoCeldaSeleccionada = null;

const ORGANIGRAMA_SEMANAL_CEYFA = {
  0: [ // DOMINGOS
    { nombre: "NUEVO CENTRO (Futvolt)", hora: "09:30 a 11:00 hs — Estándar", depto: "Montevideo", dir: "Andrés Lamas 3419", mapa: "https://google.com" }
  ],
  1: [ // LUNES
    { nombre: "BELVEDERE (Complejo Neurosport)", hora: "18:30 a 20:00 hs — Estándar", depto: "Montevideo", dir: "Coronel Bolognesi 11900", mapa: "https://google.com" },
    { nombre: "BELVEDERE (Complejo Neurosport)", hora: "20:00 a 21:30 hs — Avanzados ⚡", depto: "Montevideo", dir: "Coronel Bolognesi 11900", mapa: "https://google.com" },
    { nombre: "CARRASCO (Nogales Ciudad Deportiva)", hora: "18:40 a 20:10 hs — Estándar", depto: "Montevideo", dir: "Servando Gómez 2850", mapa: "https://google.com" }
  ],
  2: [ // MARTES
    { nombre: "CIUDAD DE LA COSTA (Zona Lab)", hora: "18:30 a 20:00 hs — Estándar", depto: "Canelones", dir: "Leópolis 7133", mapa: "https://google.com" },
    { nombre: "BRAZO ORIENTAL (Cancha Carabelas)", hora: "19:00 a 20:30 hs — Estándar", depto: "Montevideo", dir: "Pablo Ehrlich 3974", mapa: "https://google.com" }
  ],
  3: [ // MIÉRCOLES
    { nombre: "CARRASCO (Nogales Ciudad Deportiva)", hora: "18:40 a 20:10 hs — Estándar", depto: "Montevideo", dir: "Servando Gómez 2850", mapa: "https://google.com" }
  ],
  4: [ // JUEVES
    { nombre: "CIUDAD DE LA COSTA (Zona Lab)", hora: "18:30 a 20:00 hs — Estándar", depto: "Canelones", dir: "Leópolis 7133", mapa: "https://google.com" },
    { nombre: "ANTEL ARENA (Club Deportivo Oriental)", hora: "19:30 a 21:00 hs — Estándar", depto: "Montevideo", dir: "Valladolid 3835", mapa: "https://google.com" }
  ],
  5: [ // VIERNES
    { nombre: "BELVEDERE (Complejo Neurosport)", hora: "18:30 a 20:00 hs — Estándar", depto: "Montevideo", dir: "Coronel Bolognesi 11900", mapa: "https://google.com" },
    { nombre: "BELVEDERE (Complejo Neurosport)", hora: "20:00 a 21:30 hs — Avanzados ⚡", depto: "Montevideo", dir: "Coronel Bolognesi 11900", mapa: "https://google.com" }
  ]
};

function inicializarAutenticacionPortal() {
  const formulario = document.getElementById("form-auth-portal");
  if (!formulario) return;

  formulario.addEventListener("submit", function (event) {
    event.preventDefault();
    event.stopPropagation();

    const usuarioIngresado = document.getElementById("input-auth-user").value.trim();
    const claveIngresada = document.getElementById("input-auth-pass").value.trim();

    if (!formulario.checkValidity()) { 
      formulario.classList.add("was-validated"); 
      return; 
    }
    
    formulario.classList.add("was-validated");

    const alumnoEncontrado = baseAlumnosCEYFA.find(
      (alumno) => alumno.cedula === usuarioIngresado && alumno.clave === claveIngresada
    );

    if (!alumnoEncontrado) {
      alert("❌ Cédula o contraseña incorrectas. Recordá que la clave va sin espacios y combinando Nombre y Apellido (Ej: MateoSilva).");
      return;
    }

    alumnoActivoGlobal = alumnoEncontrado;
    
    ejecutarTransicionHaciaPanel();
  });
}

function ejecutarTransicionHaciaPanel() {
  const seccionLogin = document.getElementById("login");
  if (!seccionLogin) return;

  seccionLogin.style.opacity = "0";
  seccionLogin.style.transform = "translateY(-15px) scale(0.98)";
  seccionLogin.style.transition = "opacity 0.4s ease, transform 0.4s ease";

  setTimeout(() => {
    const totalAsistidasReales = alumnoActivoGlobal.clasesHistorial ? 
      alumnoActivoGlobal.clasesHistorial.filter(clase => clase.estado === "agendada").length : 0;

    const cupoMaximoMensual = 5; 
    alumnoActivoGlobal.agendadas = totalAsistidasReales;
    alumnoActivoGlobal.restantes = cupoMaximoMensual - totalAsistidasReales;

    seccionLogin.innerHTML = `
      <div class="container py-3">
        <!-- Riel de avisos dinámicos en el techo del panel -->
        <div id="contenedor-alertas-panel" class="mb-4"></div>
        
        <!-- PARTE SUPERIOR: DOS COLUMNAS ASIMÉTRICAS (Ficha + Almanaque) -->
        <div class="row g-4 mb-4">
          <!-- COLUMNA IZQUIERDA: FICHA ESTRICTA DEL GOLERO Y MEMBRESÍA -->
          <div class="col-lg-4">
            <div class="card-custom card-form h-100 p-4 wrapper-ficha-alumno box-custom box-column-custom justify-content-start gap-3">
              <div class="d-flex align-items-center justify-content-between w-100 pb-2 border-bottom" style="border-color: rgba(255,255,255,0.04) !important;">
                <h4 class="font-titulos fw-900 text-white m-0 tracking-tight">${alumnoActivoGlobal.nombre.toUpperCase()}</h4>
                <span class="tag-custom badge-cuota-paga py-1.5 px-2.5 rounded-pill">Cuota Paga ✓</span>
              </div>
              <div class="box-custom box-column-custom gap-2 py-1 w-100 text-start">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="ficha-stats-lbl">Clases Agendadas:</span>
                  <span class="ficha-stats-val txt-val-agendadas">${alumnoActivoGlobal.agendadas}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="ficha-stats-lbl">Clases Restantes:</span>
                  <span class="ficha-stats-val text-gradient text-cyan txt-val-restantes">${alumnoActivoGlobal.restantes}</span>
                </div>
              </div>
              <div class="box-custom box-column-custom gap-1.5 pt-3 w-100 text-start text-muted bg-transparent border-0" style="font-size:0.85rem;">
                <p class="mb-0">Plan: <strong class="text-white">${alumnoActivoGlobal.plan}</strong></p>
                <p class="mb-0">Frecuencia Semanal: <strong class="text-white">${alumnoActivoGlobal.frecuencia}</strong></p>
                <p class="mb-0">Clases al Mes: <strong class="text-white">${alumnoActivoGlobal.clasesMes}</strong></p>
              </div>
            </div>
          </div>
          
          <!-- COLUMNA DERECHA: CONSOLA DE RESERVAS & CALENDARIO TEMPORAL -->
          <div class="col-lg-8">
            <div class="card-custom card-form p-4 wrapper-agenda-alumno box-custom box-column-custom gap-4">
              <div class="w-100 text-start calendar-month-container">
                <div class="d-flex justify-content-between align-items-center calendar-month-header">
                  <span class="label-custom m-0">// AGOSTO 2026</span>
                  <span class="small text-muted font-textos">Mes Activo Universal</span>
                </div>
                <div id="grid-almanaque-dinamico" class="calendar-grid-mini mb-3"></div>
                <div id="panel-seleccion-sede-dinamico" class="w-100"></div>
              </div>
            </div>
          </div>
        </div> <!-- Fin Fila Superior -->
        
        <!-- PARTE INFERIOR: BLOQUE ANCHO PANORÁMICO DE UBICACIONES -->
        <div class="card-custom card-form p-4 box-custom box-column-custom gap-3 text-start mt-2">
          <span class="label-custom m-0">// INFORMACIÓN DE SEDES Y UBICACIONES OFICIALES</span>
          <div id="panel-lista-sedes-info" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 w-100 m-0 p-0"></div>
        </div>
      </div>
    `;

    seccionLogin.style.opacity = "1"; 
    seccionLogin.style.transform = "translateY(0) scale(1)";
    
    inyectarAvisosDeEmergencia();
    calcularYRenderizarAlmanaqueUniversalAgosto2026();
    inyectarFichasDireccionSedes();
  }, 400);
}

function inyectarAvisosDeEmergencia() {
  const contenedorAlertas = document.getElementById("contenedor-alertas-panel");
  if (!contenedorAlertas) return;

  const alertaActiva = {
    mensaje: "⚠️ AVISO DE CLIMA: Los días de tormenta fuerte recordá chequear esta franja de alertas. Si una práctica oficial se suspende por mal tiempo en Montevideo o Canelones, se avisará por este medio dos horas antes."
  };

  contenedorAlertas.innerHTML = `
    <div class="card-custom p-3 border-danger-custom alert-destellante-neon">
      <p class="mb-0 small font-textos text-white fw-600" style="font-size:0.85rem; line-height:1.4;">${alertaActiva.mensaje}</p>
    </div>
  `;
}

const MESES_NOMBRES_ESPANOL = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

function calcularYRenderizarAlmanaqueUniversalAgosto2026() {
  const gridAlmanaque = document.getElementById("grid-almanaque-dinamico");
  if (!gridAlmanaque) return;

  const fechaHoySistema = new Date();
  const añoActual = fechaHoySistema.getFullYear();
  const mesActualIndice = fechaHoySistema.getMonth();
  const diaHoyReal = fechaHoySistema.getDate();

  const txtMesCabezal = document.querySelector(".label-custom.m-0");
  if (txtMesCabezal) {
    txtMesCabezal.textContent = `// ${MESES_NOMBRES_ESPANOL[mesActualIndice]} ${añoActual}`;
  }

  gridAlmanaque.innerHTML = `<span class="calendar-day-name">L</span><span class="calendar-day-name">M</span><span class="calendar-day-name">M</span><span class="calendar-day-name">J</span><span class="calendar-day-name">V</span><span class="calendar-day-name">S</span><span class="calendar-day-name">D</span>`;

  const primerDiaMesObjeto = new Date(Date.UTC(añoActual, mesActualIndice, 1));
  let numeroPrimerDiaSemana = primerDiaMesObjeto.getUTCDay();
  
  let celdasVaciasColchon = numeroPrimerDiaSemana === 0 ? 6 : numeroPrimerDiaSemana - 1;

  for (let i = 0; i < celdasVaciasColchon; i++) { 
    gridAlmanaque.innerHTML += `<span class="calendar-day-num empty-day"></span>`; 
  }

  const diasTotalesEnEsteMes = new Date(añoActual, mesActualIndice + 1, 0).getDate();

  for (let dia = 1; dia <= diasTotalesEnEsteMes; dia++) {
    const stringMesFormateado = (mesActualIndice + 1).toString().padStart(2, '0');
    const stringFechaDia = `${añoActual}-${stringMesFormateado}-${dia.toString().padStart(2, '0')}`;
    
    const fechaEvaluadaObjeto = new Date(Date.UTC(añoActual, mesActualIndice, dia)); 
    const numeroDiaSemana = fechaEvaluadaObjeto.getUTCDay();

    const esPasado = dia <= diaHoyReal;
    const claseTemporal = esPasado ? "day-pasado" : "day-futuro";
    
    const tieneSedesEsteDia = ORGANIGRAMA_SEMANAL_CEYFA[numeroDiaSemana] !== undefined && numeroDiaSemana !== 6;
    
    let claseEstado = ""; 
    let dataOnclick = "";

    const registroHistorialPasado = alumnoActivoGlobal.clasesHistorial ? 
      alumnoActivoGlobal.clasesHistorial.find((c) => c.fecha === stringFechaDia) : null;

    if (registroHistorialPasado) {
      claseEstado = "state-" + registroHistorialPasado.estado;
    } else if (tieneSedesEsteDia) {
      claseEstado = "state-disponible";
      if (!esPasado) {
        dataOnclick = `onclick="abrirConsolaSeleccionSedeUniversal('${stringFechaDia}', ${numeroDiaSemana}, this)"`;
      }
    }

    gridAlmanaque.innerHTML += `<span class="calendar-day-num ${claseTemporal} ${claseEstado}" ${dataOnclick}>${dia}</span>`;
  }
}

function abrirConsolaSeleccionSedeUniversal(fechaTexto, numeroDiaSemana, elementoDiaCelda) {
  document.querySelectorAll(".calendar-day-num").forEach(el => el.classList.remove("selected-for-booking"));
  elementoDiaCelda.classList.add("selected-for-booking");

  fechaSeleccionadaReserva = fechaTexto; 
  nodoCeldaSeleccionada = elementoDiaCelda;

  const panelSedeDinamico = document.getElementById("panel-seleccion-sede-dinamico");
  const sedesDisponiblesEsteDia = ORGANIGRAMA_SEMANAL_CEYFA[numeroDiaSemana];
  
  if (!sedesDisponiblesEsteDia || !panelSedeDinamico) return;

  let opcionesSelectHtml = "";
  sedesDisponiblesEsteDia.forEach((opcion, index) => {
    opcionesSelectHtml += `<option value="${index}">${opcion.nombre} — Horario: ${opcion.hora}</option>`;
  });

  const diaFormateadoLegible = parseInt(fechaTexto.substring(8), 10);
  const indiceMesInt = parseInt(fechaTexto.substring(5, 7), 10) - 1;
  const nombreMesLegible = MESES_NOMBRES_ESPANOL[indiceMesInt].toLowerCase();

  panelSedeDinamico.innerHTML = `
    <div class="p-3 booking-step2-glass-box box-custom box-column-custom gap-3 text-start mt-3">
      <div class="box-custom box-column-custom gap-0.5">
        <span class="label-custom text-cyan" style="font-size:0.65rem;">// PASO 2: SELECONAR COMPLEJO DE ENTRENAMIENTO</span>
        <h4 class="text-white font-titulos fw-800 small m-0">Sedes operativas para el día ${diaFormateadoLegible} de ${nombreMesLegible}:</h4>
      </div>
      <div class="box-custom box-column-custom gap-1 w-100">
        <select id="select-sede-portal-dinamico" class="form-select select-sede-portal-custom w-100">${opcionesSelectHtml}</select>
      </div>
      <div class="d-flex justify-content-end w-100 mt-1">
        <button type="button" class="btn rounded-pill btn-primary-custom px-4 py-2 small font-titulos fw-800" style="font-size:0.75rem; letter-spacing:0.05em;" onclick="finalizarAgendadoUniversal(${numeroDiaSemana})">
          AGENDAR ENTRENAMIENTO <i class="bi bi-check-circle-fill ms-2"></i>
        </button>
      </div>
    </div>
  `;
}

function finalizarAgendadoUniversal(numeroDiaSemana) {
  if (!alumnoActivoGlobal || !fechaSeleccionadaReserva || !nodoCeldaSeleccionada) return;

  if (alumnoActivoGlobal.restantes <= 0) {
    alert("⚠️ Has completado todas las clases correspondientes a tu Plan de este mes. Para sumar entrenamientos adicionales, solicita un pase de créditos por WhatsApp.");
    return;
  }

  const selectSedeDom = document.getElementById("select-sede-portal-dinamico");
  if (!selectSedeDom) return;

  const opcionSedeElegida = ORGANIGRAMA_SEMANAL_CEYFA[numeroDiaSemana][selectSedeDom.value];

  alumnoActivoGlobal.restantes -= 1; 
  alumnoActivoGlobal.agendadas += 1;
  
  if (!alumnoActivoGlobal.clasesHistorial) alumnoActivoGlobal.clasesHistorial = [];
  alumnoActivoGlobal.clasesHistorial.push({ fecha: fechaSeleccionadaReserva, estado: "agendada" });

  document.querySelector(".txt-val-agendadas").textContent = alumnoActivoGlobal.agendadas;
  document.querySelector(".txt-val-restantes").textContent = alumnoActivoGlobal.restantes;

  nodoCeldaSeleccionada.classList.remove("selected-for-booking", "state-disponible");
  nodoCeldaSeleccionada.classList.add("state-agendada");
  nodoCeldaSeleccionada.removeAttribute("onclick");
  nodoCeldaSeleccionada.style.pointerEvents = "none";

  document.getElementById("panel-seleccion-sede-dinamico").innerHTML = "";

  alert(`🧤 ¡Excelente, entrenamiento agendado con éxito! Te esperamos el día ${fechaSeleccionadaReserva.substring(8)} de Agosto en la sede ${opcionSedeElegida.nombre} en el horario de ${opcionSedeElegida.hora}.`);
}

function inyectarFichasDireccionSedes() {
  const panelSedes = document.getElementById("panel-lista-sedes-info");
  if (!panelSedes) return;

  const mapaSedesUnicas = new Map();
  Object.values(ORGANIGRAMA_SEMANAL_CEYFA).flat().forEach((item) => {
    if (!mapaSedesUnicas.has(item.nombre)) { 
      mapaSedesUnicas.set(item.nombre, item); 
    }
  });

  mapaSedesUnicas.forEach((item) => {
    panelSedes.innerHTML += `
      <div class="panel-theme-grid-col col">
        <div class="panel-theme-grid-col-col border-0 bg-transparent" style="border:none !important; background:transparent !important;">
          <div class="panel-sede-card-item d-flex justify-content-between align-items-center p-3 h-100">
            <div class="d-flex align-items-center gap-3 text-start">
              <div class="panel-icon-box-geo"><i class="bi bi-geo-alt-fill"></i></div>
              <div class="box-custom box-column-custom gap-0.5">
                <div class="d-flex align-items-center gap-2">
                  <span class="txt-sede-panel-title text-white" style="font-size:0.85rem; font-weight:800; font-family:var(--font-titulos); letter-spacing:var(--tracking-tight);">${item.nombre}</span>
                  <span class="badge bg-dark text-muted-legal" style="font-size:0.6rem; letter-spacing:0.05em; border:1px solid rgba(255,255,255,0.03);">${item.depto.toUpperCase()}</span>
                </div>
                <span class="text-muted small d-block mt-0.5" style="font-size:0.72rem; color:var(--bs-gray-600) !important;"><i class="bi bi-compass me-1"></i> ${item.dir}</span>
              </div>
            </div>
            <div>
              <a href="${item.mapa}" target="_blank" rel="noopener noreferrer" class="btn-map-link-panel" aria-label="Ver mapa de ubicación"><i class="bi bi-map-fill"></i></a>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

document.addEventListener("DOMContentLoaded", function () { 
  inicializarAutenticacionPortal(); 
});