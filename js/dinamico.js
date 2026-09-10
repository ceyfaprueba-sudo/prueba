const API_URL = "https://script.google.com/macros/s/AKfycbyF31_AjEGP6MNa87S2uFd9R-rbxd0MN3rgLEipbF8UlOunkLaFpJjdK6_Td4c3olVYrg/exec";
const API_KEY = "AIzaSyCSQS87izdjU6TQN2bhHMnsCbUVXrsBjL0";

async function cargarDatos() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error("Error HTTP: " + respuesta.status);

    const datos = await respuesta.json();
    if (datos.error) return;

    if (Array.isArray(datos.escuela) && datos.escuela.length) renderizarEscuela(datos.escuela);
    if (Array.isArray(datos.fundamentos) && datos.fundamentos.length) renderizarFundamentos(datos.fundamentos);
    if (Array.isArray(datos.equipo) && datos.equipo.length) renderizarEquipo(datos.equipo);

    if (Array.isArray(datos.sedes) && datos.sedes.length) {
      renderizarSedes(datos.sedes);
      actualizarSelectSedes(datos.sedes);
    }

    if (Array.isArray(datos.planes) && datos.planes.length) renderizarPlanes(datos.planes);

    const eventos = Array.isArray(datos.eventos) ? datos.eventos : [];

    const eventosAbiertos = eventos.filter(
      evento => evento.inscripcionesAbiertas === true
    );
    
    const tiraMarquee = document.getElementById("tira-marquee");
    
    if (eventosAbiertos.length) {
      const evento = eventosAbiertos[0];
    
      renderizarEvento(evento);
      actualizarMarqueeEvento(evento);
    
      if (tiraMarquee) {
        tiraMarquee.style.display = "";
      }
    } else {
      if (tiraMarquee) {
        tiraMarquee.style.display = "none";
      }
    
      if (eventos.length) {
        renderizarEvento(eventos[0]);
      }
    }

    if (Array.isArray(datos.tienda)) actualizarTiendaInicio(datos.tienda);
    if (Array.isArray(datos.marcas) && datos.marcas.length) renderizarMarcas(datos.marcas);
    if (Array.isArray(datos.footer) && datos.footer.length) renderizarFooter(datos.footer);
  }
  catch (error) {
    console.error("Error al cargar los datos:", error);
  }
}

