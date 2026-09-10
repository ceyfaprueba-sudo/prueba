const API_TIENDA_DATOS_URL = "https://script.google.com/macros/s/AKfycbyF31_AjEGP6MNa87S2uFd9R-rbxd0MN3rgLEipbF8UlOunkLaFpJjdK6_Td4c3olVYrg/exec?seccion=tienda";

function escaparHtmlTienda(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugTienda(valor) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function precioTienda(valor) {
  const numero = Number(valor);

  if (!numero) return "";

  return numero.toLocaleString("es-UY");
}

function imagenTienda(producto) {
  const driveId = String(producto.imagenDriveId ?? "").trim();

  if (driveId) {
    return "https://lh3.googleusercontent.com/d/" + driveId;
  }

  const url = String(producto.imagenUrl ?? "").trim();

  if (!url) {
    return "img/logo.png";
  }

  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match) {
    return "https://lh3.googleusercontent.com/d/" + match[1];
  }

  return url;
}

function obtenerTallesTienda(producto) {
  // Code.gs ya devuelve todos los talles unidos.
  if (Array.isArray(producto.talles)) {
    return producto.talles
      .map(talle => String(talle).trim())
      .filter(Boolean);
  }

  // Respaldo por si vienen separados.
  const kids = Array.isArray(producto.talleKids)
    ? producto.talleKids
    : [];

  const adultos = Array.isArray(producto.talleAdultos)
    ? producto.talleAdultos
    : [];

  return [...kids, ...adultos]
    .map(talle => String(talle).trim())
    .filter(Boolean);
}

