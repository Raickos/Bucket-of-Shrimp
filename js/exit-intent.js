document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('exitModal');
  const vendasCountEl = document.getElementById('vendas-count');
  
  const stickyBar = document.getElementById('sticky-offer-bar');
  const stickyTimerEl = document.getElementById('sticky-timer');
  const stickyBtn = document.getElementById('sticky-btn');
  
  let isModalVisible = false;
  let intervalId;
  let timerIntervalId;

  // ==== LÓGICA DO STICKY BAR ====
  
  const updatePricesOnPage = () => {
    const ofertaValores = document.querySelectorAll('.oferta-valor');
    ofertaValores.forEach(el => {
      if(el.textContent.includes('97')) {
         el.textContent = 'R$ 57,90';
      }
    });
    const ofertaDe = document.querySelectorAll('.oferta-de');
    ofertaDe.forEach(el => el.textContent = 'De R$ 97,00');
  };

  const showStickyBar = () => {
    stickyBar.classList.add('active');
    // Adiciona margin-top no body para não sobrepor conteúdo
    const barHeight = stickyBar.offsetHeight;
    document.body.style.marginTop = barHeight + 'px';
    // Garante que o resize ou scroll não quebre o layout
    window.addEventListener('resize', () => {
      document.body.style.marginTop = stickyBar.offsetHeight + 'px';
    });
    // Atualiza o preço geral do site quando o sticky aparecer
    updatePricesOnPage();
  };

  const updateTimerDisplay = (remainingTimeMs) => {
    if (remainingTimeMs <= 0) {
      stickyTimerEl.textContent = "00:00";
      clearInterval(timerIntervalId);
      return;
    }
    const minutes = Math.floor(remainingTimeMs / 60000);
    const seconds = Math.floor((remainingTimeMs % 60000) / 1000);
    stickyTimerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startStickyTimer = () => {
    let expirationTime = localStorage.getItem('stickyOfferExpiration');
    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

    if (!expirationTime) {
      // Define a expiração para daqui a 15 minutos
      expirationTime = Date.now() + FIFTEEN_MINUTES_MS;
      localStorage.setItem('stickyOfferExpiration', expirationTime);
    } else {
      expirationTime = parseInt(expirationTime, 10);
    }

    const checkTimer = () => {
      const remainingTimeMs = expirationTime - Date.now();
      updateTimerDisplay(remainingTimeMs);
      if (remainingTimeMs <= 0) {
        clearInterval(timerIntervalId);
      }
    };

    checkTimer();
    timerIntervalId = setInterval(checkTimer, 1000);
  };

  const initStickyBar = () => {
    localStorage.setItem('exitModalClosed', 'true');
    showStickyBar();
    startStickyTimer();
  };

  // Se a barra já foi ativada em uma visita anterior
  if (localStorage.getItem('exitModalClosed') === 'true') {
    showStickyBar();
    startStickyTimer();
  }

  // ==== LÓGICA DO MODAL DE SAÍDA ====

  window.closeExitModal = function(applyDiscount = false) {
    if (modal) {
      modal.classList.remove('active');
    }
    isModalVisible = false;
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Se o usuário clicar no botão CTA dentro do modal
    if (applyDiscount) {
      const ofertaSection = document.querySelector('#oferta');
      if(ofertaSection) {
        ofertaSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Ativa o Sticky Bar quando o modal é fechado (por qualquer motivo)
    if (localStorage.getItem('exitModalClosed') !== 'true') {
      initStickyBar();
    }
  };

  // Evento do botão CTA dentro do Modal
  const modalCta = modal ? modal.querySelector('.exit-intent-btn') : null;
  if (modalCta) {
    modalCta.addEventListener('click', (e) => {
      // Impede o padrão se quiser tratar o scroll via JS, mas o href="#oferta" já ajuda
      closeExitModal(true);
    });
  }

  // Ação do botão do Sticky Bar (redireciona para oferta)
  if (stickyBtn) {
    stickyBtn.addEventListener('click', (e) => {
      // Redireciona via âncora, os preços já foram atualizados globalmente
    });
  }

  const startSalesSimulation = () => {
    if (!vendasCountEl) return;
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      let currentCount = parseInt(vendasCountEl.textContent, 10) || 14;
      const increase = Math.floor(Math.random() * 2) + 1;
      vendasCountEl.textContent = currentCount + increase;
    }, 4500);
  };

  const showModal = () => {
    // Só mostra se o modal existir, não estiver visível, e nem o modal nem o sticky já estiverem ativos
    if (modal && !isModalVisible && !localStorage.getItem('exitIntentShown') && localStorage.getItem('stickyBarActive') !== 'true') {
      modal.classList.add('active');
      isModalVisible = true;
      localStorage.setItem('exitIntentShown', 'true');
      startSalesSimulation();
    }
  };

  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 10) {
      showModal();
    }
  });

  setTimeout(() => {
    showModal();
  }, 20000);

  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastScrollTime;
    
    if (currentScrollY < lastScrollY && timeDiff > 0) {
      const scrollSpeed = (lastScrollY - currentScrollY) / timeDiff;
      if (scrollSpeed > 2 && currentScrollY > 100) {
        showModal();
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
