const filtrosTimeouts = new Map();

/* MENÚ DE NAVEGACIÓN */
function activarScrollSpyMenu() {
  const secciones = document.querySelectorAll("section[id]");
  const enlacesMenu = document.querySelectorAll("#menu-principal .navbar-nav .nav-link");
  if (secciones.length === 0 || enlacesMenu.length === 0) return;
  const opcionesObserver = {
    root: null,
    rootMargin: "-30% 0px -50% 0px", 
    threshold: 0
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idSeccionActiva = entry.target.getAttribute("id");
        enlacesMenu.forEach((enlace) => {
          enlace.classList.remove("active");
          if (enlace.getAttribute("href") === `#${idSeccionActiva}`) {
            enlace.classList.add("active");
          }
        });
      }
    });
  }, opcionesObserver);
  secciones.forEach((seccion) => observer.observe(seccion));
}
function inicializarBloqueoScrollMenu() {
  const navbarCollapse = document.getElementById("navbarNav");
  if (!navbarCollapse) return;
  navbarCollapse.addEventListener("show.bs.collapse", function () {
    if (window.innerWidth < 768) {
      document.body.classList.add("menu-abierto-block");
    }
  });
  navbarCollapse.addEventListener("hide.bs.collapse", function () {
    document.body.classList.remove("menu-abierto-block");
  });
  const enlacesMenu = navbarCollapse.querySelectorAll(".nav-link");
  enlacesMenu.forEach((enlace) => {
    enlace.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        const bootstrapCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bootstrapCollapse) {
          bootstrapCollapse.hide();
        }
      }
    });
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 768) {
      document.body.classList.remove("menu-abierto-block");
    }
  });
}

/* CARRUSELES HORIZONTALES */
function inicializarControlesCarrusel(carruselId) {
  const carousel = document.getElementById(carruselId);
  if (!carousel) return;
  const btnPrev = document.querySelector(`.btn-prev[data-carrusel-id="${carruselId}"]`);
  const btnNext = document.querySelector(`.btn-next[data-carrusel-id="${carruselId}"]`);
  if (!btnPrev || !btnNext) return;
  const firstCard = carousel.querySelector(".first-card, .card-custom:first-child");
  const lastCard = carousel.querySelector(".last-card, .card-custom:last-child");
  function getScrollAmount() {
    const anyCard = carousel.querySelector(".card-custom, .card-media");
    return anyCard ? anyCard.offsetWidth + 15 : 265;
  }
  btnNext.addEventListener("click", () => { carousel.scrollLeft += getScrollAmount(); });
  btnPrev.addEventListener("click", () => { carousel.scrollLeft -= getScrollAmount(); });
  const observerOptions = { root: carousel, threshold: 0.95 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target === firstCard) {
        if (entry.isIntersecting) {
          btnPrev.classList.add("disabled");
          btnPrev.setAttribute("disabled", "true");
        } else {
          btnPrev.classList.remove("disabled");
          btnPrev.removeAttribute("disabled");
        }
      }
      if (entry.target === lastCard) {
        if (entry.isIntersecting) {
          btnNext.classList.add("disabled");
          btnNext.setAttribute("disabled", "true");
        } else {
          btnNext.classList.remove("disabled");
          btnNext.removeAttribute("disabled");
        }
      }
    });
  }, observerOptions);
  if (firstCard) observer.observe(firstCard);
  if (lastCard) observer.observe(lastCard);
}

/* SEDES FILTROS */
function inicializarFiltrosSedes() {
  const botonera = document.getElementById("contenedor-filtro");
  if (!botonera) return;
  const botones = botonera.querySelectorAll(".btn-filter");
  const tarjetasSedes = document.querySelectorAll(".col.sede");
  botones.forEach((button) => {
    button.addEventListener("click", () => {
      botones.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const selectedDay = button.getAttribute("data-day");
      tarjetasSedes.forEach((card) => {
        const cardDays = card.getAttribute("data-days") ? card.getAttribute("data-days").split(",") : [];
        if (filtrosTimeouts.has(card)) {
          clearTimeout(filtrosTimeouts.get(card));
          filtrosTimeouts.delete(card);
        }
        const debieseEstarVisible = selectedDay === "all" || cardDays.includes(selectedDay);
        if (debieseEstarVisible) {
          card.style.display = "block";
          const showTimeout = setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0) scale(1)";
          }, 30);
          filtrosTimeouts.set(card, showTimeout);
        } else {
          card.style.opacity = "0";
          card.style.transform = "translateY(10px) scale(0.98)";
          const hideTimeout = setTimeout(() => {
            card.style.display = "none";
          }, 300);
          filtrosTimeouts.set(card, hideTimeout);
        }
      });
    });
  });
}

