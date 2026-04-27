document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('exitModal');
  const vendasCountEl = document.getElementById('vendas-count');
  let intervalId;
  let timerIntervalId;

  // ==== LÓGICA DO STICKY BAR ====

  const updateTimerDisplay = (timerEl, remainingTimeMs) => {
    if (remainingTimeMs <= 0) {
      timerEl.textContent = "00:00";
      clearInterval(timerIntervalId);
      return;
    }
    const minutes = Math.floor(remainingTimeMs / 60000);
    const seconds = Math.floor((remainingTimeMs % 60000) / 1000);
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startStickyTimer = (timerEl) => {
    let expirationTime = localStorage.getItem('stickyOfferExpiration');
    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

    if (!expirationTime) {
      expirationTime = Date.now() + FIFTEEN_MINUTES_MS;
      localStorage.setItem('stickyOfferExpiration', expirationTime);
    } else {
      expirationTime = parseInt(expirationTime, 10);
    }

    const checkTimer = () => {
      const remainingTimeMs = expirationTime - Date.now();
      updateTimerDisplay(timerEl, remainingTimeMs);
      if (remainingTimeMs <= 0) {
        clearInterval(timerIntervalId);
      }
    };

    checkTimer();
    timerIntervalId = setInterval(checkTimer, 1000);
  };

  const showStickyBar = () => {
    if (localStorage.getItem('offerActive') === 'true') {
      // Evita duplicatas
      if (document.querySelector('.sticky-offer-bar')) return;

      // Atualiza preços do downsell nativamente
      const ofertaValores = document.querySelectorAll('.oferta-valor');
      ofertaValores.forEach(el => {
        if (el.textContent.includes('97')) {
          el.textContent = 'R$ 57,90';
        }
      });
      const ofertaDe = document.querySelectorAll('.oferta-de');
      ofertaDe.forEach(el => el.textContent = 'De R$ 97,00');

      // Cria elemento dinamicamente
      const stickyHTML = `
        <div class="sticky-offer-bar">
          ⚠️ OFERTA EXCLUSIVA: R$ 57,90 por tempo limitado!
          <span class="timer">15:00</span>
          <a href="#oferta" class="btn-offer">GARANTIR AGORA</a>
        </div>
      `;
      
      document.body.insertAdjacentHTML('afterbegin', stickyHTML);
      
      // Adiciona padding para não cobrir site (desktop)
      // No mobile, o CSS providenciado pelo usuário já cuida disso via media query
      if (window.innerWidth > 600) {
        document.body.style.paddingTop = '60px';
      }

      const timerEl = document.querySelector('.sticky-offer-bar .timer');
      startStickyTimer(timerEl);
    }
  };

  // Se o usuário recarregou a página e a offerActive já existe, exibe direto.
  if (localStorage.getItem('offerActive') === 'true') {
    showStickyBar();
  }

  // ==== LÓGICA DO MODAL DE SAÍDA ====

  window.closeExitModal = function(applyDiscount = false) {
    if (modal) {
      // Esconde o modal diretamente
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
    
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Se clicou no botão para ir pro desconto
    if (applyDiscount) {
      const ofertaSection = document.querySelector('#oferta');
      if (ofertaSection) {
        ofertaSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Lógica principal: Ativar o offerActive e rodar Sticky
    localStorage.setItem('offerActive', 'true');
    showStickyBar();
  };

  // Botão CTA dentro do Pop-up (O onclick original chamava closeExitModal direto,
  // mas aqui vamos garantir se o usuário quiser rolar automático).
  const exitCta = modal ? modal.querySelector('.exit-intent-btn') : null;
  if (exitCta) {
    exitCta.addEventListener('click', (e) => {
      closeExitModal(true);
    });
  }

  // Simulação de Vendas
  const startSalesSimulation = () => {
    if (!vendasCountEl) return;
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      let currentCount = parseInt(vendasCountEl.textContent, 10) || 14;
      const increase = Math.floor(Math.random() * 2) + 1;
      vendasCountEl.textContent = currentCount + increase;
    }, 4500);
  };

  let isModalTriggered = false;
  const triggerModal = () => {
    if (modal && !isModalTriggered && !localStorage.getItem('exitIntentShown') && localStorage.getItem('offerActive') !== 'true') {
      modal.classList.add('active');
      isModalTriggered = true;
      localStorage.setItem('exitIntentShown', 'true');
      startSalesSimulation();
    }
  };

  // Gatilho Desktop: mouse sai pelo topo
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 10) {
      triggerModal();
    }
  });

  // Gatilho Mobile: tempo
  setTimeout(() => {
    triggerModal();
  }, 20000);

  // Gatilho Alternativo: Scroll rápido pra cima
  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastScrollTime;
    
    if (currentScrollY < lastScrollY && timeDiff > 0) {
      const scrollSpeed = (lastScrollY - currentScrollY) / timeDiff;
      if (scrollSpeed > 2 && currentScrollY > 100) {
        triggerModal();
      }
    }
    lastScrollY = currentScrollY;
    lastScrollTime = currentTime;
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeExitModal();
      }
    });
  }
});
