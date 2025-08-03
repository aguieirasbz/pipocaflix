// Array para armazenar os filmes carregados e os novos
let todosFilmes = [];

// Elementos do DOM
const form = document.getElementById('addMovieForm');
const tituloInput = document.getElementById('titulo');
const categoriaInput = document.getElementById('categoria');
const videoIdInput = document.getElementById('videoId');
const outputTextarea = document.getElementById('outputJson');
const copyButton = document.getElementById('copyButton');
const movieListElement = document.getElementById('movieList');

// 1. Função para carregar os filmes existentes do filmes.json
async function carregarFilmesIniciais() {
  try {
    const response = await fetch("filmes.json");
    if (!response.ok) throw new Error(`Erro ao carregar o arquivo: ${response.status}`);
    todosFilmes = await response.json();
    atualizarSaida();
    renderizarListaDeFilmes();
  } catch (error) {
    console.error("Não foi possível carregar filmes.json:", error);
    alert("Erro ao carregar o arquivo filmes.json. Verifique o console para mais detalhes.");
  }
}

// 2. Função para adicionar um novo filme (chamada pelo formulário)
function adicionarFilme(event) {
  event.preventDefault(); // Impede o recarregamento da página

  const novoFilme = {
    titulo: tituloInput.value.trim(),
    categoria: categoriaInput.value.trim(),
    videoId: videoIdInput.value.trim()
  };

  // Validação de campos vazios
  if (!novoFilme.titulo || !novoFilme.categoria || !novoFilme.videoId) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  // =========================================================
  //        NOVO CÓDIGO DE VALIDAÇÃO PARA ID DUPLICADO
  // =========================================================
  const idJaExiste = todosFilmes.some(filme => filme.videoId === novoFilme.videoId);

  if (idJaExiste) {
    alert(`ERRO: O ID de vídeo "${novoFilme.videoId}" já foi cadastrado. Por favor, verifique a lista de filmes atuais.`);
    return; // Para a execução da função aqui
  }
  // =========================================================
  //                  FIM DA VALIDAÇÃO
  // =========================================================


  // Adiciona o novo filme ao final do array
  todosFilmes.push(novoFilme);

  // Limpa o formulário
  form.reset();

  // Atualiza a tela
  alert(`Filme "${novoFilme.titulo}" adicionado à lista! Agora copie o JSON atualizado abaixo.`);
  atualizarSaida();
  renderizarListaDeFilmes();
  tituloInput.focus(); // Coloca o foco de volta no primeiro campo
}

// 3. Função para atualizar o <textarea> com o JSON final
function atualizarSaida() {
  // O 'null, 2' formata o JSON para ser legível
  const jsonString = JSON.stringify(todosFilmes, null, 2);
  outputTextarea.value = jsonString;
}

// 4. Função para exibir a lista de filmes atuais
function renderizarListaDeFilmes() {
    movieListElement.innerHTML = ''; // Limpa a lista antiga
    todosFilmes.forEach(filme => {
        const li = document.createElement('li');
        li.textContent = `"${filme.titulo}" (ID: ${filme.videoId})`;
        movieListElement.appendChild(li);
    });
}

// 5. Função para copiar o JSON para a área de transferência
function copiarJson() {
    if (!navigator.clipboard) {
        alert("A cópia automática não é suportada neste navegador. Por favor, copie manualmente.");
        return;
    }
    navigator.clipboard.writeText(outputTextarea.value).then(() => {
        copyButton.textContent = 'Copiado com Sucesso!';
        setTimeout(() => {
            copyButton.textContent = 'Copiar para Área de Transferência';
        }, 3000);
    }).catch(err => {
        console.error('Erro ao copiar texto: ', err);
        alert('Falha ao copiar o texto.');
    });
}


// Event Listeners
form.addEventListener('submit', adicionarFilme);
copyButton.addEventListener('click', copiarJson);

// Carrega os filmes assim que a página é aberta
window.onload = carregarFilmesIniciais;