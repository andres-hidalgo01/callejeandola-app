// main.js - Callejeando Core Functionality
// Version completa con menú responsive, idiomas y funcionalidades

document.addEventListener('DOMContentLoaded', function () {
  console.log('🎯 Callejeando inicializado - Skate Archive');

  // ================= TOPBAR SCROLL EFFECT =================
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        topbar.classList.add('scrolled');
      } else {
        topbar.classList.remove('scrolled');
      }
    });
  }

  // ================= MENÚ MÓVIL COMPLETO =================
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const closeMobileMenu = document.getElementById('closeMobileMenu');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    console.log('📱 Menú móvil abierto');
  }

  function closeMobileMenuFunc() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('show');
    document.body.style.overflow = '';

    // Cerrar también dropdowns de idioma si están abiertos
    closeAllDropdowns();
    console.log('📱 Menú móvil cerrado');
  }

  if (navToggle) {
    navToggle.addEventListener('click', openMobileMenu);
  }

  if (closeMobileMenu) {
    closeMobileMenu.addEventListener('click', closeMobileMenuFunc);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenuFunc);
  }

  // Cerrar menú al hacer clic en enlaces
  const mobileLinks = document.querySelectorAll('.mobile-modules a, .mobile-legal a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function () {
      setTimeout(closeMobileMenuFunc, 300); // Pequeño delay para ver la transición
    });
  });

  // ================= IDIOMAS - Desktop =================
  const langToggle = document.getElementById('langToggle');
  const langDropdown = document.getElementById('langDropdown');
  const languageSelector = document.querySelector('.language-selector');

  function toggleLanguageDropdown() {
    if (languageSelector) {
      languageSelector.classList.toggle('active');
      console.log('🌍 Selector de idioma toggled');
    }
  }

  function closeLanguageDropdown() {
    if (languageSelector) {
      languageSelector.classList.remove('active');
    }
  }

  if (langToggle) {
    langToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleLanguageDropdown();
    });
  }

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', function (e) {
    if (languageSelector && !languageSelector.contains(e.target)) {
      closeLanguageDropdown();
    }
  });

  // Cambiar idioma
  const langOptions = document.querySelectorAll('.lang-option');
  langOptions.forEach(option => {
    option.addEventListener('click', function (e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');

      // Actualizar visualmente
      langOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');

      // Actualizar botón
      const flag = this.querySelector('img').src;
      const langCode = lang.toUpperCase();

      if (langToggle) {
        langToggle.querySelector('.lang-flag img').src = flag;
        langToggle.querySelector('.lang-code').textContent = langCode;
      }

      // Cerrar dropdown
      closeLanguageDropdown();

      // Aquí iría la lógica de traducción real
      console.log(`🌍 Idioma cambiado a: ${lang}`);
      // i18n.changeLanguage(lang); // Si usas i18next

      // Mostrar feedback
      showNotification(`Idioma cambiado a ${lang === 'es' ? 'Español' : 'English'}`);
    });
  });

  // ================= IDIOMAS - Mobile =================
  const mobileLangToggle = document.getElementById('mobileLangToggle');
  const mobileLangDropdown = document.getElementById('mobileLangDropdown');
  const mobileLanguage = document.querySelector('.mobile-language');
  const mobileLangOptions = document.querySelectorAll('.mobile-lang-dropdown a');

  function toggleMobileLanguageDropdown() {
    if (mobileLanguage) {
      mobileLanguage.classList.toggle('active');
    }
  }

  function closeMobileLanguageDropdown() {
    if (mobileLanguage) {
      mobileLanguage.classList.remove('active');
    }
  }

  if (mobileLangToggle) {
    mobileLangToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileLanguageDropdown();
    });
  }

  // Cambiar idioma en móvil
  mobileLangOptions.forEach(option => {
    option.addEventListener('click', function (e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');

      // Actualizar visualmente
      mobileLangOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');

      // Actualizar botón móvil
      const flag = this.querySelector('img').src;
      const langCode = lang.toUpperCase();

      if (mobileLangToggle) {
        mobileLangToggle.querySelector('img').src = flag;
        mobileLangToggle.querySelector('span').textContent = langCode;
      }

      // Cerrar dropdown
      closeMobileLanguageDropdown();

      console.log(`📱 Idioma móvil cambiado a: ${lang}`);
      showNotification(`Idioma cambiado a ${lang === 'es' ? 'Español' : 'English'}`);
    });
  });

  // Cerrar todos los dropdowns
  function closeAllDropdowns() {
    closeLanguageDropdown();
    closeMobileLanguageDropdown();
  }

  // ================= BÚSQUEDA =================
  const searchInputs = document.querySelectorAll('.topbar-search-inner input, .mobile-search input');
  const searchButtons = document.querySelectorAll('.search-icon, .mobile-search-btn');

  searchInputs.forEach(input => {
    // Buscar al presionar Enter
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        performSearch(this.value.trim());
      }
    });
  });

  searchButtons.forEach(button => {
    button.addEventListener('click', function () {
      const searchContainer = this.closest('.topbar-search-inner, .mobile-search');
      const input = searchContainer ? searchContainer.querySelector('input') : null;
      if (input && input.value.trim()) {
        performSearch(input.value.trim());
      } else {
        input?.focus();
      }
    });
  });

  function performSearch(query) {
    if (!query) return;

    console.log(`🔍 Búsqueda realizada: "${query}"`);

    // Redirigir a spots con parámetro de búsqueda
    // En un proyecto real, esto sería más complejo
    if (query.toLowerCase().includes('spot') || query.toLowerCase().includes('parque')) {
      window.location.href = `pages/spots.html?search=${encodeURIComponent(query)}`;
    } else if (query.toLowerCase().includes('event') || query.toLowerCase().includes('compet')) {
      window.location.href = `pages/eventos.html?search=${encodeURIComponent(query)}`;
    } else {
      // Búsqueda general
      window.location.href = `pages/spots.html?search=${encodeURIComponent(query)}`;
    }
  }

  // ================= CARDS INTERACTIVAS =================
  // Efectos hover para tarjetas de acceso
  const accessCards = document.querySelectorAll('.access-card');
  accessCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)';
    });
  });

  // Preview de spots clickeable
  const spotCards = document.querySelectorAll('.spot-preview-card');
  spotCards.forEach(card => {
    card.style.cursor = 'pointer';

    card.addEventListener('click', function () {
      const title = this.querySelector('h4').textContent;
      console.log(`📍 Spot clickeado: ${title}`);

      // Aquí normalmente redirigirías a la página del spot
      // window.location.href = `pages/spot-detail.html?id=${spotId}`;

      // Por ahora, solo mostramos un mensaje
      showNotification(`Redirigiendo a ${title}...`);
    });
  });

  // ================= FAQ INTERACTIVO =================
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', function () {
      const item = this.parentElement;
      item.classList.toggle('active');
    });
  });

  // ================= FORMULARIOS =================
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      const originalBg = submitBtn.style.background;

      // Simular envío
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      submitBtn.style.background = '#6b7280';

      setTimeout(() => {
        submitBtn.textContent = '¡Enviado!';
        submitBtn.style.background = '#10b981';

        // Reset después de 2 segundos
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = originalBg;
          form.reset();
        }, 2000);
      }, 1000);

      console.log('📝 Formulario enviado');
    });
  });

  // ================= NOTIFICACIONES =================
  function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    // Estilos básicos
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--card-bg);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius);
      border-left: 4px solid var(--lime);
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: slideIn 0.3s ease;
    `;

    // Botón cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
      background: transparent;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      margin-left: 1rem;
    `;

    closeBtn.addEventListener('click', () => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    });

    document.body.appendChild(notification);

    // Auto-remover después de 4 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, 4000);

    // Animaciones CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // ================= SMOOTH SCROLL =================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();

        const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 72;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - topbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        console.log(`🔗 Scroll suave a: ${href}`);
      }
    });
  });

  // ================= ANIMACIONES AL SCROLL =================
  const animatedElements = document.querySelectorAll('.access-card, .spot-preview-card, .why-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));

  // ================= IDIOMA EN FOOTER =================
  const footerLangToggle = document.getElementById('footerLangToggle');
  if (footerLangToggle) {
    footerLangToggle.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        // En móvil, abrir el menú móvil de idioma
        if (mobileLangToggle) {
          mobileLangToggle.click();
        }
      } else {
        // En desktop, abrir el dropdown de idioma
        if (langToggle) {
          langToggle.click();
        }
      }
    });
  }

  // ================= INICIALIZACIÓN COMPLETA =================
  console.log('✅ Callejeando completamente inicializado');
  console.log('🌍 Idiomas: Español (default), English');
  console.log('📱 Menú responsive activado');
  console.log('🔍 Búsqueda funcional');
  console.log('✨ Animaciones activadas');
});