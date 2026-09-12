const API_CEYFA_URL = "https://script.google.com/macros/s/AKfycbzrCvwh6anDvJu8GIrWwLRhnHMeA_fjTzqR1jdVi0lc8w868qhMDxw3bg3JUxj4kLHcAg/exec";

let WHATSAPP_CEYFA = "";

function actualizarWhatsappGlobal() {
  document.querySelectorAll("[data-whatsapp]").forEach(enlace => {
    enlace.href = `https://wa.me/${WHATSAPP_CEYFA}`;
  });
}

document.addEventListener("DOMContentLoaded", actualizarWhatsappGlobal);

function limpiarTexto(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor).trim();
}

function escaparHtml(valor) {
  return limpiarTexto(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizarTexto(valor) {
  return limpiarTexto(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerIdDrive(valor) {
  const entrada = limpiarTexto(valor);
  if (!entrada) return "";

  if (
    !entrada.includes("/") &&
    !entrada.includes(" ") &&
    !entrada.toLowerCase().startsWith("http") &&
    entrada.length >= 20
  ) {
    return entrada;
  }

  const coincidenciaD = entrada.match(/\/d\/([^/]+)/i);
  if (coincidenciaD) return coincidenciaD[1];

  const coincidenciaId = entrada.match(/[?&]id=([^&]+)/i);
  if (coincidenciaId) return coincidenciaId[1];

  return "";
}

function obtenerImagenDrive(driveId, ancho = 1600) {
  if (!driveId) return "";
  return "https://drive.google.com/thumbnail?id=" + driveId + "&sz=w" + ancho;
}

function obtenerPreviewDrive(driveId) {
  if (!driveId) return "";
  return "https://drive.google.com/file/d/" + driveId + "/preview";
}

function obtenerEnlaceDrive(driveId, urlOriginal) {
  if (driveId) {
    return "https://drive.google.com/file/d/" + driveId + "/view";
  }

  return limpiarTexto(urlOriginal);
}

function formatearPrecio(valor) {
  const numero = Number(valor);

  if (isNaN(numero)) {
    return limpiarTexto(valor);
  }

  return "$" + numero.toLocaleString("es-UY");
}

function formatearFechaVisible(fecha) {
  const valor = limpiarTexto(fecha);
  if (!valor) return "";

  const partes = valor.split("-");
  if (partes.length !== 3) return valor;

  const anio = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);

  const fechaLocal = new Date(anio, mes - 1, dia);

  if (isNaN(fechaLocal.getTime())) {
    return valor;
  }

  let resultado = fechaLocal.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  return resultado.charAt(0).toUpperCase() + resultado.slice(1);
}

function obtenerDiasFiltro(horarios) {
  const diasPermitidos = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo"
  ];

  const encontrados = new Set();

  (horarios || []).forEach(horario => {
    const textoDia = normalizarTexto(horario.dia);

    diasPermitidos.forEach(dia => {
      if (textoDia.includes(dia)) {
        encontrados.add(dia);
      }
    });
  });

  function renderizarFooter(footer) {
    const pie = document.getElementById("pie-pagina");
    if (!pie) return;
  
    const enlace = pie.querySelector(".link-doc-custom");
    if (!enlace) return;
  
    const documento = footer?.[0];
    if (!documento) return;
  
    const url = obtenerEnlaceDrive(
      documento.documentoDriveId,
      documento.documentoUrl
    );
  
    if (url) enlace.href = url;
  
    const etiqueta = enlace.querySelector(".pdf-btn-lbl");
  
    if (etiqueta) {
      etiqueta.innerHTML = `
        ${escaparHtml(documento.nombre)}
        <i class="bi bi-file-earmark-pdf ms-2"></i>
      `;
    }
  }

  return Array.from(encontrados).join(",");
}
