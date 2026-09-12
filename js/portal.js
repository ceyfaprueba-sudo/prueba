async function cargarPortal() {
  try {
    const respuesta = await fetch(`${API_CEYFA_URL}?seccion=portal`);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    const datos = await respuesta.json();

    configurarWhatsappDesdeFooter(datos.footer);

    if (typeof renderizarFooter === "function" && Array.isArray(datos.footer) && datos.footer.length) {
      renderizarFooter(datos.footer);
    }
  } catch (error) {
    console.error("[CEYFA] Error cargando Portal:", error);
  }
}

document.addEventListener("DOMContentLoaded", cargarPortal);
