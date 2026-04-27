document.addEventListener('DOMContentLoaded', () => {
  let timerIntervalId;

  // ==== 4. Função showStickyBar() (Injeção Dinâmica) ====
  const showStickyBar = () => {
    // Evita duplicatas caso seja chamada multiplas vezes
    if (document.querySelector('.sticky-offer-bar')) return;

    // Atualiza os preços do site
    const ofertaValores = document.querySelectorAll('.oferta-valor');
    ofertaValores.forEach(el => {
      if (el.textContent.includes('97')) {
        el.textContent = 'R$ 57,90';
      }
    });
    const ofertaDe = document.querySelectorAll('.oferta-de');
    ofertaDe.forEach(el => el.textContent = 'De R$ 97,00');

    // Cria o HTML da barra dinâmica
    const stickyHTML = `
      <div class="sticky-offer-bar">
        ⚠️ OFERTA EXCLUSIVA: R$ 57,90 por tempo limitado!
        <span class="timer" id="sticky-timer">15:00</span>
        <a href="#oferta" class="btn-offer">GARANTIR AGORA</a>
      </div>
    `;
    
    // Anexa ao body
    document.body.insertAdjacentHTML('afterbegin', stickyHTML);
    
    // Adiciona padding-top ao body para não quebrar o layout
    // (Ajuste para mobile já está no CSS @media max-width 600px)
    if (window.innerWidth > 600) {
      document.body.style.paddingTop = '60px';
    }

    // Cronômetro persistente de 15 minutos
    const timerEl = document.getElementById('sticky-timer');
    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
    let expirationTime = localStorage.getItem('stickyOfferExpiration');

    if (!expirationTime) {
      expirationTime = Date.now() + FIFTEEN_MINUTES_MS;
      localStorage.setItem('stickyOfferExpiration', expirationTime);
    } else {
      expirationTime = parseInt(expirationTime, 10);
    }

    const checkTimer = () => {
      const remainingTimeMs = expirationTime - Date.now();
      if (remainingTimeMs <= 0) {
        timerEl.textContent = "00:00";
        clearInterval(timerIntervalId);
        return;
      }
      const minutes = Math.floor(remainingTimeMs / 60000);
      const seconds = Math.floor((remainingTimeMs % 60000) / 1000);
      timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    checkTimer();
    timerIntervalId = setInterval(checkTimer, 1000);
  };

  // ==== 3. Função closeExitModal() ====
  // Agora está no escopo global para o onclick="closeExitModal()" do HTML funcionar
  window.closeExitModal = function() {
    // 1. Esconde o Modal
    const modal = document.getElementById('exitModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }

    // 2. Grava que o usuário já viu e fechou
    localStorage.setItem('exitModalClosed', 'true');
    localStorage.setItem('offerActive', 'true');

    // 3. Ativa a Sticky Bar
    showStickyBar();
  };

  // ==== 1. Verificação Inicial ====
  if (localStorage.getItem('offerActive') === 'true') {
    // Chama showStickyBar() imediatamente e não mostra o pop-up
    showStickyBar();
  } else {
    // Caso contrário, ativa o monitoramento de saída (Exit Intent)
    
    // Oculta inicialmente o modal via JS por segurança (além do CSS)
    const modal = document.getElementById('exitModal');
    if (modal) {
      modal.style.display = 'none';
    }

    // ==== 2. Lógica de Exit Intent (Pop-up) ====
    document.addEventListener('mouseleave', (e) => {
      // Monitora a saída do mouse no topo da tela
      if (e.clientY < 10 && !localStorage.getItem('exitModalClosed')) {
        if (modal) {
          modal.classList.add('active');
          modal.style.display = 'flex';
          
          // Função simples para simular vendas enquanto o modal está aberto
          const vendasCountEl = document.getElementById('vendas-count');
          if (vendasCountEl && !vendasCountEl.dataset.simulating) {
            vendasCountEl.dataset.simulating = "true";
            setInterval(() => {
              let currentCount = parseInt(vendasCountEl.textContent, 10) || 14;
              vendasCountEl.textContent = currentCount + (Math.floor(Math.random() * 2) + 1);
            }, 5000);
          }
        }
      }
    });

    // Mobile Exit Intent Alternativo (scroll rápido para cima ou tempo)
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastScrollTime;
      
      if (currentScrollY < lastScrollY && timeDiff > 0) {
        const scrollSpeed = (lastScrollY - currentScrollY) / timeDiff;
        if (scrollSpeed > 2 && currentScrollY > 100 && !localStorage.getItem('exitModalClosed')) {
          if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
          }
        }
      }
      lastScrollY = currentScrollY;
      lastScrollTime = currentTime;
    });
  }
});
