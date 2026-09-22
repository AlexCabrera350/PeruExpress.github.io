/**
 * Lógica interactiva para PeruExpress
 * Gestión de Modo Oscuro, búsqueda, filtros, modal de asientos y Pasarela de Pagos (Checkout)
 */

// Inicializar tema antes de renderizado completo para evitar parpadeos
(function() {
  const savedTheme = localStorage.getItem('peruexpress-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- 1. GESTIÓN DE MODO OSCURO (SWITCH) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeToggleBtnMobile = document.getElementById('theme-toggle-mobile');

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('peruexpress-theme', isDark ? 'dark' : 'light');
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  if (themeToggleBtnMobile) {
    themeToggleBtnMobile.addEventListener('click', toggleTheme);
  }

  // --- 2. CONFIGURACIÓN DE FECHAS MÍNIMAS ---
  const today = new Date().toISOString().split('T')[0];
  const fechaIdaInput = document.getElementById('fecha-ida');
  const fechaRetornoInput = document.getElementById('fecha-retorno');

  if (fechaIdaInput) {
    fechaIdaInput.min = today;
    fechaIdaInput.value = today;
  }
  if (fechaRetornoInput) {
    fechaRetornoInput.min = today;
  }

  // --- 3. TIPO DE VIAJE: SOLO IDA / IDA Y VUELTA ---
  const btnSoloIda = document.getElementById('btn-solo-ida');
  const btnIdaVuelta = document.getElementById('btn-ida-vuelta');
  const contenedorRetorno = document.getElementById('contenedor-retorno');

  if (btnSoloIda && btnIdaVuelta && contenedorRetorno) {
    btnSoloIda.addEventListener('click', () => {
      btnSoloIda.classList.add('bg-blue-900', 'text-white');
      btnSoloIda.classList.remove('bg-gray-100', 'text-gray-700', 'dark:bg-slate-800', 'dark:text-slate-300');
      btnIdaVuelta.classList.remove('bg-blue-900', 'text-white');
      btnIdaVuelta.classList.add('bg-gray-100', 'text-gray-700', 'dark:bg-slate-800', 'dark:text-slate-300');
      
      contenedorRetorno.classList.add('opacity-40', 'pointer-events-none');
      if (fechaRetornoInput) fechaRetornoInput.value = '';
    });

    btnIdaVuelta.addEventListener('click', () => {
      btnIdaVuelta.classList.add('bg-blue-900', 'text-white');
      btnIdaVuelta.classList.remove('bg-gray-100', 'text-gray-700', 'dark:bg-slate-800', 'dark:text-slate-300');
      btnSoloIda.classList.remove('bg-blue-900', 'text-white');
      btnSoloIda.classList.add('bg-gray-100', 'text-gray-700', 'dark:bg-slate-800', 'dark:text-slate-300');
      
      contenedorRetorno.classList.remove('opacity-40', 'pointer-events-none');
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 2);
      if (fechaRetornoInput) fechaRetornoInput.value = nextDay.toISOString().split('T')[0];
    });
  }

  // --- 4. MENÚ MÓVIL ---
  const btnMobileMenu = document.getElementById('btn-mobile-menu');
  const mobileMenu = document.getElementById('mobile-menu');

  if (btnMobileMenu && mobileMenu) {
    btnMobileMenu.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // --- 5. BÚSQUEDA Y ACTUALIZACIÓN DE ITINERARIOS ---
  const formBusqueda = document.getElementById('form-busqueda');
  const origenSelect = document.getElementById('ciudad-origen');
  const destinoSelect = document.getElementById('ciudad-destino');
  const labelRutaActual = document.getElementById('label-ruta-actual');
  const labelFechaActual = document.getElementById('label-fecha-actual');
  const seccionResultados = document.getElementById('itinerarios');

  if (formBusqueda) {
    formBusqueda.addEventListener('submit', (e) => {
      e.preventDefault();
      const origen = origenSelect ? origenSelect.options[origenSelect.selectedIndex].text : 'Lima';
      const destino = destinoSelect ? destinoSelect.options[destinoSelect.selectedIndex].text : 'Trujillo';
      const fecha = fechaIdaInput ? fechaIdaInput.value : today;

      if (origenSelect && destinoSelect && origenSelect.value === destinoSelect.value) {
        alert('El origen y el destino no pueden ser la misma ciudad.');
        return;
      }

      if (labelRutaActual) labelRutaActual.textContent = `${origen} ➔ ${destino}`;
      if (labelFechaActual) {
        const [year, month, day] = fecha.split('-');
        const fechaObj = new Date(year, month - 1, day);
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        labelFechaActual.textContent = fechaObj.toLocaleDateString('es-PE', opciones);
      }

      // Desplazamiento suave a los resultados
      if (seccionResultados) {
        seccionResultados.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // --- 6. FILTRADO DE HORARIOS Y SERVICIOS ---
  const filterTurnoBtns = document.querySelectorAll('.filter-turno-btn');
  const busCards = document.querySelectorAll('.bus-trip-card');

  filterTurnoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterTurnoBtns.forEach(b => {
        b.classList.remove('bg-blue-900', 'text-white', 'border-blue-900');
        b.classList.add('bg-white', 'text-gray-700', 'border-gray-300', 'dark:bg-slate-800', 'dark:text-slate-300', 'dark:border-slate-700');
      });
      btn.classList.add('bg-blue-900', 'text-white', 'border-blue-900');
      btn.classList.remove('bg-white', 'text-gray-700', 'border-gray-300', 'dark:bg-slate-800', 'dark:text-slate-300', 'dark:border-slate-700');

      const turno = btn.dataset.turno;
      busCards.forEach(card => {
        if (turno === 'todos' || card.dataset.turno === turno) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- 7. MODAL INTERACTIVO DE ASIENTOS ---
  const seatModal = document.getElementById('seat-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnVerAsientosList = document.querySelectorAll('.btn-ver-asientos');
  
  const modalServiceName = document.getElementById('modal-service-name');
  const modalBusTime = document.getElementById('modal-bus-time');
  const modalBasePrice = document.getElementById('modal-base-price');
  const modalSelectedSeatsText = document.getElementById('modal-selected-seats');
  const modalTotalPrice = document.getElementById('modal-total-price');
  const btnConfirmBooking = document.getElementById('btn-confirm-booking');

  const tabPiso1 = document.getElementById('tab-piso-1');
  const tabPiso2 = document.getElementById('tab-piso-2');
  const gridPiso1 = document.getElementById('grid-piso-1');
  const gridPiso2 = document.getElementById('grid-piso-2');

  let currentPricePerSeat = 85;
  let currentServiceName = 'Servicio Ejecutivo';
  let currentBusTime = '08:00 AM';
  let selectedSeats = [];

  btnVerAsientosList.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.bus-trip-card');
      if (!card) return;

      currentServiceName = card.dataset.servicio || 'Servicio Ejecutivo';
      currentBusTime = card.dataset.horario || '08:00 AM';
      const price = parseFloat(card.dataset.precio || '85');

      currentPricePerSeat = price;
      selectedSeats = [];

      if (modalServiceName) modalServiceName.textContent = currentServiceName;
      if (modalBusTime) modalBusTime.textContent = currentBusTime;
      if (modalBasePrice) modalBasePrice.textContent = `S/ ${price.toFixed(2)}`;
      
      updateModalSummary();
      resetSeatButtons();

      if (seatModal) {
        seatModal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }
    });
  });

  if (btnCloseModal && seatModal) {
    btnCloseModal.addEventListener('click', closeSeatModal);
    seatModal.addEventListener('click', (e) => {
      if (e.target === seatModal) closeSeatModal();
    });
  }

  function closeSeatModal() {
    if (seatModal) {
      seatModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  // Cambio de pestaña entre Piso 1 y Piso 2
  if (tabPiso1 && tabPiso2 && gridPiso1 && gridPiso2) {
    tabPiso1.addEventListener('click', () => {
      tabPiso1.classList.add('border-blue-900', 'text-blue-900', 'dark:border-sky-400', 'dark:text-sky-400', 'bg-blue-50/50', 'dark:bg-slate-800');
      tabPiso1.classList.remove('border-transparent', 'text-gray-500', 'dark:text-slate-400');
      tabPiso2.classList.remove('border-blue-900', 'text-blue-900', 'dark:border-sky-400', 'dark:text-sky-400', 'bg-blue-50/50', 'dark:bg-slate-800');
      tabPiso2.classList.add('border-transparent', 'text-gray-500', 'dark:text-slate-400');

      gridPiso1.classList.remove('hidden');
      gridPiso2.classList.add('hidden');
    });

    tabPiso2.addEventListener('click', () => {
      tabPiso2.classList.add('border-blue-900', 'text-blue-900', 'dark:border-sky-400', 'dark:text-sky-400', 'bg-blue-50/50', 'dark:bg-slate-800');
      tabPiso2.classList.remove('border-transparent', 'text-gray-500', 'dark:text-slate-400');
      tabPiso1.classList.remove('border-blue-900', 'text-blue-900', 'dark:border-sky-400', 'dark:text-sky-400', 'bg-blue-50/50', 'dark:bg-slate-800');
      tabPiso1.classList.add('border-transparent', 'text-gray-500', 'dark:text-slate-400');

      gridPiso2.classList.remove('hidden');
      gridPiso1.classList.add('hidden');
    });
  }

  // Clic en asientos interactivos
  const seatButtons = document.querySelectorAll('.bus-seat');
  seatButtons.forEach(seat => {
    seat.addEventListener('click', () => {
      if (seat.classList.contains('seat-occupied')) return;

      const seatNum = seat.dataset.seat;

      if (seat.classList.contains('seat-selected')) {
        seat.classList.remove('seat-selected');
        seat.classList.add('seat-available');
        selectedSeats = selectedSeats.filter(s => s !== seatNum);
      } else {
        if (selectedSeats.length >= 4) {
          alert('Puedes seleccionar un máximo de 4 asientos por reserva.');
          return;
        }
        seat.classList.remove('seat-available');
        seat.classList.add('seat-selected');
        selectedSeats.push(seatNum);
      }

      updateModalSummary();
    });
  });

  function resetSeatButtons() {
    seatButtons.forEach(seat => {
      if (!seat.classList.contains('seat-occupied')) {
        seat.classList.remove('seat-selected');
        seat.classList.add('seat-available');
      }
    });
  }

  function updateModalSummary() {
    if (modalSelectedSeatsText) {
      modalSelectedSeatsText.textContent = selectedSeats.length > 0 
        ? selectedSeats.sort((a,b) => a-b).map(n => `#${n}`).join(', ') 
        : 'Ninguno';
    }

    const total = selectedSeats.length * currentPricePerSeat;
    if (modalTotalPrice) {
      modalTotalPrice.textContent = `S/ ${total.toFixed(2)}`;
    }

    if (btnConfirmBooking) {
      if (selectedSeats.length > 0) {
        btnConfirmBooking.removeAttribute('disabled');
        btnConfirmBooking.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        btnConfirmBooking.setAttribute('disabled', 'true');
        btnConfirmBooking.classList.add('opacity-50', 'cursor-not-allowed');
      }
    }
  }

  // --- 8. PASARELA DE PAGOS (CHECKOUT MODAL) ---
  const paymentModal = document.getElementById('payment-modal');
  const btnClosePayment = document.getElementById('btn-close-payment');
  
  // Elementos de resumen en la pasarela
  const paySummaryRoute = document.getElementById('pay-summary-route');
  const paySummaryDate = document.getElementById('pay-summary-date');
  const paySummaryService = document.getElementById('pay-summary-service');
  const paySummarySeats = document.getElementById('pay-summary-seats');
  const paySummaryTotal = document.getElementById('pay-summary-total');
  const btnPayLabel = document.getElementById('btn-pay-label');

  // Vistas de la pasarela
  const paymentCheckoutView = document.getElementById('payment-checkout-view');
  const paymentLoadingView = document.getElementById('payment-loading-view');
  const paymentSuccessView = document.getElementById('payment-success-view');

  // Pestañas de método de pago
  const tabCard = document.getElementById('pay-method-card');
  const tabYape = document.getElementById('pay-method-yape');
  const tabPlin = document.getElementById('pay-method-plin');
  const panelCard = document.getElementById('pay-panel-card');
  const panelYape = document.getElementById('pay-panel-yape');
  const panelPlin = document.getElementById('pay-panel-plin');

  // Botón de Pagar y Voucher
  const btnSubmitPayment = document.getElementById('btn-submit-payment');
  const btnDownloadVoucher = document.getElementById('btn-download-voucher');
  const btnFinishVoucher = document.getElementById('btn-finish-voucher');

  // Conectar botón de asientos con la pasarela de pagos
  if (btnConfirmBooking) {
    btnConfirmBooking.addEventListener('click', () => {
      if (selectedSeats.length === 0) return;

      // Cerrar modal de asientos
      closeSeatModal();

      // Abrir modal de pago y prellenar datos
      const ruta = labelRutaActual ? labelRutaActual.textContent : 'Lima ➔ Trujillo';
      const fecha = labelFechaActual ? labelFechaActual.textContent : 'Fecha programada';
      const totalFormatted = (selectedSeats.length * currentPricePerSeat).toFixed(2);
      const seatsFormatted = selectedSeats.sort((a,b) => a-b).map(n => `#${n}`).join(', ');

      if (paySummaryRoute) paySummaryRoute.textContent = ruta;
      if (paySummaryDate) paySummaryDate.textContent = `${fecha} • Salida ${currentBusTime}`;
      if (paySummaryService) paySummaryService.textContent = currentServiceName;
      if (paySummarySeats) paySummarySeats.textContent = seatsFormatted;
      if (paySummaryTotal) paySummaryTotal.textContent = `S/ ${totalFormatted}`;
      if (btnPayLabel) btnPayLabel.textContent = `Pagar Ahora S/ ${totalFormatted}`;

      // Resetear vistas del checkout
      if (paymentCheckoutView) paymentCheckoutView.classList.remove('hidden');
      if (paymentLoadingView) paymentLoadingView.classList.add('hidden');
      if (paymentSuccessView) paymentSuccessView.classList.add('hidden');

      if (paymentModal) {
        paymentModal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Cerrar modal de pago
  function closePaymentModal() {
    if (paymentModal) {
      paymentModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  if (btnClosePayment && paymentModal) {
    btnClosePayment.addEventListener('click', closePaymentModal);
    paymentModal.addEventListener('click', (e) => {
      if (e.target === paymentModal) closePaymentModal();
    });
  }

  // Alternancia de métodos de pago (Tarjeta / Yape / Plin)
  function setActivePaymentTab(activeTab, activePanel, activeColorClass) {
    [tabCard, tabYape, tabPlin].forEach(tab => {
      if (tab) {
        tab.className = 'pay-method-tab py-3 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold text-xs flex flex-col items-center gap-1.5 transition';
      }
    });
    [panelCard, panelYape, panelPlin].forEach(panel => {
      if (panel) panel.classList.add('hidden');
    });

    if (activeTab) {
      activeTab.className = `pay-method-tab py-3 px-2 rounded-xl border-2 ${activeColorClass} bg-blue-50/40 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs flex flex-col items-center gap-1.5 transition`;
    }
    if (activePanel) {
      activePanel.classList.remove('hidden');
    }
  }

  if (tabCard) {
    tabCard.addEventListener('click', () => setActivePaymentTab(tabCard, panelCard, 'border-brand-900 dark:border-accent-500'));
  }
  if (tabYape) {
    tabYape.addEventListener('click', () => setActivePaymentTab(tabYape, panelYape, 'border-purple-600 dark:border-purple-400'));
  }
  if (tabPlin) {
    tabPlin.addEventListener('click', () => setActivePaymentTab(tabPlin, panelPlin, 'border-cyan-500 dark:border-cyan-400'));
  }

  // Formato automático de tarjeta (espaciado cada 4 dígitos)
  const inputCardNumber = document.getElementById('pay-card-number');
  if (inputCardNumber) {
    inputCardNumber.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val !== '' ? val.match(/.{1,4}/g).join(' ') : '';
      e.target.value = val;
    });
  }

  // Formato de vencimiento (MM/AA)
  const inputCardExpiry = document.getElementById('pay-card-expiry');
  if (inputCardExpiry) {
    inputCardExpiry.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
      e.target.value = val;
    });
  }

  // Procesar Pago Simulado
  if (btnSubmitPayment) {
    btnSubmitPayment.addEventListener('click', () => {
      const buyerName = document.getElementById('pay-buyer-name')?.value || 'Carlos Eduardo Mendoza';
      const buyerDni = document.getElementById('pay-buyer-dni')?.value || '72481920';

      // Validación simple
      if (!buyerName.trim()) {
        alert('Por favor ingresa el nombre del pasajero titular.');
        document.getElementById('pay-buyer-name')?.focus();
        return;
      }

      // Transición a pantalla de carga
      if (paymentCheckoutView) paymentCheckoutView.classList.add('hidden');
      if (paymentLoadingView) paymentLoadingView.classList.remove('hidden');

      setTimeout(() => {
        if (paymentLoadingView) paymentLoadingView.classList.add('hidden');
        if (paymentSuccessView) paymentSuccessView.classList.remove('hidden');

        // Generar código de reserva aleatorio
        const randomCode = 'PE-2026-' + Math.floor(10000 + Math.random() * 90000);
        const voucherCode = document.getElementById('voucher-code');
        const voucherPassenger = document.getElementById('voucher-passenger');
        const voucherDni = document.getElementById('voucher-dni');
        const voucherRoute = document.getElementById('voucher-route');
        const voucherSeats = document.getElementById('voucher-seats');
        const voucherTotal = document.getElementById('voucher-total');

        if (voucherCode) voucherCode.textContent = randomCode;
        if (voucherPassenger) voucherPassenger.textContent = buyerName;
        if (voucherDni) voucherDni.textContent = buyerDni;
        if (voucherRoute) voucherRoute.textContent = labelRutaActual ? labelRutaActual.textContent : 'Lima ➔ Trujillo';
        if (voucherSeats) voucherSeats.textContent = selectedSeats.sort((a,b) => a-b).map(n => `#${n}`).join(', ');
        if (voucherTotal) voucherTotal.textContent = `S/ ${(selectedSeats.length * currentPricePerSeat).toFixed(2)}`;

        if (window.lucide) window.lucide.createIcons();
      }, 1400);
    });
  }

  // Botón Descargar Voucher
  if (btnDownloadVoucher) {
    btnDownloadVoucher.addEventListener('click', () => {
      alert('¡Boleto electrónico generado en formato PDF!\n\nTu boleto con código QR oficial ha sido guardado y enviado al correo indicado.');
    });
  }

  // Botón Finalizar Voucher
  if (btnFinishVoucher) {
    btnFinishVoucher.addEventListener('click', () => {
      closePaymentModal();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- 9. FAQ ACORDEÓN ---
  const faqButtons = document.querySelectorAll('.faq-toggle-btn');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');

      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      } else {
        content.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
      }
    });
  });

  // Re-ejecutar renderizado de Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
