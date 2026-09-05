const shopTimeouts = new Map();
let filtroCategoriaActual = "all";
let filtroSubcategoriaActual = "all"; 
let textoBusquedaActual = "";
let paginaActual = 1;
const PRODUCTOS_POR_PAGINA = 12;

function ejecutarFiltradoCombinadoTienda() {
  const productos = document.querySelectorAll("#grid-productos-tienda .producto-item");
  if (productos.length === 0) return;
  let productosFiltrados = [];
  productos.forEach((card) => {
    const categoryAttr = card.getAttribute("data-category");
    const subcategoryAttr = card.getAttribute("data-subcategory") || "all";
    const subcategoriesList = subcategoryAttr.split(" ");
    const tituloProducto = card.querySelector(".product-title")?.textContent.toLowerCase() || "";
    const categoriaTexto = card.querySelector(".product-category")?.textContent.toLowerCase() || "";
    if (shopTimeouts.has(card)) {
      clearTimeout(shopTimeouts.get(card));
      shopTimeouts.delete(card);
    }
    const coincideCategoria = filtroCategoriaActual === "all" || categoryAttr === filtroCategoriaActual;
    const coincideSubcategoria = filtroSubcategoriaActual === "all" || subcategoriesList.includes(filtroSubcategoriaActual);
    const coincideBusqueda = tituloProducto.includes(textoBusquedaActual) || categoriaTexto.includes(textoBusquedaActual);
    if (coincideCategoria && coincideSubcategoria && coincideBusqueda) {
      productosFiltrados.push(card);
      const contenedorTodos = card.querySelector(".talles-todos");
      const contenedorKids = card.querySelector(".talles-kids");
      const contenedorAdultos = card.querySelector(".talles-adultos");
      const precioElement = card.querySelector(".product-price");
      const esLineaDoble = subcategoriesList.includes("kids") && subcategoriesList.includes("adultos");
      if (esLineaDoble) {
        if (filtroSubcategoriaActual === "all") {
          if (contenedorTodos) contenedorTodos.style.display = "flex";
          if (contenedorKids) contenedorKids.style.display = "none";
          if (contenedorAdultos) contenedorAdultos.style.display = "none";
          if (precioElement && card.getAttribute("data-precio-rango")) {
            precioElement.textContent = card.getAttribute("data-precio-rango");
          }
          const botonTextoFijo = contenedorTodos?.querySelector(".btn-size-item");
          if (botonTextoFijo) {
            const esGuanteORG = categoryAttr.includes("guantes") || 
                                categoryAttr.includes("rg") || 
                                tituloProducto.includes("rg") || 
                                categoriaTexto.includes("guante");
            botonTextoFijo.textContent = esGuanteORG ? "VARIOS" : "TODOS";
          }
        } else if (filtroSubcategoriaActual === "kids") {
          if (contenedorTodos) contenedorTodos.style.display = "none";
          if (contenedorKids) contenedorKids.style.display = "flex";
          if (contenedorAdultos) contenedorAdultos.style.display = "none";
          if (precioElement && card.getAttribute("data-precio-kids")) precioElement.textContent = card.getAttribute("data-precio-kids");
        } else if (filtroSubcategoriaActual === "adultos") {
          if (contenedorTodos) contenedorTodos.style.display = "none";
          if (contenedorKids) contenedorKids.style.display = "none";
          if (contenedorAdultos) contenedorAdultos.style.display = "flex";
          if (precioElement && card.getAttribute("data-precio-adultos")) precioElement.textContent = card.getAttribute("data-precio-adultos");
        }
      } else {
        if (contenedorTodos) contenedorTodos.style.display = "none";
        if (contenedorKids) contenedorKids.style.display = "flex";
        if (contenedorAdultos) contenedorAdultos.style.display = "flex";
      }
    } else {
      card.style.opacity = "0";
      card.style.transform = "translateY(12px) scale(0.97)";
      card.style.display = "none"; 
    }
  });
  const contenedorPaginacion = document.getElementById("tienda-paginacion");
  const totalProductosFiltrados = productosFiltrados.length;
  const totalPaginas = Math.ceil(totalProductosFiltrados / PRODUCTOS_POR_PAGINA);
  if (paginaActual > totalPaginas) paginaActual = Math.max(1, totalPaginas);
  if (totalProductosFiltrados > PRODUCTOS_POR_PAGINA) {
    contenedorPaginacion.style.setProperty("display", "flex", "important");
    document.getElementById("info-paginacion").textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById("btn-pag-anterior").disabled = paginaActual === 1;
    document.getElementById("btn-pag-siguiente").disabled = paginaActual === totalPaginas;
  } else {
    contenedorPaginacion.style.setProperty("display", "none", "important");
  }
  productosFiltrados.forEach((card, index) => {
    const indiceInicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const indiceFin = indiceInicio + PRODUCTOS_POR_PAGINA;
    if (index >= indiceInicio && index < indiceFin) {
      card.style.display = "block";
      const contenedoresTalles = card.querySelectorAll(".talles-todos, .talles-kids, .talles-adultos");
      contenedoresTalles.forEach((contenedor) => {
        if (contenedor.style.display === "flex") {
          const botonesTalles = contenedor.querySelectorAll(".btn-size-item");
          botonesTalles.forEach((btn) => btn.classList.remove("active"));
          if (botonesTalles.length > 0) {
            botonesTalles[0].classList.add("active");
          }
        }
      });
      const showTimeout = setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0) scale(1)";
      }, 30);
      shopTimeouts.set(card, showTimeout);
    } else {
      card.style.opacity = "0";
      card.style.transform = "translateY(12px) scale(0.97)";
      card.style.display = "none";
    }
  });
}
function cambiarPagina(direccion) {
  paginaActual += direccion;
  ejecutarFiltradoCombinadoTienda();
  document.getElementById("tienda-controles")?.scrollIntoView({ behavior: "smooth" });
}
function inicializarPestañasTienda() {
  const botonera = document.getElementById("contenedor-filtro-tienda");
  if (!botonera) return;
  const botones = botonera.querySelectorAll(".btn-filter");
  botones.forEach((button) => {
    button.addEventListener("click", () => {
      botones.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      filtroCategoriaActual = button.getAttribute("data-filter");
      paginaActual = 1;
      ejecutarFiltradoCombinadoTienda();
    });
  });
}
function inicializarSubfiltrosTalles() {
  const subBotonera = document.querySelector(".btn-group-subfilters");
  if (!subBotonera) return;
  const botonesSub = subBotonera.querySelectorAll(".btn-subfilter:not(.btn-clear-subfilter)");
  const botonBorrar = subBotonera.querySelector(".btn-clear-subfilter");
  botonesSub.forEach((button) => {
    button.addEventListener("click", () => {
      botonesSub.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      filtroSubcategoriaActual = button.getAttribute("data-subfilter");
      if (botonBorrar) botonBorrar.removeAttribute("disabled");
      paginaActual = 1;
      ejecutarFiltradoCombinadoTienda();
    });
  });
  if (botonBorrar) {
    botonBorrar.addEventListener("click", () => {
      botonesSub.forEach((btn) => btn.classList.remove("active"));
      filtroSubcategoriaActual = "all";
      botonBorrar.setAttribute("disabled", "true");
      paginaActual = 1;
      ejecutarFiltradoCombinadoTienda();
    });
  }
}
function inicializarBuscadorTienda() {
  const inputBusqueda = document.getElementById("search-product-input");
  const btnLimpiar = document.getElementById("btn-clear-search");
  if (!inputBusqueda || !btnLimpiar) return;
  inputBusqueda.addEventListener("input", () => {
    textoBusquedaActual = inputBusqueda.value.toLowerCase().trim();
    btnLimpiar.style.display = textoBusquedaActual.length > 0 ? "flex" : "none";
    paginaActual = 1;
    ejecutarFiltradoCombinadoTienda();
  });
  btnLimpiar.addEventListener("click", () => {
    inputBusqueda.value = ""; textoBusquedaActual = ""; btnLimpiar.style.display = "none";
    inputBusqueda.focus(); 
    paginaActual = 1;
    ejecutarFiltradoCombinadoTienda();
  });
}
function seleccionarTalleFijo(buttonElement) {
  const filaContenedora = buttonElement.closest(".value-sizes-custom");
  if (!filaContenedora) return;
  const botonesTalles = filaContenedora.querySelectorAll(".btn-size-item");
  botonesTalles.forEach((btn) => btn.classList.remove("active"));
  buttonElement.classList.add("active");
}
function derivarCompraWhatsApp(buttonElement) {
  const card = buttonElement.closest(".card-product");
  if (!card) return;
  const modelo = card.querySelector(".product-title")?.textContent.trim() || "Producto CEYFA";
  const categoria = card.querySelector(".product-category")?.textContent.trim() || "Equipamiento";
  const precioActual = card.querySelector(".product-price")?.textContent.trim() || "Consultar precio";
  const tieneOferta = card.querySelector(".tag-oferta") !== null;
  const ganchoMarketing = tieneOferta ? " ¡Aprovechando el precio de oferta especial! 💥" : "";
  let lineaTexto = "Línea Única";
  const subcategoryAttr = card.getAttribute("data-subcategory") || "";
  if (subcategoryAttr === "kids") {
    lineaTexto = "Línea Infantil";
  } else if (subcategoryAttr === "adultos") {
    lineaTexto = "Línea Adulto";
  } else {
    if (filtroSubcategoriaActual === "kids") lineaTexto = "Línea Infantil";
    if (filtroSubcategoriaActual === "adultos") lineaTexto = "Línea Adulto";
  }
  const botonTalleActivo = card.querySelector(".value-sizes-custom:not([style*='display: none']) .btn-size-item.active");
  const talleElegido = botonTalleActivo ? `Talle ${botonTalleActivo.textContent.trim()}` : "No especificado";
  const numeroWhatsApp = "59899449480"; 
  const textoPedido = `¡Hola Tienda CEYFA UY! 🧤🛍️
  Vengo de la web y quiero consultar/comprar el siguiente artículo:${ganchoMarketing}
  🛒 Producto: ${modelo} (${lineaTexto})
  📁 Categoría: ${categoria}
  📐 Talle Seleccionado: ${talleElegido}
  💰 Precio: ${precioActual}
  ¿Tienen stock disponible para coordinar el retiro o envío? ¡Gracias!`;
  window.open(`https://wa.me{numeroWhatsApp}?text=${encodeURIComponent(textoPedido)}`, "_blank");
}
document.addEventListener("DOMContentLoaded", function () {
  inicializarPestañasTienda();
  inicializarSubfiltrosTalles(); 
  inicializarBuscadorTienda();
  ejecutarFiltradoCombinadoTienda();
  const parametrosURL = new URLSearchParams(window.location.search);
  const categoriaInyectada = parametrosURL.get("categoria");
  if (categoriaInyectada) {
    const botonObjetivo = document.querySelector(`#contenedor-filtro-tienda .btn-filter[data-filter="${categoriaInyectada}"]`);
    if (botonObjetivo) {
      filtroCategoriaActual = categoriaInyectada;
      document.querySelectorAll("#contenedor-filtro-tienda .btn-filter").forEach((btn) => btn.classList.remove("active"));
      botonObjetivo.classList.add("active");
      ejecutarFiltradoCombinadoTienda();
    }
  }
});
