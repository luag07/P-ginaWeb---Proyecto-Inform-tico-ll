/* CARRUSEL INTERACTIVO — Gestiona la navegación de imágenes múltiples
   - Inicializa un carrusel para cada elemento .carrusel en la página
   - Permite navegar con flechas, puntos y teclado
   - Implementa accesibilidad ARIA */
   function initCarousels() {
    document.querySelectorAll('.carrusel').forEach(carousel => {
  
      // Contenedor de diapositivas e imágenes del carrusel
      const slides = carousel.querySelector('.diapositivas');
      const imgs = Array.from(slides.querySelectorAll('img'));
      if (imgs.length <= 1) { return; } // Sin múltiples imágenes → no inicia carrusel
      let idx = 0;
  
      // Ajuste del ancho total del carrusel según la cantidad de imágenes
      slides.style.width = `${imgs.length * 100}%`;
      imgs.forEach(img => { img.style.flex = `0 0 ${100 / imgs.length}%`; });
  
      // Puntos indicadores inferiores
      const dotsWrap = carousel.querySelector('.puntos');
      imgs.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'punto-btn';
        b.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
        if (i === 0) b.classList.add('activo');
        b.addEventListener('click', () => { idx = i; update(); });
        dotsWrap.appendChild(b);
      });
  
      // Botones de navegación (anterior / siguiente)
      const prev = carousel.querySelector('.boton-carrusel.anterior');
      const next = carousel.querySelector('.boton-carrusel.siguiente');
      prev.addEventListener('click', () => { idx = (idx - 1 + imgs.length) % imgs.length; update(); });
      next.addEventListener('click', () => { idx = (idx + 1) % imgs.length; update(); });
  
      // Actualiza el desplazamiento visible del carrusel y los puntos activos
      function update() {
        slides.style.transform = `translateX(-${idx * (100 / imgs.length)}%)`;
        const dots = dotsWrap.querySelectorAll('button');
        dots.forEach((d, i) => d.classList.toggle('activo', i === idx));
      }
  
      // Navegación con teclado (flechas izquierda/derecha)
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { idx = (idx - 1 + imgs.length) % imgs.length; update(); }
        if (e.key === 'ArrowRight') { idx = (idx + 1) % imgs.length; update(); }
      });
  
      // Aplica el estado inicial del carrusel
      update();
    });
  }
  
  /*  CONFIGURACIÓN INICIAL DEL DOCUMENTO
     - Define claves de almacenamiento local
     - Inicializa variables globales
     - Obtiene elementos del DOM para la interacción */
  document.addEventListener('DOMContentLoaded', () => {
  
    // Claves para localStorage
    const KEYS = { CART: 'vmt_cart_v1', USERS: 'vmt_users_v1', LOGGED: 'vmt_logged_v1', CURRENT: 'vmt_current_v1' };
  
    // Estado principal del carrito
    let cart = loadCart();
  
    // Elementos del DOM usados por el sistema
    const cartBtn = document.getElementById('cartBtn');
    const cartDropdown = document.getElementById('cartDropdown');
    const overlay = document.getElementById('pageOverlay');
    const cartBg = document.getElementById('cartBg');
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('mainNav');
  
    // Elementos para login/registro
    const authUser = document.getElementById('authUser');
    const authPass = document.getElementById('authPass');
    const btnLogin = document.getElementById('btnLogin');
    const btnRegister = document.getElementById('btnRegister');
    const authMsg = document.getElementById('authMsg');
    const loginState = document.getElementById('loginState');
    const btnLogout = document.getElementById('btnLogout');
  
    // Envíos
    const localidadSelect = document.getElementById('localidad');
    const calcularEnvioBtn = document.getElementById('calcularEnvio');
    const resultadoEnvio = document.getElementById('resultadoEnvio');
    const explicacionEnvio = document.getElementById('explicacionEnvio');
    const resetEnvioBtn = document.getElementById('resetEnvio');
  
    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
  
    /* FUNCIONES AUXILIARES DEL ALMACENAMIENTO LOCAL */
    function loadCart() { try { return JSON.parse(localStorage.getItem(KEYS.CART)) || []; } catch (e) { return []; } }
    function saveCart() { localStorage.setItem(KEYS.CART, JSON.stringify(cart)); }
    function loadUsers() { try { return JSON.parse(localStorage.getItem(KEYS.USERS)) || []; } catch (e) { return []; } }
    function saveUsers(users) { localStorage.setItem(KEYS.USERS, JSON.stringify(users)); }
    function isLogged() { return localStorage.getItem(KEYS.LOGGED) === 'true'; }
    function currentUser() { return localStorage.getItem(KEYS.CURRENT) || null; }
    function setLogged(username) { localStorage.setItem(KEYS.LOGGED, 'true'); localStorage.setItem(KEYS.CURRENT, username); }
    function clearLogged() { localStorage.setItem(KEYS.LOGGED, 'false'); localStorage.removeItem(KEYS.CURRENT); }
  
    /* MENÚ MÓVIL — Botón hamburguesa y accesibilidad */
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        mainNav.classList.remove('show');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      } else {
        mainNav.classList.add('show');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
      }
    });
  
    // Cerrar menú tras seleccionar un enlace
    mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      if (mainNav.classList.contains('show')) {
        mainNav.classList.remove('show');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }));
  
    /* CARRITO — Cálculo del subtotal y render dinámico del contenido */
    function computeSubtotal() { return cart.reduce((s, it) => s + it.price * it.qty, 0); }
  
    function renderCart() {
      const totalItems = cart.reduce((s, it) => s + it.qty, 0);
      cartCount.textContent = totalItems;
      cartSubtotal.textContent = '$' + computeSubtotal().toLocaleString('es-AR');
      cartItems.innerHTML = '';
  
      // Carrito vacío
      if (cart.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'El carrito está vacío.';
        cartItems.appendChild(li);
        return;
      }
  
      // Render individual por item
      cart.forEach((it, idx) => {
        const li = document.createElement('li');
  
        // Datos del producto
        const meta = document.createElement('div');
        meta.style.display = 'flex';
        meta.style.flexDirection = 'column';
  
        const name = document.createElement('div');
        name.innerHTML = `<strong>${it.name}</strong>`;
        const price = document.createElement('div');
        price.className = 'muted';
        price.style.fontSize = '0.9rem';
        price.textContent = '$' + it.price.toLocaleString('es-AR');
  
        meta.appendChild(name);
        meta.appendChild(price);
  
        // Controles de cantidad y total
        const right = document.createElement('div');
        right.style.display = 'flex';
        right.style.flexDirection = 'column';
        right.style.alignItems = 'flex-end';
        right.style.gap = '6px';
  
        const total = document.createElement('div');
        total.textContent = '$' + (it.price * it.qty).toLocaleString('es-AR');
  
        const qtyWrap = document.createElement('div');
        qtyWrap.style.display = 'flex';
        qtyWrap.style.gap = '6px';
  
        const minus = document.createElement('button');
        minus.className = 'boton-pequeño';
        minus.textContent = '-';
        minus.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (it.qty > 1) it.qty--;
          else cart.splice(idx, 1);
          saveCart(); renderCart();
        });
  
        const qtyText = document.createElement('div');
        qtyText.style.minWidth = '28px';
        qtyText.style.textAlign = 'center';
        qtyText.textContent = it.qty;
  
        const plus = document.createElement('button');
        plus.className = 'boton-pequeño';
        plus.textContent = '+';
        plus.addEventListener('click', (ev) => {
          ev.stopPropagation();
          it.qty++; saveCart(); renderCart();
        });
  
        const remove = document.createElement('button');
        remove.className = 'boton-pequeño';
        remove.textContent = 'Eliminar';
        remove.addEventListener('click', (ev) => {
          ev.stopPropagation();
          cart.splice(idx, 1); saveCart(); renderCart();
        });
  
        qtyWrap.append(minus, qtyText, plus);
        right.append(total, qtyWrap, remove);
  
        li.append(meta, right);
        cartItems.appendChild(li);
      });
    }
  
    /* DESPLEGABLE DEL CARRITO — Abrir, cerrar y controlar overlay */
    cartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = cartDropdown.classList.contains('activo');
  
      if (open) {
        cartDropdown.classList.remove('activo');
        cartDropdown.setAttribute('aria-hidden', 'true');
        cartBtn.setAttribute('aria-expanded', 'false');
        overlay?.classList.remove('activo');
        overlay?.setAttribute('aria-hidden', 'true');
        cartBg?.classList.remove('activo');
        cartBg?.setAttribute('aria-hidden', 'true');
  
      } else {
        renderCart();
        cartDropdown.classList.add('activo');
        cartDropdown.setAttribute('aria-hidden', 'false');
        cartBtn.setAttribute('aria-expanded', 'true');
  
        overlay?.classList.add('activo');
        overlay?.setAttribute('aria-hidden', 'false');
  
        cartBg?.classList.add('activo');
        cartBg?.setAttribute('aria-hidden', 'false');
      }
    });
  
    // Cerrar elementos abiertos al hacer clic en el overlay
    overlay?.addEventListener('click', () => {
      if (cartDropdown.classList.contains('activo')) {
        cartDropdown.classList.remove('activo');
        cartDropdown.setAttribute('aria-hidden', 'true');
        cartBtn.setAttribute('aria-expanded', 'false');
      }
      if (mainNav.classList.contains('show')) {
        mainNav.classList.remove('show');
        hamburger.classList.remove('activo');
        hamburger.setAttribute('aria-expanded', 'false');
      }
      overlay.classList.remove('activo');
      overlay.setAttribute('aria-hidden', 'true');
      if (cartBg?.classList.contains('activo')) {
        cartBg.classList.remove('activo');
        cartBg.setAttribute('aria-hidden', 'true');
      }
    });
  
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
  
        if (cartDropdown.classList.contains('activo')) {
          cartDropdown.classList.remove('activo');
          cartDropdown.setAttribute('aria-hidden', 'true');
          cartBtn.setAttribute('aria-expanded', 'false');
        }
  
        if (overlay?.classList.contains('activo')) {
          overlay.classList.remove('activo');
          overlay.setAttribute('aria-hidden', 'true');
        }
  
        if (cartBg?.classList.contains('activo')) {
          cartBg.classList.remove('activo');
          cartBg.setAttribute('aria-hidden', 'true');
        }
      }
    });
  
    /* AGREGAR PRODUCTOS AL CARRITO */
    document.querySelectorAll('.btn-buy').forEach(btn => btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price'), 10) || 0;
  
      const existing = cart.find(i => i.name === name);
      if (existing) existing.qty++;
      else cart.push({ id: Date.now().toString(36), name, price, qty: 1 });
  
      saveCart(); renderCart();
      alert('✅ ' + name + ' agregado al carrito.');
    }));
  
    /* CALCULADORA DE ENVÍO — Distancias y costos automáticos */
    const distances = { 'Centro': 4, 'Palermo': 6, 'Belgrano': 8, 'Flores': 5, 'Caballito': 2, 'Villa_Crespo': 5.5 };
  
    calcularEnvioBtn.addEventListener('click', () => {
      const val = localidadSelect.value;
      if (!val) {
        resultadoEnvio.textContent = '⚠️ Seleccioná una localidad.';
        explicacionEnvio.textContent = '';
        return;
      }
  
      const km = distances[val] || 6;
      const base = 1500;
      const perKm = 200;
      const cost = base + Math.round(perKm * km);
  
      resultadoEnvio.textContent = `Costo de envío a ${val.replace('_', ' ')}: $${cost.toLocaleString('es-AR')}`;
      explicacionEnvio.textContent = `Cálculo: tarifa base $${base.toLocaleString('es-AR')} + $${perKm.toLocaleString('es-AR')} * ${km} km`;
    });
  
    resetEnvioBtn.addEventListener('click', () => {
      localidadSelect.value = '';
      resultadoEnvio.textContent = '';
      explicacionEnvio.textContent = '';
    });
  
    /* FORMULARIO DE CONTACTO — Validación y envío simulado */
    contactForm?.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const msg = document.getElementById('contactMessage').value.trim();
  
      if (!name || !email || !msg) {
        alert('Por favor completá todos los campos.');
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert('Ingresá un email válido.');
        return;
      }
  
      alert('✅ Mensaje enviado. Gracias por contactarte.');
      contactForm.reset();
    });
  
    /* SISTEMA DE AUTENTICACIÓN — Registrar / Iniciar / Cerrar sesión */
    btnRegister.addEventListener('click', () => {
      const u = authUser.value.trim();
      const p = authPass.value.trim();
  
      if (!u || !p) {
        authMsg.textContent = 'Completá usuario y contraseña.';
        return;
      }
  
      const users = loadUsers();
      if (users.find(x => x.username === u)) {
        authMsg.textContent = '⚠️ El usuario ya existe. Iniciá sesión.';
        return;
      }
  
      users.push({ username: u, pass: p });
      saveUsers(users);
      setLogged(u);
      authMsg.textContent = '✅ Registro exitoso. Has iniciado sesión.';
      updateAuthUI();
      authUser.value = '';
      authPass.value = '';
    });
  
    btnLogin.addEventListener('click', () => {
      const u = authUser.value.trim();
      const p = authPass.value.trim();
  
      if (!u || !p) {
        authMsg.textContent = 'Completá usuario y contraseña.';
        return;
      }
  
      const users = loadUsers();
      const found = users.find(x => x.username === u && x.pass === p);
  
      if (found) {
        setLogged(u);
        authMsg.textContent = '✅ Sesión iniciada. Bienvenido ' + u + '.';
        updateAuthUI();
        authUser.value = '';
        authPass.value = '';
      } else {
        authMsg.textContent = '❌ No existe cuenta. Por favor registrate.';
      }
    });
  
    btnLogout.addEventListener('click', () => {
      clearLogged();
      updateAuthUI();
      alert('Has cerrado sesión.');
    });
  
    // Actualiza el mensaje de estado visible en pantalla
    function updateAuthUI() {
      if (isLogged()) {
        loginState.textContent = 'Conectado: ' + currentUser();
        btnLogout.style.display = 'inline-block';
      } else {
        loginState.textContent = 'No estás logueado';
        btnLogout.style.display = 'none';
      }
    }
  
    /* FINALIZAR COMPRA — Verificaciones y descuentos automáticos */
    checkoutBtn.addEventListener('click', () => {
  
      if (cart.length === 0) {
        alert('El carrito está vacío. Agregá productos antes de finalizar.');
        return;
      }
  
      if (!isLogged()) {
        alert('🚨 Debes iniciar sesión para finalizar la compra.');
        document.getElementById('login').scrollIntoView({ behavior: 'smooth' });
        return;
      }
  
      // Subtotal general
      const subtotal = computeSubtotal();
      let discount = 0;
  
      // Agrupar productos iguales para aplicar descuento por pares
      const groups = {};
      cart.forEach(it => { groups[it.name] = (groups[it.name] || 0) + it.qty; });
  
      // Descuento por cada segunda unidad de un mismo producto
      for (const name in groups) {
        const qty = groups[name];
        if (qty >= 2) {
          const item = cart.find(i => i.name === name);
          const pairs = Math.floor(qty / 2);
          discount += pairs * item.price * 0.20;
        }
      }
  
      const total = subtotal - Math.round(discount);
      const summary =
        `Subtotal: $${subtotal.toLocaleString('es-AR')}\n` +
        `Descuento: $${Math.round(discount).toLocaleString('es-AR')}\n` +
        `Total: $${total.toLocaleString('es-AR')}`;
  
      if (confirm(summary + '\n\n¿Confirmar compra?')) {
        alert('🎉 Compra finalizada. Gracias.');
        cart = [];
        saveCart(); renderCart();
      }
    });
  
    /* MINIATURAS / MODELOS — Mostrar detalles y hacer scroll */
    document.querySelectorAll('.miniaturas-hero .miniatura').forEach(btn =>
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        const article = document.querySelector(`.tarjeta-modelo[data-model-id="${target}"]`);
  
        if (article) {
          article.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
          setTimeout(() => {
            article.classList.add('resaltado');
            setTimeout(() => article.classList.remove('resaltado'), 900);
          }, 300);
  
          showModelDetails(target);
        } else {
          document.getElementById('models').scrollIntoView({ behavior: 'smooth' });
        }
      })
    );
  
    // Imagen hero clickeable
    const previewClick = document.querySelector('.vista-previa.vista-previa-clickeable');
  
    if (previewClick) {
      previewClick.addEventListener('click', () => {
        document.getElementById('models').scrollIntoView({ behavior: 'smooth' });
      });
  
      previewClick.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          document.getElementById('models').scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  
    /* PANEL DE DETALLES DEL MODELO */
    function showModelDetails(modelId) {
      const article = document.querySelector(`.tarjeta-modelo[data-model-id="${modelId}"]`);
      const details = document.getElementById('modelDetails');
  
      if (!article || !details) return;
  
      const title = article.querySelector('h3')?.textContent || '';
      const desc = article.querySelector('.muted')?.textContent || '';
      const price = article.querySelector('.precio')?.textContent || '';
      const lis = Array.from(article.querySelectorAll('ul li')).map(li => li.textContent);
  
      // Inserta el contenido del modelo en el panel
      details.innerHTML = `
        <h3>${title}</h3>
        <div class="muted">${desc}</div>
        <ul>${lis.map(i => `<li>${i}</li>`).join('')}</ul>
        <div class="model-price">${price ? '$' + parseInt(price, 10).toLocaleString('es-AR') : ''}</div>
        <div class="model-actions">
          <button class="btn btn-buy" data-name="${title}" data-price="${parseInt(price, 10) || 0}">Comprar</button>
          <button class="btn secondary" id="modelContact">Consultar</button>
        </div>
      `;
      details.style.display = 'block';
  
      // Reasigna el evento de compra dentro del propio panel
      details.querySelectorAll('.btn-buy').forEach(btn =>
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-name');
          const price = parseInt(btn.getAttribute('data-price'), 10) || 0;
  
          const existing = cart.find(i => i.name === name);
          if (existing) existing.qty++;
          else cart.push({ id: Date.now().toString(36), name, price, qty: 1 });
  
          saveCart(); renderCart();
          alert('✅ ' + name + ' agregado al carrito.');
        })
      );
  
      // Botón de consulta - dirige al formulario de contacto
      const consult = details.querySelector('#modelContact');
      if (consult) {
        consult.addEventListener('click', () => {
          document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
  
    // Click general a cada tarjeta - muestra detalles (excepto botones internos)
    document.querySelectorAll('.tarjeta-modelo').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-buy') || e.target.closest('.boton-carrusel')) return;
        const id = card.getAttribute('data-model-id');
        showModelDetails(id);
      });
    });
  
    /* BOTONES CTA (llamado a la acción) DEL HERO */
    document.getElementById('toModels')?.addEventListener('click', () => {
      document.getElementById('models').scrollIntoView({ behavior: 'smooth' });
    });
  
    document.getElementById('openPromo')?.addEventListener('click', () => {
      document.getElementById('promo').scrollIntoView({ behavior: 'smooth' });
    });
  
    /* INICIALIZACIÓN FINAL DE LA APP */
    (function init() {
      document.getElementById('currentYear').textContent = new Date().getFullYear();
      renderCart();
      updateAuthUI();
      initCarousels();
    })();
  
  });
