// ===== CONFIGURAÇÃO TMDB =====
const CHAVE_API_ATOR = "740c868ae156da5bdc7834ad4fbe7b29";
const URL_BASE_ATOR = "https://api.themoviedb.org/3";

// ===== CONEXÕES COM HTML =====
const campoBuscaAtor = document.getElementById("campo-busca-ator");
const botaoBuscar = document.getElementById("botao-buscar-ator");
const botaoFiltrar = document.getElementById("botao-filtrar-genero");
const listaResultados = document.getElementById("lista-resultados");
const mensagemStatusAtor = document.getElementById("mensagem-status-ator");
const selectGenero = document.getElementById("select-genero");
const botaoAnterior = document.getElementById("botao-anterior");
const botaoProximo = document.getElementById("botao-proximo");

// ===== VARIÁVEIS DE CONTROLE =====
let termoBusca = "";
let paginaAtual = 1;
let todosFilmes = [];
let generoSelecionado = "";

// ===== EVENTOS =====
botaoBuscar.addEventListener("click", buscarAtor);
botaoFiltrar.addEventListener("click", filtrarPorGenero);
botaoProximo.addEventListener("click", proximaPagina);
botaoAnterior.addEventListener("click", paginaAnterior);
campoBuscaAtor.addEventListener("keypress", (e) => {
  if (e.key === "Enter") buscarAtor();
});

// ===== FUNÇÃO PRINCIPAL =====
async function buscarAtor() {
  termoBusca = campoBuscaAtor.value.trim();
  paginaAtual = 1;
  generoSelecionado = "";
  selectGenero.value = "";

  if (!termoBusca) {
    mensagemStatusAtor.textContent = "Digite o nome de um ator para pesquisar.";
    listaResultados.innerHTML = "";
    return;
  }

  mensagemStatusAtor.textContent = "🔄 Buscando filmes, aguarde...";
  listaResultados.innerHTML = "";

  try {
    // Buscar o ator pelo nome
    const urlPessoa = `${URL_BASE_ATOR}/search/person?api_key=${CHAVE_API_ATOR}&language=pt-BR&query=${encodeURIComponent(
      termoBusca
    )}&page=${paginaAtual}`;
    const respostaPessoa = await fetch(urlPessoa);
    const dadosPessoa = await respostaPessoa.json();

    if (dadosPessoa.results.length === 0) {
      mensagemStatusAtor.textContent = "Nenhum ator encontrado.";
      return;
    }

    const ator = dadosPessoa.results[0];
    const atorId = ator.id;

    // Buscar os filmes do ator
    const urlFilmes = `${URL_BASE_ATOR}/person/${atorId}/movie_credits?api_key=${CHAVE_API_ATOR}&language=pt-BR`;
    const respostaFilmes = await fetch(urlFilmes);
    const dadosFilmes = await respostaFilmes.json();

    if (!dadosFilmes.cast || dadosFilmes.cast.length === 0) {
      mensagemStatusAtor.textContent = `Nenhum filme encontrado para ${ator.name}.`;
      return;
    }

    todosFilmes = dadosFilmes.cast;
    exibirFilmes(todosFilmes);
    mensagemStatusAtor.textContent = `🎬 Mostrando filmes com ${ator.name}`;
  } catch (erro) {
    console.error(erro);
    mensagemStatusAtor.textContent = "❌ Erro ao buscar dados. Verifique sua conexão.";
  }
}

// ===== FILTRAR POR GÊNERO =====
function filtrarPorGenero() {
  generoSelecionado = selectGenero.value;

  if (!todosFilmes || todosFilmes.length === 0) {
    mensagemStatusAtor.textContent = "Faça uma busca primeiro!";
    return;
  }

  if (!generoSelecionado) {
    exibirFilmes(todosFilmes);
    mensagemStatusAtor.textContent = "🎞️ Mostrando todos os filmes do ator.";
    return;
  }

  const filtrados = todosFilmes.filter((filme) =>
    filme.genre_ids.includes(Number(generoSelecionado))
  );

  if (filtrados.length === 0) {
    listaResultados.innerHTML = `<p>Nenhum filme encontrado para o gênero selecionado.</p>`;
    mensagemStatusAtor.textContent = "⚠️ Nenhum filme encontrado nesse gênero.";
  } else {
    exibirFilmes(filtrados);
    mensagemStatusAtor.textContent = "🎯 Filmes filtrados por gênero.";
  }
}

// ===== PAGINAÇÃO =====
function proximaPagina() {
  paginaAtual++;
  buscarAtor();
}

function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    buscarAtor();
  }
}

// ===== EXIBIÇÃO =====
function exibirFilmes(filmes) {
  listaResultados.innerHTML = "";

  filmes.forEach((filme) => {
    const div = document.createElement("div");
    div.classList.add("card");

    const poster = filme.poster_path
      ? `https://image.tmdb.org/t/p/w300${filme.poster_path}`
      : "https://via.placeholder.com/300x450?text=Sem+Poster";

    div.innerHTML = `
      <img src="${poster}" alt="Pôster de ${filme.title}">
      <h3>${filme.title}</h3>
      <p>Ano: ${filme.release_date ? filme.release_date.slice(0, 4) : "Sem data"}</p>
      <p><small>Personagem: ${filme.character || "Desconhecido"}</small></p>
    `;

    listaResultados.appendChild(div);
  });
}
