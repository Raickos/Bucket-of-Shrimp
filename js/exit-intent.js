// localStorage.clear(); // Descomente para testar reset

document.addEventListener('DOMContentLoaded', function() {
  // Se a oferta já estiver ativa (usuário já fechou o pop-up antes), mostra a barra
  if (localStorage.getItem('offerActive') === 'true') {
      showStickyBar();
      return; // Não ativa o pop-up se a barra já estiver ativa
  }

  // Ocultar modal inicialmente por precaução
  const modal = document.getElementById('exitModal');
  if (modal) {
    modal.style.display = 'none';
  }

  // GATILHO DESKTOP: Saída do mouse
  document.documentElement.addEventListener('mouseleave', function(e) {
      if (e.clientY < 0) {
          activatePopup();
      }
  });

  // GATILHO MOBILE 1: Scroll Reverso
  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();

  window.addEventListener('scroll', function() {
      const isMobile = window.innerWidth <= 768;
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastScrollTime;
      const halfPageHeight = document.body.scrollHeight / 2;

      // Se for mobile e já rolou mais da metade da página
      if (isMobile && currentScrollY > halfPageHeight) {
          if (currentScrollY < lastScrollY && timeDiff > 0) {
              const scrollSpeed = (lastScrollY - currentScrollY) / timeDiff;
              // Velocidade de scroll para cima
              if (scrollSpeed > 1.5) {
                  activatePopup();
              }
          }
      }
      lastScrollY = currentScrollY;
      lastScrollTime = currentTime;
  });

  // GATILHO MOBILE 2: Tempo/Inatividade na área de checkout
  let inactivityTimer = null;
  const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) return;

      const ofertaSection = document.getElementById('oferta');
      if (ofertaSection) {
          const rect = ofertaSection.getBoundingClientRect();
          // Se o topo da seção de oferta estiver visível ou acima da tela
          if (rect.top <= window.innerHeight) {
              inactivityTimer = setTimeout(() => {
                  activatePopup();
              }, 7000); // 7 segundos de inatividade
          }
      }
  };

  ['scroll', 'touchstart', 'click'].forEach(evt => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
  });

  // Adiciona listener para fechar o modal clicando fora
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeExitModal();
      }
    });
  }

  // Evento do botão CTA dentro do Modal
  const exitCta = modal ? modal.querySelector('.exit-intent-btn') : null;
  if (exitCta) {
    exitCta.addEventListener('click', (e) => {
      closeExitModal(true);
    });
  }
});

let intervalId;

function activatePopup() {
  if (!localStorage.getItem('exitModalClosed')) {
      const modal = document.getElementById('exitModal');
      if (modal) {
          modal.style.display = 'flex';
          modal.classList.add('active');
          
          // Função simples para simular vendas enquanto o modal está aberto
          const vendasCountEl = document.getElementById('vendas-count');
          if (vendasCountEl && !vendasCountEl.dataset.simulating) {
            vendasCountEl.dataset.simulating = "true";
            intervalId = setInterval(() => {
              let currentCount = parseInt(vendasCountEl.textContent, 10) || 14;
              vendasCountEl.textContent = currentCount + (Math.floor(Math.random() * 2) + 1);
            }, 5000);
          }
      }
  }
}

// ==== Função closeExitModal() ====
window.closeExitModal = function(applyDiscount = false) {
  // 1. Esconde o Modal
  const modal = document.getElementById('exitModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }

  if (intervalId) {
    clearInterval(intervalId);
  }

  if (applyDiscount) {
    const ofertaSection = document.querySelector('#oferta');
    if (ofertaSection) {
      ofertaSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // 2. Grava que o usuário já viu e fechou
  localStorage.setItem('exitModalClosed', 'true');
  localStorage.setItem('offerActive', 'true');

  // 3. Ativa a Sticky Bar
  showStickyBar();
};

let timerIntervalId;

// ==== Função showStickyBar() ====
function showStickyBar() {
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
      <span class="timer" id="sticky-timer">15:00</span>
      <a href="#oferta" class="btn-offer">GARANTIR AGORA</a>
    </div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', stickyHTML);
  
  if (window.innerWidth > 600) {
    document.body.style.paddingTop = '60px';
  }

  const timerEl = document.getElementById('sticky-timer');
  
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
    if (remainingTimeMs <= 0) {
      if(timerEl) timerEl.textContent = "00:00";
      clearInterval(timerIntervalId);
      return;
    }
    const minutes = Math.floor(remainingTimeMs / 60000);
    const seconds = Math.floor((remainingTimeMs % 60000) / 1000);
    if(timerEl) timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  checkTimer();
  timerIntervalId = setInterval(checkTimer, 1000);
}