function obtenerIdYoutube(url) {
  try {
    const enlace = new URL(url);

    if (enlace.hostname.includes("youtu.be")) {
      return enlace.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (enlace.hostname.includes("youtube.com")) {
      if (enlace.pathname === "/watch") {
        return enlace.searchParams.get("v") || "";
      }

      if (
        enlace.pathname.startsWith("/embed/") ||
        enlace.pathname.startsWith("/shorts/")
      ) {
        return enlace.pathname.split("/")[2] || "";
      }
    }
  } catch (error) {
    return "";
  }

  return "";
}

function renderizarEscuela(escuela) {
  const carrusel = document.getElementById("carouselEscuela");
  if (!carrusel) return;

  const indicadores = carrusel.querySelector(".carousel-indicators");
  const interior = carrusel.querySelector(".carousel-inner");
  if (!indicadores || !interior) return;

  const obtenerIdYoutube = url => {
    try {
      const enlace = new URL(url);

      if (enlace.hostname.includes("youtu.be")) {
        return enlace.pathname.split("/").filter(Boolean)[0] || "";
      }

      if (enlace.hostname.includes("youtube.com")) {
        if (enlace.pathname === "/watch") {
          return enlace.searchParams.get("v") || "";
        }

        if (
          enlace.pathname.startsWith("/embed/") ||
          enlace.pathname.startsWith("/shorts/")
        ) {
          return enlace.pathname.split("/")[2] || "";
        }
      }
    } catch (error) {
      return "";
    }

    return "";
  };

  const elementos = escuela
    .map(item => {
      const tipo = normalizarTexto(item.tipo ?? item.Tipo);
      const url = limpiarTexto(item.url ?? item.Url);
      const driveId = (item.driveId || obtenerIdDrive(url) || "").trim();
      const youtubeId = obtenerIdYoutube(url);

      return {
        tipo,
        url,
        driveId,
        youtubeId,
        esDrive: item.esDrive === true || Boolean(driveId),
        esYoutube: Boolean(youtubeId)
      };
    })
    .filter(item => item.tipo && item.url);

  if (!elementos.length) return;

  indicadores.innerHTML = "";
  interior.innerHTML = "";

  elementos.forEach((item, indice) => {
    const slide = document.createElement("div");
    slide.className = "carousel-item";

    if (indice === 0) slide.classList.add("active");

    if (item.tipo === "img" || item.tipo === "imagen") {
      slide.setAttribute("data-bs-interval", "6000");

      const imagen = document.createElement("img");
      imagen.alt = "Entrenamiento de Arqueros CEYFA";

      if (item.esDrive && item.driveId) {
        imagen.src = obtenerImagenDrive(item.driveId);
      } else {
        imagen.src = item.url;
      }

      slide.appendChild(imagen);
    }

    else if (item.tipo === "video") {
      slide.setAttribute("data-bs-interval", "false");

      if (item.esYoutube && item.youtubeId) {
        const iframe = document.createElement("iframe");

        iframe.src =
        `https://www.youtube.com/embed/${item.youtubeId}` +
        `?autoplay=1` +
        `&mute=1` +
        `&loop=1` +
        `&playlist=${item.youtubeId}` +
        `&playsinline=1` +
        `&controls=0` +
        `&disablekb=1` +
        `&fs=0` +
        `&rel=0` +
        `&modestbranding=1`;

        iframe.setAttribute(
          "allow",
          "autoplay; encrypted-media; picture-in-picture; fullscreen"
        );
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("frameborder", "0");
        iframe.style.width = "100%";
        iframe.style.height = "100%";

        slide.appendChild(iframe);
      }

      else if (item.esDrive && item.driveId) {
        const video = document.createElement("video");
        video.src = `https://googleapis.com/drive/v3/files/${item.driveId}?key=${API_KEY}&alt=media`;

        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute("preload", "metadata");
        video.setAttribute("loop", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        
        if (indice === 0) {
          video.autoplay = true;
          video.setAttribute("autoplay", "");
        }

        slide.appendChild(video);
      }

      else {
        const video = document.createElement("video");

        video.src = item.url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;

        video.setAttribute("autoplay", "");
        video.setAttribute("loop", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");

        slide.appendChild(video);
      }
    }

    else {
      return;
    }

    const boton = document.createElement("button");

    boton.type = "button";
    boton.setAttribute("data-bs-target", "#carouselEscuela");
    boton.setAttribute("data-bs-slide-to", indice);
    boton.setAttribute("aria-label", "Slide " + (indice + 1));

    if (indice === 0) {
      boton.classList.add("active");
      boton.setAttribute("aria-current", "true");
    }

    indicadores.appendChild(boton);
    interior.appendChild(slide);
  });
}

function renderizarFundamentos(fundamentos) {
  const carrusel = document.getElementById("carouselFundamentos");
  if (!carrusel) return;

  const elementos = fundamentos
    .map(item => {
      const tipo = normalizarTexto(item.tipo ?? item.Tipo);
      const url = limpiarTexto(item.url ?? item.Url);
      const driveId = limpiarTexto(item.driveId) || obtenerIdDrive(url);
      const youtubeId = obtenerIdYoutube(url);

      return {
        tipo,
        url,
        driveId,
        youtubeId,
        esDrive: item.esDrive === true || Boolean(driveId),
        esYoutube: Boolean(youtubeId)
      };
    })
    .filter(item => item.tipo && item.url);

  if (!elementos.length) return;

  carrusel.innerHTML = "";

  elementos.forEach((item, indice) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "card-custom card-media";

    if (indice === 0) tarjeta.classList.add("first-card");
    if (indice === elementos.length - 1) tarjeta.classList.add("last-card");

    if (item.tipo === "img" || item.tipo === "imagen") {
      const imagen = document.createElement("img");

      imagen.alt = "Entrenamiento de goleros CEYFA UY";
      imagen.src = item.esDrive && item.driveId
        ? obtenerImagenDrive(item.driveId)
        : item.url;

      tarjeta.appendChild(imagen);
    }

    else if (item.tipo === "video") {
      if (item.esYoutube && item.youtubeId) {
        const iframe = document.createElement("iframe");

        iframe.src =
          `https://www.youtube.com/embed/${item.youtubeId}` +
          `?autoplay=1` +
          `&mute=1` +
          `&loop=1` +
          `&playlist=${item.youtubeId}` +
          `&playsinline=1` +
          `&controls=0` +
          `&disablekb=1` +
          `&fs=0` +
          `&rel=0` +
          `&modestbranding=1`;

        iframe.setAttribute(
          "allow",
          "autoplay; encrypted-media; picture-in-picture; fullscreen"
        );
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("frameborder", "0");
        iframe.style.width = "100%";
        iframe.style.height = "100%";

        tarjeta.appendChild(iframe);
      }

      else if (item.esDrive && item.driveId) {
        const iframe = document.createElement("iframe");

        iframe.src = obtenerPreviewDrive(item.driveId);
        iframe.setAttribute("allow", "autoplay; fullscreen");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("frameborder", "0");
        iframe.style.width = "100%";
        iframe.style.height = "100%";

        tarjeta.appendChild(iframe);
      }

      else {
        const video = document.createElement("video");

        video.src = item.url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;

        video.setAttribute("autoplay", "");
        video.setAttribute("loop", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");

        tarjeta.appendChild(video);
      }
    }

    else {
      return;
    }

    carrusel.appendChild(tarjeta);
  });

  carrusel.scrollLeft = 0;
}

function renderizarEquipo(equipo) {
  const carrusel = document.getElementById("carouselEquipo");
  if (!carrusel) return;

  const integrantes = equipo.filter(item => limpiarTexto(item.nombre));
  if (!integrantes.length) return;

  carrusel.innerHTML = "";

  integrantes.forEach((persona, indice) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "card-custom card-media";

    if (indice === 0) tarjeta.classList.add("first-card");
    if (indice === integrantes.length - 1) tarjeta.classList.add("last-card");

    const imagen = document.createElement("img");
    const fotoDriveId = limpiarTexto(persona.fotoDriveId) || obtenerIdDrive(persona.fotoUrl);

    imagen.src = fotoDriveId
      ? obtenerImagenDrive(fotoDriveId)
      : limpiarTexto(persona.fotoUrl);

    imagen.alt = limpiarTexto(persona.nombre);

    tarjeta.appendChild(imagen);

    const overlay = document.createElement("div");
    overlay.className = "card-img-overlay";

    overlay.innerHTML = `
      <h5 class="card-title">${escaparHtml(persona.nombre)}</h5>
      <span class="tag-custom tag-primary-custom">${escaparHtml(persona.equipo)}</span>
    `;

    tarjeta.appendChild(overlay);

    const vinculo = limpiarTexto(persona.vinculo);

    if (vinculo) {
      tarjeta.style.cursor = "pointer";

      tarjeta.addEventListener("click", () => {
        window.open(vinculo, "_blank", "noopener,noreferrer");
      });
    }

    carrusel.appendChild(tarjeta);
  });

  carrusel.scrollLeft = 0;
}

function renderizarSedes(sedes) {
  const seccion = document.getElementById("sedes-section");
  if (!seccion) return;

  const contenedor = seccion.querySelector(".row.row-cols-1.row-cols-md-2.row-cols-lg-3.g-3");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  sedes.forEach(sede => {
    const horarios = Array.isArray(sede.horarios) ? sede.horarios : [];
    const diasFiltro = obtenerDiasFiltro(horarios);

    const columna = document.createElement("div");
    columna.className = "col sede";
    columna.setAttribute("data-days", diasFiltro);

    const horariosHtml = horarios
      .map(horario => {
        const tipo = limpiarTexto(horario.tipo);
        const esAvanzado = normalizarTexto(tipo).includes("avanz");

        return `
          <div class="card-row-item${esAvanzado ? " relevant" : ""}">
            <div class="box-column-custom">
              <span class="card-day">${escaparHtml(horario.dia)}</span>

              <span class="card-session">
                ${esAvanzado ? '<i class="bi bi-lightning-charge-fill me-1"></i>' : ""}
                ${escaparHtml(tipo)}
              </span>
            </div>

            <span class="tag-custom tag-primary-custom">
              ${escaparHtml(horario.hora)}
            </span>
          </div>
        `;
      })
      .join("");

    const mapa = limpiarTexto(sede.mapa);

    columna.innerHTML = `
      <div class="card-custom card-motion card-layout-custom card-sede">

        <div class="card-header-grid sede-holder">

          <h3 class="card-title">
            ${escaparHtml(sede.nombre)}
          </h3>

          <span class="tag-custom tag-secondary-custom">
            ${escaparHtml(sede.departamento)}
          </span>

          <p class="card-name">
            ${escaparHtml(sede.complejo)}
          </p>

          <p class="card-address">
            <i class="bi bi-geo-alt me-1"></i>
            ${escaparHtml(sede.direccion)}
          </p>

        </div>

        <div class="box-custom box-column-custom">

          ${horariosHtml}

          ${
            mapa
              ? `
                <a
                  href="${escaparHtml(mapa)}"
                  class="link-action-custom"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver mapa
                  <i class="bi bi-arrow-up-right ms-1"></i>
                </a>
              `
              : ""
          }

        </div>

      </div>
    `;

    contenedor.appendChild(columna);
  });

  inicializarFiltrosSedesDinamicos();
}

function inicializarFiltrosSedesDinamicos() {
  const botonera = document.getElementById("contenedor-filtro");
  if (!botonera) return;

  const botones = botonera.querySelectorAll(".btn-filter");

  botones.forEach(boton => {
    if (boton.dataset.dinamicoActivo === "true") return;

    boton.dataset.dinamicoActivo = "true";

    boton.addEventListener("click", () => {
      const dia = boton.getAttribute("data-day");

      const tarjetas = document.querySelectorAll(
        "#sedes-section .col.sede"
      );

      tarjetas.forEach(tarjeta => {
        const dias = limpiarTexto(
          tarjeta.getAttribute("data-days")
        )
          .split(",")
          .filter(Boolean);

        const mostrar = dia === "all" || dias.includes(dia);

        if (mostrar) {
          tarjeta.style.display = "block";

          requestAnimationFrame(() => {
            tarjeta.style.opacity = "1";
            tarjeta.style.transform = "translateY(0) scale(1)";
          });
        }

        else {
          tarjeta.style.opacity = "0";
          tarjeta.style.transform = "translateY(10px) scale(0.98)";

          setTimeout(() => {
            if (tarjeta.style.opacity === "0") {
              tarjeta.style.display = "none";
            }
          }, 300);
        }
      });
    });
  });
}

function actualizarSelectSedes(sedes) {
  const select = document.getElementById("select-sede");
  if (!select) return;

  const opcionInicial = select.querySelector('option[value=""]');
  select.innerHTML = "";

  if (opcionInicial) {
    select.appendChild(opcionInicial);
  }

  else {
    const opcion = document.createElement("option");

    opcion.value = "";
    opcion.disabled = true;
    opcion.selected = true;
    opcion.hidden = true;
    opcion.textContent = "Elegí la sede de tu preferencia";

    select.appendChild(opcion);
  }

  sedes.forEach(sede => {
    const opcion = document.createElement("option");

    opcion.value = normalizarTexto(sede.nombre).replace(/\s+/g, "-");

    const complejo = limpiarTexto(sede.complejo);

    opcion.textContent = complejo
      ? `${sede.nombre} (${complejo})`
      : sede.nombre;

    select.appendChild(opcion);
  });
}

function obtenerIconoPlan(nivel, indice) {
  const nombre = normalizarTexto(nivel);

  if (nombre.includes("basic")) return "shield";
  if (nombre.includes("popular")) return "star";
  if (nombre.includes("avanz")) return "lightning-charge";
  if (nombre.includes("pro")) return "trophy";
  if (nombre.includes("elite")) return "award";

  const iconos = [
    "shield",
    "star",
    "lightning-charge",
    "trophy",
    "award"
  ];

  return iconos[indice % iconos.length];
}

function renderizarPlanes(planes) {
  const seccion = document.getElementById("planes-section");
  if (!seccion) return;

  const contenedor = seccion.querySelector(".grid-planes-pc");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  planes.forEach((plan, indice) => {
    const columna = document.createElement("div");
    columna.className = "col";
  
    const valorDestacado = normalizarTexto(plan.destacado);
    const esDestacado =
      valorDestacado === "si" ||
      valorDestacado === "true" ||
      valorDestacado === "1";
  
    let nombrePlan = limpiarTexto(plan.nivel);
  
    if (
      normalizarTexto(nombrePlan) === "medio" ||
      normalizarTexto(nombrePlan) === "popular"
    ) {
      nombrePlan = esDestacado ? "Popular" : "Medio";
    }
  
    const wrapper = document.createElement("div");
    wrapper.className = "plan";
    wrapper.setAttribute("data-category", nombrePlan);
  
    if (esDestacado) {
      wrapper.classList.add("active");
    }
  
    const icono = obtenerIconoPlan(nombrePlan, indice);
    const cantidadSemana = Number(plan.cantidadSemana);
  
    const textoVeces = cantidadSemana === 1
      ? "1 VEZ"
      : `${cantidadSemana} VECES`;
  
    const precioDia = formatearPrecio(plan.precioDia);
    const precioMes = formatearPrecio(plan.precioMes);
  
    wrapper.innerHTML = `
      <div
        class="card-custom card-layout-custom card-plan"
        onclick="selectPlan(this)"
      >
        <div class="card-header-grid plan-holder">
          <span class="tag-custom tag-secondary-custom">
            ${escaparHtml(nombrePlan)}
          </span>
          <div class="btn-form-custom">
            <i class="bi bi-${icono} icon-line"></i>
            <i class="bi bi-${icono}-fill icon-fill"></i>
          </div>
          <p class="price-unit">
            POR CLASE
          </p>
          <h3 class="price-day">
            ${precioDia}
          </h3>
        </div>
        <div class="box-custom box-column-custom">
          <div class="card-row-item">
            <h6>
              ${textoVeces}
              <span>x semana</span>
            </h6>
            <p>
              ${escaparHtml(plan.cantidadMes)}
              <span>x mes</span>
            </p>
          </div>
          <p class="price-month">
            Total: ${precioMes}/mes
          </p>
        </div>
      </div>
    `;
  
    columna.appendChild(wrapper);
    contenedor.appendChild(columna);
  });
}

function renderizarEvento(evento) {
  const seccion = document.getElementById("evento-section");
  if (!seccion) return;

  const valores = seccion.querySelectorAll(".value-custom");

  if (valores[0]) {
    valores[0].textContent = formatearFechaVisible(evento.fecha);
  }

  if (valores[1]) {
    valores[1].textContent = limpiarTexto(evento.hora);
  }

  if (valores[2]) {
    valores[2].textContent = limpiarTexto(evento.sede);
  }

  const mapa = seccion.querySelector(
    ".box-grid-custom .link-action-custom"
  );

  if (mapa) {
    const urlMapa = limpiarTexto(evento.mapa);

    if (urlMapa) {
      mapa.href = urlMapa;
      mapa.style.display = "";
    } else {
      mapa.style.display = "none";
    }
  }

  const botonDocumento = seccion.querySelector(
    ".btn-secondary-custom"
  );

  if (botonDocumento) {
    const enlaceDocumento = obtenerEnlaceDrive(
      evento.documentoDriveId,
      evento.documentoUrl
    );

    if (enlaceDocumento) {
      botonDocumento.href = enlaceDocumento;
      botonDocumento.style.display = "";
    } else {
      botonDocumento.style.display = "none";
    }
  }

  const botonWhatsapp = seccion. querySelector(".btn-primary-custom");

  if (botonWhatsapp && evento) {
      const fechaEvento = formatearFechaVisible(evento.fecha) || "Próxima fecha";
      const horaEvento = limpiarTexto(evento.hora) || "A confirmar";
      const sedeEvento = limpiarTexto(evento.sede) || "A confirmar";
      const textoMensaje = `¡Hola CEYFA UY!
      Quiero inscribirme a la próxima Clínica de Goleros:
      Fecha: ${fechaEvento}
      Horario: ${horaEvento}
      Sede: ${sedeEvento}
      ¿Me podrían pasar los detalles para asegurar mi lugar? ¡Gracias!`;
        botonWhatsapp.href = `https://wa.me/${WHATSAPP_CEYFA}?text=${encodeURIComponent(textoMensaje)}`;
  }

  const cardEvento = seccion.querySelector(".card-evento");

  if (cardEvento) {
    const videoViejo = cardEvento.querySelector("video");
    const iframeViejo = cardEvento.querySelector("iframe");
  
    if (videoViejo) videoViejo.remove();
    if (iframeViejo) iframeViejo.remove();
  
    const videoUrl = limpiarTexto(evento.videoUrl);
    const driveId = limpiarTexto(evento.videoDriveId) || obtenerIdDrive(videoUrl);
    const youtubeId = obtenerIdYoutube(videoUrl);
  
    if (youtubeId) {
      const iframe = document.createElement("iframe");
  
      iframe.src =
        `https://www.youtube.com/embed/${youtubeId}` +
        `?autoplay=1` +
        `&mute=1` +
        `&loop=1` +
        `&playlist=${youtubeId}` +
        `&playsinline=1` +
        `&controls=0` +
        `&disablekb=1` +
        `&fs=0` +
        `&rel=0` +
        `&modestbranding=1`;
  
      iframe.setAttribute(
        "allow",
        "autoplay; encrypted-media; picture-in-picture; fullscreen"
      );
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("frameborder", "0");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
  
      cardEvento.prepend(iframe);
    }
  
    else if (driveId) {
      const iframe = document.createElement("iframe");
  
      iframe.src = obtenerPreviewDrive(driveId);
      iframe.setAttribute("allow", "autoplay; fullscreen");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("frameborder", "0");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
  
      cardEvento.prepend(iframe);
    }
  
    else if (videoUrl) {
      const video = document.createElement("video");
  
      video.src = videoUrl;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
  
      video.setAttribute("autoplay", "");
      video.setAttribute("loop", "");
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
  
      cardEvento.prepend(video);
    }
  
    const tags = cardEvento.querySelectorAll(
      ".tag-floating .tag-custom"
    );
  
    if (tags[0]) {
      tags[0].textContent = limpiarTexto(
        evento.departamento
      );
    }
  
    if (tags[1]) {
      if (evento.inscripcionesAbiertas) {
        tags[1].innerHTML = `
          <span class="pulse-dot-live me-2"></span>
          ¡Inscripciones Abiertas!
        `;
  
        tags[1]
          .closest(".tag-floating")
          .style.display = "";
      }
  
      else {
        tags[1].innerHTML = "Inscripciones cerradas";
      }
    }
  }
}

function actualizarMarqueeEvento(evento) {
  const fecha = formatearFechaVisible(evento.fecha);
  const hora = limpiarTexto(evento.hora);
  const sede = limpiarTexto(evento.sede);

  let mensaje = "PROXIMA CLINICA DE GOLEROS";

  if (fecha) mensaje += ": " + fecha;
  if (hora) mensaje += " · " + hora;
  if (sede) mensaje += " · " + sede;

  const construirContenido = () => {
    return `
      <i class="bi bi-info-square-fill"></i>
      ${escaparHtml(mensaje)}
      <span></span>

      <i class="bi bi-info-square-fill"></i>
      ${escaparHtml(mensaje)}
      <span></span>

      <i class="bi bi-info-square-fill"></i>
      ${escaparHtml(mensaje)}
      <span></span>
    `;
  };

  const real = document.getElementById("marquee-texto-real");
  const espejo = document.getElementById("marquee-texto-espejo");

  if (real) real.innerHTML = construirContenido();
  if (espejo) espejo.innerHTML = construirContenido();
}

function actualizarTiendaInicio(productos) {
  const seccion = document.getElementById("tienda-section");
  if (!seccion) return;

  const disponibles = productos.filter(producto => {
    return producto.disponible !== false;
  });

  const contarCategoria = categoriaBuscada => {
    return disponibles.filter(producto => {
      const categoria = normalizarTexto(producto.categoria);
      return categoria === normalizarTexto(categoriaBuscada);
    }).length;
  };

  const cantidadCeyfa = contarCategoria("ceyfa");
  const cantidadGuantesRg = contarCategoria("guantes-rg");
  const cantidadTodoRg = contarCategoria("todo-rg");

  const tarjetaCeyfa = seccion.querySelector(
    'a[href*="categoria=ceyfa"] .tag-secondary-custom'
  );

  const tarjetaGuantesRg = seccion.querySelector(
    'a[href*="categoria=guantes-rg"] .tag-secondary-custom'
  );

  const tarjetaTodoRg = seccion.querySelector(
    'a[href*="categoria=todo-rg"] .tag-secondary-custom'
  );

  if (tarjetaCeyfa) {
    tarjetaCeyfa.textContent = `${cantidadCeyfa} PRODUCTOS`;
  }

  if (tarjetaGuantesRg) {
    tarjetaGuantesRg.textContent = `${cantidadGuantesRg} PRODUCTOS`;
  }

  if (tarjetaTodoRg) {
    tarjetaTodoRg.textContent = `${cantidadTodoRg} PRODUCTOS`;
  }
}

function renderizarMarcas(marcas) {
  const contenidos = document.querySelectorAll(
    ".marquee-content-sponsors"
  );

  if (!contenidos.length) return;

  const construirMarcas = () => {
    const fragmento = document.createDocumentFragment();

    for (let repeticion = 0; repeticion < 2; repeticion++) {
      marcas.forEach(marca => {
        const item = document.createElement("div");
        item.className = "marquee-item-sponsor";

        const imagen = document.createElement("img");

        const driveId = limpiarTexto(marca.logoDriveId) ||
          obtenerIdDrive(marca.logoUrl);

        imagen.src = driveId
          ? obtenerImagenDrive(driveId, 800)
          : limpiarTexto(marca.logoUrl);

        imagen.alt = limpiarTexto(marca.nombre);

        item.appendChild(imagen);
        fragmento.appendChild(item);
      });
    }

    return fragmento;
  };

  contenidos.forEach(contenido => {
    contenido.innerHTML = "";
    contenido.appendChild(construirMarcas());
  });
}

function renderizarFooter(footer) {
  const pie = document.getElementById("pie-pagina");
  if (!pie) return;

  const enlace = pie.querySelector(".link-doc-custom");
  if (!enlace) return;

  const documento = footer[0];
  if (!documento) return;

  const url = obtenerEnlaceDrive(
    documento.documentoDriveId,
    documento.documentoUrl
  );

  if (url) {
    enlace.href = url;
  }

  const etiqueta = enlace.querySelector(".pdf-btn-lbl");

  if (etiqueta) {
    etiqueta.innerHTML = `
      ${escaparHtml(documento.nombre)}
      <i class="bi bi-file-earmark-pdf ms-2"></i>
    `;
  }
}

document.addEventListener(
  "DOMContentLoaded",
  cargarDatos
);