/* PLANES */
function selectPlan(cardElement) {
  const wrapper = cardElement.closest(".plan");
  if (!wrapper || wrapper.classList.contains("active")) return;
  document.querySelectorAll(".plan").forEach((el) => {
    el.classList.remove("active");
    if (el.getAttribute("data-category") === "Popular") {
      const badge = el.querySelector(".tag-secondary-custom");
      if (badge) badge.textContent = "MEDIO";
    }
  });
  wrapper.classList.add("active");
  if (wrapper.getAttribute("data-category") === "Popular") {
    const badge = wrapper.querySelector(".tag-secondary-custom");
    if (badge) badge.textContent = "POPULAR";
  }
}

/* CONTACTO */
function inicializarValidadorContacto() {
  const formulario = document.getElementById("form-contacto-ceyfa");
  if (!formulario) return;
  formulario.addEventListener("submit", function (event) {
    event.preventDefault();
    event.stopPropagation();
    const inputEmail = document.getElementById("input-email");
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (inputEmail && inputEmail.value.trim() !== "" && !regexCorreo.test(inputEmail.value.trim())) {
      inputEmail.setCustomValidity("Invalido");
    } else if (inputEmail) {
      inputEmail.setCustomValidity("");
    }
    if (!formulario.checkValidity()) {
      formulario.classList.add("was-validated");
      return;
    }
    formulario.classList.add("was-validated");
    ejecutarDesvioWhatsApp();
  });
}
function ejecutarDesvioWhatsApp() {
  const nombre = document.getElementById("input-nombre").value.trim();
  const selectSede = document.getElementById("select-sede");
  const sedeTexto = selectSede.options[selectSede.selectedIndex].text;
  const telefono = document.getElementById("input-telefono").value.trim();
  const email = document.getElementById("input-email").value.trim() || "No especificado";
  const mensaje = document.getElementById("input-mensaje").value.trim() || "Sin comentarios adicionales.";
  const numeroWhatsApp = "59899449480"; 
  const textoMensaje = `¡Hola CEYFA UY! 🧤⚽
Quiero coordinar mi clase de prueba. Dejo mis datos:

👤 Nombre: ${nombre}
📍 Sede de Interés: ${sedeTexto}
📱 Teléfono: ${telefono}
✉️ Correo: ${email}

📝 Consulta o Experiencia:
${mensaje}`;
  const urlFinal = `https://wa.me{numeroWhatsApp}?text=${encodeURIComponent(textoMensaje)}`;
  window.open(urlFinal, "_blank");
}

/* FLOTANTE WHATSAPP */
function activarTopeWhatsAppFloating() {
  const botonFloat = document.querySelector(".btn-whatsapp-floating");
  if (!botonFloat) return;
  window.addEventListener("scroll", () => {
    const limiteScroll = document.documentElement.scrollHeight - window.innerHeight;
    const distanciaAlFondo = limiteScroll - window.scrollY;
    if (distanciaAlFondo < (70.5 + 32)) {
      const compensacionDefinitiva = (70.5 + 32) - distanciaAlFondo;
      botonFloat.style.bottom = `${compensacionDefinitiva}px`;
    } else {
      botonFloat.style.bottom = "32px"; 
    }
  });
}


/* MOTOR DE DISPARO CENTRALIZADO */
document.addEventListener("DOMContentLoaded", function () {
  activarScrollSpyMenu();
  inicializarBloqueoScrollMenu();
  inicializarControlesCarrusel('carouselFundamentos');
  inicializarControlesCarrusel('carouselEquipo');
  inicializarFiltrosSedes();
  inicializarValidadorContacto();
  activarTopeWhatsAppFloating();
});
