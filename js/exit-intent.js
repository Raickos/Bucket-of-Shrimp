document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('exitModal');
  const vendasCountEl = document.getElementById('vendas-count');
  let isModalVisible = false;
  let intervalId;

  // Função global para fechar o modal
  window.closeExitModal = function() {
    modal.classList.remove('active');
    isModalVisible = false;
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  // Simulação de Vendas
  const startSalesSimulation = () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      let currentCount = parseInt(vendasCountEl.textContent, 10);
      // Aumenta o número de forma aleatória em 1 ou 2
      const increase = Math.floor(Math.random() * 2) + 1;
      vendasCountEl.textContent = currentCount + increase;
    }, 4500); // atualiza a cada 4.5 segundos
  };

  const showModal = () => {
    // Frequência: Usar localStorage para garantir que o pop-up apareça apenas uma vez
    if (!isModalVisible && !localStorage.getItem('exitIntentShown')) {
      modal.classList.add('active');
      isModalVisible = true;
      localStorage.setItem('exitIntentShown', 'true');
      startSalesSimulation();
    }
  };

  // 1. Gatilho: Detectar quando o mouse sai do topo da janela (clientY < 10)
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 10) {
      showModal();
    }
  });

  // 3. Mobile Gatilho Alternativo
  // Pop-up aparecer automaticamente após 20 segundos de navegação
  setTimeout(() => {
    showModal();
  }, 20000);

  // Scroll rápido para cima
  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastScrollTime;
    
    // Verifica se o usuário está subindo a página (scroll rápido)
    if (currentScrollY < lastScrollY && timeDiff > 0) {
      const scrollSpeed = (lastScrollY - currentScrollY) / timeDiff;
      // Ajuste de sensibilidade (px/ms)
      if (scrollSpeed > 2 && currentScrollY > 100) {
        showModal();
      }
    }
    
    lastScrollY = currentScrollY;
    lastScrollTime = currentTime;
  });
  
  // Opcional: fechar ao clicar no overlay escuro
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeExitModal();
    }
  });
});
