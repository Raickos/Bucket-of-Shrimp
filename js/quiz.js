/* Método Balde de Ouro — Quiz state machine */

const TOTAL_STEPS = 10; // 0..9
let currentStep = 0;
const answers = {};

const cards = document.querySelectorAll('[data-step]');
const progressBar = document.getElementById('progress');

function showStep(n) {
  cards.forEach(c => c.style.display = 'none');
  const target = document.querySelector(`[data-step="${n}"]`);
  if (target) target.style.display = 'block';
  updateProgress(n);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  currentStep = n;
}

function updateProgress(n) {
  // Progress: começa em 5% na capa, 100% no resultado
  const pct = Math.min(100, Math.max(5, Math.round((n / (TOTAL_STEPS - 1)) * 100)));
  progressBar.style.width = pct + '%';
}

function nextStep() {
  showStep(currentStep + 1);
}

// Opções clicáveis
document.querySelectorAll('.quiz-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const q = btn.dataset.q;
    const v = btn.dataset.v;
    answers['q' + q] = v;

    // Feedback visual
    btn.parentElement.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Avança após curta pausa (mostra seleção)
    setTimeout(() => nextStep(), 280);
  });
});

// Cálculo de potencial
function calcularPotencial() {
  // Base por espaço (baldes realistas)
  const baldesPorEspaco = {
    grande: 10,
    pequeno: 5,
    varanda: 2,
    nao_sei: 5
  };
  const baldes = baldesPorEspaco[answers.q3] || 5;

  // R$ por balde por mês (conservador)
  const lucroPorBalde = 280;
  const potencialBase = baldes * lucroPorBalde;

  // Ajuste pela meta declarada (não ultrapassa muito o que o espaço permite)
  const metaMap = { '500': 750, '1500': 2000, '3000': 3500 };
  const meta = metaMap[answers.q4] || 2000;

  // Pega o menor entre potencial do espaço e meta (realismo)
  // mas garante mínimo de R$ 800 para manter engajamento
  const potencial = Math.max(800, Math.min(potencialBase, meta));

  return Math.round(potencial / 100) * 100; // arredonda pra centena
}

function formatarBRL(v) {
  return 'R$ ' + v.toLocaleString('pt-BR');
}

// Submissão do formulário de captura
function submitLead(e) {
  e.preventDefault();

  const lead = {
    nome: document.getElementById('nome').value.trim(),
    email: document.getElementById('email').value.trim(),
    whatsapp: document.getElementById('whatsapp').value.trim(),
    respostas: { ...answers },
    timestamp: new Date().toISOString()
  };

  // Salva no localStorage (pode ser enviado pra webhook/CRM depois)
  try {
    const leads = JSON.parse(localStorage.getItem('bo_leads') || '[]');
    leads.push(lead);
    localStorage.setItem('bo_leads', JSON.stringify(leads));
    localStorage.setItem('bo_current_lead', JSON.stringify(lead));
  } catch(err) { console.warn('localStorage falhou:', err); }

  // TODO: integrar com webhook/Zapier/Make/API
  // fetch('https://seu-webhook.com/lead', { method:'POST', body: JSON.stringify(lead) });

  // Tela de loading
  showStep(8);

  // Simula processamento e mostra resultado
  setTimeout(() => {
    const valor = calcularPotencial();
    document.getElementById('resultAmount').textContent = formatarBRL(valor);
    showStep(9);
  }, 2200);
}

// Máscara simples pro WhatsApp
document.getElementById('whatsapp').addEventListener('input', function(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
  else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5}).*/, '($1) $2');
  else if (v.length > 0) v = v.replace(/(\d{0,2}).*/, '($1');
  e.target.value = v;
});

// Inicializa
showStep(0);
