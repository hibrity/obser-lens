// =============================================
// CONFIGURAÇÃO DO RISKLENS
// =============================================

// Supabase
const SUPABASE_URL = "https://ejhfhvxdoxuhpziruqsi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaGZodnhkb3h1aHB6aXJ1cXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDc5NTMsImV4cCI6MjEwMjcyMzk1M30.xLrZr6qevOs1Y_WQOrUklwR_bdZAuQhcwGax9QEXh9I";

// Edge Function (SEM chave do Gemini aqui!)
const EDGE_FUNCTION_URL = "https://ejhfhvxdoxuhpziruqsi.supabase.co/functions/v1/analyze-risk";

// Criar cliente Supabase
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================================
// FUNÇÃO PARA CHAMAR A IA (via Edge Function)
// =============================================
async function analyzeRisk(photoBase64, envType, description, responses) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      photo_base64: photoBase64,
      environment_type: envType,
      description: description,
      responses: responses,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Erro na análise");
  }

  return await response.json();
}

// =============================================
// FUNÇÕES COMPARTILHADAS
// =============================================

async function checkAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  return session.user;
}

async function doLogout() {
  await sb.auth.signOut();
  window.location.href = "index.html";
}

function showMsg(elementId, text, type) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
  }
}

const questionsDB = {
  estrutura_fisica: [
    { key: 'cracks', label: 'A estrutura apresenta trincas ou rachaduras?' },
    { key: 'rust', label: 'Há sinais de ferrugem ou corrosão?' },
    { key: 'humidity', label: 'Existem manchas de umidade ou infiltração?' },
    { key: 'deformation', label: 'Alguma parte parece deformada ou inclinada?' },
    { key: 'people', label: 'Há circulação de pessoas próximo?' },
    { key: 'recent_event', label: 'Houve evento recente (chuva forte, impacto)?' }
  ],
  trabalho: [
    { key: 'epi', label: 'Os trabalhadores estão usando EPI adequado?' },
    { key: 'height', label: 'Há trabalho em altura (acima de 2m)?' },
    { key: 'electric', label: 'Existem fios expostos ou improvisados?' },
    { key: 'machines', label: 'Há máquinas com partes móveis expostas?' },
    { key: 'chemicals', label: 'Existem produtos químicos no local?' },
    { key: 'training', label: 'Os trabalhadores possuem treinamento?' }
  ],
  residencial: [
    { key: 'children', label: 'O local é usado por crianças?' },
    { key: 'elderly', label: 'Há idosos ou pessoas com mobilidade reduzida?' },
    { key: 'slippery', label: 'O piso fica escorregadio quando molhado?' },
    { key: 'wires', label: 'Existem tomadas ou fios expostos?' },
    { key: 'lighting', label: 'A iluminação é suficiente?' },
    { key: 'chemicals', label: 'Há produtos químicos acessíveis?' }
  ],
  comercial: [
    { key: 'public', label: 'O local recebe público externo?' },
    { key: 'floor', label: 'O piso está íntegro e antiderrapante?' },
    { key: 'exits', label: 'As rotas de fuga estão livres?' },
    { key: 'extinguisher', label: 'O extintor está acessível?' },
    { key: 'wires', label: 'Existem cabos expostos?' },
    { key: 'stacking', label: 'Há mercadorias empilhadas instáveis?' }
  ],
  publico: [
    { key: 'circulation', label: 'O local tem circulação de pessoas?' },
    { key: 'holes', label: 'Existem buracos ou obstáculos?' },
    { key: 'lighting', label: 'A iluminação é suficiente?' },
    { key: 'trees', label: 'Há árvores com risco de queda?' },
    { key: 'signage', label: 'Existe sinalização de perigo?' },
    { key: 'water', label: 'Há acúmulo de água?' }
  ],
  area_externa: [
    { key: 'terrain', label: 'O terreno é irregular ou instável?' },
    { key: 'vegetation', label: 'Há vegetação com risco de queda?' },
    { key: 'drainage', label: 'Há acúmulo de água?' },
    { key: 'structures', label: 'Existem estruturas danificadas?' },
    { key: 'animals', label: 'Há animais perigosos na região?' },
    { key: 'access', label: 'O acesso é usado por crianças ou idosos?' }
  ],
  outro: [
    { key: 'risk', label: 'Você identifica algum risco visível?' },
    { key: 'people', label: 'Há pessoas circulando no local?' },
    { key: 'structure', label: 'Existe estrutura instável?' },
    { key: 'electric', label: 'Há risco elétrico visível?' },
    { key: 'chemical', label: 'Há substâncias químicas ou vazamentos?' }
  ]
};

const envLabels = {
  estrutura_fisica: '🏗️ Estrutura física',
  trabalho: '👷 Trabalho',
  residencial: '🏠 Residencial',
  comercial: '🏪 Comercial',
  publico: '🏛️ Público',
  area_externa: '🌳 Área externa',
  outro: '📌 Outro'
};

const statusLabels = {
  pendente: 'Pendente',
  processando: 'Processando',
  concluido: 'Concluído',
  erro: 'Erro'
};
