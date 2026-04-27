document.addEventListener('DOMContentLoaded', () => {
  // Verifica se o modal já foi exibido nesta sessão para não ser intrusivo
  if (sessionStorage.getItem('exitIntentShown')) {
    return;
  }

  // HTML do modal injetado via JS para manter o HTML da página limpo
  const modalHTML = `
    <div id="exit-intent-overlay" class="exit-intent-overlay">
      <div class="exit-intent-modal">
        <button id="exit-intent-close" class="exit-intent-close">&times;</button>
        <div class="exit-intent-content">
          <h2 class="exit-intent-headline">ESPERA! NÃO VÁ EMBORA AINDA...</h2>
          <p class="exit-intent-sub">Você acaba de ganhar uma condição única e exclusiva por tempo limitado.</p>
          
          <div class="exit-intent-proof">
            🔥 14 pessoas compraram o Método Balde de Ouro nos últimos 30 minutos.
          </div>

          <div class="exit-intent-offer">
            <div class="oferta-de">De R$ 97,00</div>
            <div class="oferta-por">por apenas</div>
            <div class="oferta-valor" style="color: var(--green-dark);">R$ 57,90</div>
          </div>

          <button id="exit-intent-cta" class="btn btn-cta exit-intent-btn">QUERO APROVEITAR O DESCONTO AGORA!</button>
          
          <p class="exit-intent-scarcity">Esta é a sua última chance de garantir o acesso. Se você fechar esta página, o preço voltará ao normal e você pode perder sua vaga no grupo atual.</p>
        </div>
      </div>
    </div>
  `;

  // Injeta o HTML no fim do body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const overlay = document.getElementById('exit-intent-overlay');
  const closeBtn = document.getElementById('exit-intent-close');
  const ctaBtn = document.getElementById('exit-intent-cta');
  
  let isModalVisible = false;

  // Função para exibir o modal
  const showModal = () => {
    if (!isModalVisible && !sessionStorage.getItem('exitIntentShown')) {
      overlay.classList.add('active');
      isModalVisible = true;
      sessionStorage.setItem('exitIntentShown', 'true');
    }
  };

  // Função para esconder o modal
  const hideModal = () => {
    overlay.classList.remove('active');
    isModalVisible = false;
  };

  // Eventos de fechamento
  closeBtn.addEventListener('click', hideModal);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideModal();
    }
  });

  // Ação do botão: Aplicar o desconto na página e ir para a oferta
  ctaBtn.addEventListener('click', () => {
    hideModal();
    
    // Altera os textos de oferta na página para refletir o downsell
    const ofertaValores = document.querySelectorAll('.oferta-valor');
    ofertaValores.forEach(el => {
      if(el.textContent.includes('97')) {
         el.textContent = 'R$ 57,90';
      }
    });

    const ofertaDe = document.querySelectorAll('.oferta-de');
    ofertaDe.forEach(el => el.textContent = 'De R$ 97,00');

    // Navega até a seção de oferta
    const ofertaSection = document.querySelector('#oferta');
    if(ofertaSection) {
      ofertaSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // GATILHO DESKTOP: Quando o mouse sai da janela pelo topo (tentativa de fechar ou trocar de aba)
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0) {
      showModal();
    }
  });

  // GATILHO MOBILE: Scroll rápido para cima
  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastScrollTime;
    
    // Verifica se rolou para cima e o tempo entre os eventos
    if (currentScrollY < lastScrollY && timeDiff > 0) {
      const scrollSpeed = (lastScrollY - currentScrollY) / timeDiff;
      
      // Se a velocidade for alta e não estiver no topo da página
      if (scrollSpeed > 2 && currentScrollY > 100) {
        showModal();
      }
    }
    
    lastScrollY = currentScrollY;
    lastScrollTime = currentTime;
  });
});