function crearTarjetaTienda(producto) {
  const categoria = String(producto.categoria ?? "").trim();
  const subcategoria = String(producto.subcategoria ?? "").trim().toLowerCase();
  const nombre = String(producto.nombre ?? "").trim();

  const precioActualNumero = Number(producto.precioActual) || 0;
  const precioViejoNumero = Number(producto.precioViejo) || 0;
  const precioKidsNumero = Number(producto.precioKids) || 0;
  const precioAdultosNumero = Number(producto.precioAdultos) || 0;

  const precioActual = precioTienda(precioActualNumero);
  const precioViejo = precioTienda(precioViejoNumero);
  const precioKids = precioTienda(precioKidsNumero);
  const precioAdultos = precioTienda(precioAdultosNumero);

  let precioRango = "";

  if (precioKidsNumero > 0 && precioAdultosNumero > 0) {
    if (precioKidsNumero !== precioAdultosNumero) {
      precioRango = `$${precioKids} - $${precioAdultos}`;
    } else {
      precioRango = `$${precioKids}`;
    }
  }

  else if (precioKidsNumero > 0) {
    precioRango = `$${precioKids}`;
  }

  else if (precioAdultosNumero > 0) {
    precioRango = `$${precioAdultos}`;
  }

  else if (precioActualNumero > 0) {
    precioRango = `$${precioActual}`;
  }

  const imagen = imagenTienda(producto);

  const tallesKids = Array.isArray(producto.talleKids)
    ? producto.talleKids.map(talle => String(talle).trim()).filter(Boolean)
    : [];

  const tallesAdultos = Array.isArray(producto.talleAdultos)
    ? producto.talleAdultos.map(talle => String(talle).trim()).filter(Boolean)
    : [];

  const todosLosTalles = producto.todosLosTalles === true;

  const subcategoriaData = subcategoria === "ambos"
    ? "kids adultos"
    : slugTienda(subcategoria);

  const esAmbos = subcategoria === "ambos";

  let ofertaHtml = "";

 if (
    precioViejoNumero > 0 &&
    precioActualNumero > 0 &&
    precioViejoNumero > precioActualNumero
  ) {

    if (slugTienda(categoria) === "ceyfa") {
  
      const porcentaje = Math.round(
        ((precioViejoNumero - precioActualNumero) / precioViejoNumero) * 100
      );
  
      ofertaHtml = `
        <span class="tag-custom tag-secondary-custom tag-oferta tag-percentage">
          ${porcentaje}% OFF
        </span>
      `;
  
    }
  
    else {
  
      ofertaHtml = `
        <span class="tag-custom tag-secondary-custom tag-oferta">
          ¡OFERTA!
        </span>
      `;
  
    }
  }

  const botonesKids = tallesKids
    .map((talle, indice) => `
      <button
        type="button"
        class="btn-form-custom btn-size-item${
          !esAmbos &&
          subcategoria === "kids" &&
          indice === 0
            ? " active"
            : ""
        }"
        onclick="seleccionarTalleFijo(this)"
      >
        ${escaparHtmlTienda(talle)}
      </button>
    `)
    .join("");

  const botonesAdultos = tallesAdultos
    .map((talle, indice) => `
      <button
        type="button"
        class="btn-form-custom btn-size-item${
          !esAmbos &&
          subcategoria === "adultos" &&
          indice === 0
            ? " active"
            : ""
        }"
        onclick="seleccionarTalleFijo(this)"
      >
        ${escaparHtmlTienda(talle)}
      </button>
    `)
    .join("");

  let bloqueTalles = "";

  if (esAmbos) {
    bloqueTalles = `
      <div class="box-column-custom">

        <span class="label-custom">
          Elegí tu talle:
        </span>

        <div class="value-sizes-custom talles-todos">

          <button
            type="button"
            class="btn-form-custom btn-size-item active"
            onclick="seleccionarTalleFijo(this)"
          >
            VARIOS
          </button>

        </div>

        ${
          botonesAdultos
            ? `
              <div
                class="value-sizes-custom talles-adultos"
                style="display: none;"
              >
                ${botonesAdultos}
              </div>
            `
            : ""
        }

        ${
          botonesKids
            ? `
              <div
                class="value-sizes-custom talles-kids"
                style="display: none;"
              >
                ${botonesKids}
              </div>
            `
            : ""
        }

      </div>
    `;
  }

  else if (subcategoria === "kids" && botonesKids) {
    bloqueTalles = `
      <div class="box-column-custom">

        <span class="label-custom">
          Elegí tu talle:
        </span>

        <div class="value-sizes-custom talles-kids">
          ${botonesKids}
        </div>

      </div>
    `;
  }

  else if (subcategoria === "adultos" && botonesAdultos) {
    bloqueTalles = `
      <div class="box-column-custom">

        <span class="label-custom">
          Elegí tu talle:
        </span>

        <div class="value-sizes-custom talles-adultos">
          ${botonesAdultos}
        </div>

      </div>
    `;
  }

  else if (todosLosTalles) {
    bloqueTalles = `
      <div class="box-column-custom">

        <span class="label-custom">
          Elegí tu talle:
        </span>

        <div class="value-sizes-custom talles-todos">

          <button
            type="button"
            class="btn-form-custom btn-size-item active"
            onclick="seleccionarTalleFijo(this)"
          >
            TODOS
          </button>

        </div>

      </div>
    `;
  }

  let precioHtml = "";

  if (precioViejo && precioActual) {
    precioHtml = `
      <div class="box-price">

        <p class="product-price">
          ${escaparHtmlTienda(precioRango)}
        </p>

        <span class="product-price-old">
          $${escaparHtmlTienda(precioViejo)}
        </span>

      </div>
    `;
  }

  else {
    precioHtml = `
      <p class="product-price">
        ${escaparHtmlTienda(precioRango)}
      </p>
    `;
  }

  const dataPrecioKids = precioKids
    ? `$${precioKids}`
    : precioActual
      ? `$${precioActual}`
      : "";

  const dataPrecioAdultos = precioAdultos
    ? `$${precioAdultos}`
    : precioActual
      ? `$${precioActual}`
      : "";

  return `
    <div
      class="col producto-item"
      data-category="${escaparHtmlTienda(slugTienda(categoria))}"
      data-subcategory="${escaparHtmlTienda(subcategoriaData)}"
      data-precio-rango="${escaparHtmlTienda(precioRango)}"
      data-precio-kids="${escaparHtmlTienda(dataPrecioKids)}"
      data-precio-adultos="${escaparHtmlTienda(dataPrecioAdultos)}"
    >

      <div class="card-custom card-motion card-product">

        ${ofertaHtml}

        <div class="product-img">

          <img
            src="${escaparHtmlTienda(imagen)}"
            alt="${escaparHtmlTienda(nombre)}"
            onerror="this.onerror=null; this.src='img/logo.png';"
          >

        </div>

        <div class="product-info">

          <div class="box-column-custom">

            <span class="label-custom product-category">
              ${escaparHtmlTienda(categoria)}
            </span>

            <h3 class="card-title product-title">
              ${escaparHtmlTienda(nombre)}
            </h3>

          </div>

          ${bloqueTalles}

          <div class="box-row-custom mt-2">

            ${precioHtml}

            <button
              type="button"
              class="btn btn-form-custom btn-product"
              onclick="derivarCompraWhatsApp(this)"
              aria-label="Comprar por WhatsApp"
            >

              <i class="bi bi-whatsapp"></i>

            </button>

          </div>

        </div>

      </div>

    </div>
  `;
}

async function cargarDatosTienda() {
  const grid = document.getElementById("grid-productos-tienda");
  if (!grid) return;

  try {
    const respuesta = await fetch(API_TIENDA_DATOS_URL);

    if (!respuesta.ok) {
      throw new Error("HTTP " + respuesta.status);
    }

    const datos = await respuesta.json();

    if (Array.isArray(datos.footer) && datos.footer.length) {
      renderizarFooter(datos.footer);
    }

    if (!Array.isArray(datos.tienda)) return;

    const productos = datos.tienda.filter(producto =>
      String(producto.nombre ?? "").trim()
    );

    grid.innerHTML = productos
      .map(crearTarjetaTienda)
      .join("");

    if (typeof paginaActual !== "undefined") {
      paginaActual = 1;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof ejecutarFiltradoCombinadoTienda === "function") {
          ejecutarFiltradoCombinadoTienda();
        }
      });
    });
  }

  catch (error) {
    console.error(
      "[CEYFA] Error cargando Tienda:",
      error
    );
  }
}


document.addEventListener(
  "DOMContentLoaded",
  cargarDatosTienda
);
