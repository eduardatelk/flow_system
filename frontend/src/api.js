const BASE_URL = "/api";
const CHAVE_TOKEN = "flow_token";

export function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

function salvarToken(token) {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function limparToken() {
  localStorage.removeItem(CHAVE_TOKEN);
}

function montarCabecalhos(comJson = false) {
  const base = {};
  if (comJson) base["Content-Type"] = "application/json";
  const token = obterToken();
  if (token) base["Authorization"] = `Bearer ${token}`;
  return base;
}

async function tratarResposta(resposta) {
  if (resposta.status === 401) {
    limparToken();
    window.location.reload();
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    throw new Error(corpo.erro || `Erro na requisição (HTTP ${resposta.status})`);
  }
  if (resposta.status === 204) return null;
  return resposta.json();
}

export const api = {
  logar: async (email, senha) => {
    const resposta = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: montarCabecalhos(true),
      body: JSON.stringify({ email, senha }),
    });
    const dados = await tratarResposta(resposta);
    salvarToken(dados.token);
    return dados.usuario;
  },

  listarAlunos: (busca = "") =>
    fetch(`${BASE_URL}/alunos${busca ? `?busca=${encodeURIComponent(busca)}` : ""}`, {
      headers: montarCabecalhos(),
    }).then(tratarResposta),
  criarAluno: (dados) =>
    fetch(`${BASE_URL}/alunos`, {
      method: "POST",
      headers: montarCabecalhos(true),
      body: JSON.stringify(dados),
    }).then(tratarResposta),
  editarAluno: (id, dados) =>
    fetch(`${BASE_URL}/alunos/${id}`, {
      method: "PUT",
      headers: montarCabecalhos(true),
      body: JSON.stringify(dados),
    }).then(tratarResposta),
  removerAluno: (id) =>
    fetch(`${BASE_URL}/alunos/${id}`, { method: "DELETE", headers: montarCabecalhos() }).then(
      tratarResposta
    ),

  listarUsuarios: () =>
    fetch(`${BASE_URL}/usuarios`, { headers: montarCabecalhos() }).then(tratarResposta),
  criarUsuario: (dados) =>
    fetch(`${BASE_URL}/usuarios`, {
      method: "POST",
      headers: montarCabecalhos(true),
      body: JSON.stringify(dados),
    }).then(tratarResposta),
  removerUsuario: (id) =>
    fetch(`${BASE_URL}/usuarios/${id}`, { method: "DELETE", headers: montarCabecalhos() }).then(
      tratarResposta
    ),

  listarAulas: () => fetch(`${BASE_URL}/agenda`, { headers: montarCabecalhos() }).then(tratarResposta),
  criarAula: (dados) =>
    fetch(`${BASE_URL}/agenda`, {
      method: "POST",
      headers: montarCabecalhos(true),
      body: JSON.stringify(dados),
    }).then(tratarResposta),
  editarAula: (id, dados) =>
    fetch(`${BASE_URL}/agenda/${id}`, {
      method: "PUT",
      headers: montarCabecalhos(true),
      body: JSON.stringify(dados),
    }).then(tratarResposta),
  removerAula: (id) =>
    fetch(`${BASE_URL}/agenda/${id}`, { method: "DELETE", headers: montarCabecalhos() }).then(
      tratarResposta
    ),
};
