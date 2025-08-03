// =================== VARIÁVEIS GLOBAIS ===================
let todosFilmes = [];
let categoriaSelecionada = "Todos";
let videoAtualId = null;

// =================== LÓGICA DO SLIDER ===================
let slideAtual = 0;
let slideInterval;
function mostrarSlide(index) {
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return;
  if (index >= slides.length) slideAtual = 0;
  if (index < 0) slideAtual = slides.length - 1;
  slides.forEach((slide, i) => {
    slide.style.opacity = '0';
    slide.classList.remove('active');
  });
  slides[slideAtual].style.opacity = '1';
  slides[slideAtual].classList.add('active');
}
function proximoSlide() { slideAtual++; mostrarSlide(slideAtual); }
function anteriorSlide() { slideAtual--; mostrarSlide(slideAtual); }
function iniciarSlider() {
  const slides = document.querySelectorAll('.slide');
  if(slides.length > 0) {
    document.querySelector('.next-slide').addEventListener('click', () => { proximoSlide(); reiniciarIntervaloSlider(); });
    document.querySelector('.prev-slide').addEventListener('click', () => { anteriorSlide(); reiniciarIntervaloSlider(); });
    mostrarSlide(slideAtual);
    slideInterval = setInterval(proximoSlide, 5000);
  }
}
function reiniciarIntervaloSlider() { clearInterval(slideInterval); slideInterval = setInterval(proximoSlide, 5000); }

// =================== LÓGICA PRINCIPAL DA APLICAÇÃO ===================

/**
 * <<< NOVA FUNÇÃO PARA CRIAR O BANNER DINAMICAMENTE >>>
 * Pega os últimos 5 filmes e os adiciona como slides no banner.
 */
function criarBannerDinamico(filmes) {
  const containerSlides = document.querySelector('.slides');
  containerSlides.innerHTML = ''; // Limpa o container caso haja algo

  // Pega os últimos 5 filmes do array. Se houver menos de 5, pega todos.
  const filmesDoBanner = filmes.slice(-5);

  filmesDoBanner.forEach((filme, index) => {
    const slide = document.createElement('div');
    slide.classList.add('slide');
    if (index === 0) {
      slide.classList.add('active'); // O primeiro slide começa como ativo
    }
    
    // Define a imagem de fundo do slide
    const imagemDeFundo = `https://i3.ytimg.com/vi/${filme.videoId}/maxresdefault.jpg`;
    slide.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.8) 20%, transparent 100%), url('${imagemDeFundo}')`;

    // Cria o conteúdo do slide (título e descrição)
    const slideContent = document.createElement('div');
    slideContent.classList.add('slide-content');
    slideContent.innerHTML = `
      <h2 class="banner-title">${filme.titulo}</h2>
      <p class="banner-description">Um dos mais novos filmes adicionados ao nosso catálogo.</p>
      <div class="banner-buttons">
        <button class="play-button"><i class="fas fa-play"></i> Assistir Agora</button>
      </div>
    `;
    
    // <<< FAZ O SLIDE INTEIRO SER CLICÁVEL >>>
    slide.onclick = () => mostrarPlayer(`https://www.youtube.com/embed/${filme.videoId}`, filme.videoId);
    
    slide.appendChild(slideContent);
    containerSlides.appendChild(slide);
  });
}


async function carregarFilmes() {
  try {
    const response = await fetch("filmes.json");
    if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);
    todosFilmes = await response.json();
    
    // <<< ORDEM DE INICIALIZAÇÃO ATUALIZADA >>>
    criarBannerDinamico(todosFilmes); // 1. Cria o banner com os filmes carregados
    iniciarSlider();                   // 2. Inicia a lógica do slider DEPOIS que os slides foram criados
    criarTabs();                       // 3. Cria os filtros de categoria
    exibirFilmes();                    // 4. Exibe o catálogo de filmes
    
  } catch (error) {
    console.error("Não foi possível carregar o arquivo de filmes:", error);
    document.getElementById("catalogo").innerHTML = "<p style='color: red; text-align: center;'>Erro ao carregar os filmes.</p>";
  }
}

function criarTabs() {
  const categorias = ["Todos", ...new Set(todosFilmes.map(filme => filme.categoria))];
  const tabsContainer = document.getElementById("tabs");
  tabsContainer.innerHTML = "";
  categorias.forEach(cat => {
    const tab = document.createElement("div");
    tab.classList.add("tab");
    if (cat === categoriaSelecionada) tab.classList.add("active");
    tab.textContent = cat;
    tab.onclick = () => {
      categoriaSelecionada = cat;
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      exibirFilmes();
      fecharPlayer();
    };
    tabsContainer.appendChild(tab);
  });
}

function exibirFilmes() {
  const container = document.getElementById("catalogo");
  container.innerHTML = "";
  const busca = document.getElementById("searchInput").value.toLowerCase();
  let filmesFiltrados = todosFilmes;

  if (categoriaSelecionada !== "Todos") filmesFiltrados = filmesFiltrados.filter(filme => filme.categoria === categoriaSelecionada);
  if (busca) filmesFiltrados = filmesFiltrados.filter(filme => filme.titulo.toLowerCase().includes(busca));
  
  filmesFiltrados.forEach((filme, index) => {
    if (index > 0 && index % 8 === 0) {
      const adCard = document.createElement("div");
      adCard.classList.add("ad-card");
      adCard.innerHTML = "<p>Anúncio<br>(300x250)</p>";
      container.appendChild(adCard);
    }

    const card = document.createElement("div");
    card.classList.add("filme-card");
    card.onclick = () => mostrarPlayer(`https://www.youtube.com/embed/${filme.videoId}`, filme.videoId);
    const img = document.createElement("img");
    img.src = `https://i3.ytimg.com/vi/${filme.videoId}/hqdefault.jpg`;
    const p = document.createElement("p");
    p.textContent = filme.titulo;
    card.appendChild(img);
    card.appendChild(p);
    container.appendChild(card);
  });
}

function buscarFilmes() { exibirFilmes(); fecharPlayer(); }

function mostrarPlayer(link, videoId) {
  videoAtualId = videoId;
  const playerSection = document.getElementById("player-section");
  const frame = document.getElementById("videoFrame");
  frame.src = `${link}?autoplay=1&rel=0`;
  playerSection.style.display = "block";
  exibirFeedback(videoId);
  playerSection.scrollIntoView({ behavior: "smooth", block: "center" });
}

function fecharPlayer() {
  const playerSection = document.getElementById("player-section");
  const frame = document.getElementById("videoFrame");
  frame.src = "";
  playerSection.style.display = "none";
  videoAtualId = null;
  document.getElementById("feedbackInput").value = "";
  if(document.getElementById("feedbackContainer")) document.getElementById("feedbackContainer").innerHTML = "";
}

function salvarFeedback() {
  const input = document.getElementById("feedbackInput");
  const comentario = input.value.trim();
  if (comentario && videoAtualId) {
    const feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || {};
    if (!feedbacks[videoAtualId]) feedbacks[videoAtualId] = [];
    feedbacks[videoAtualId].push(comentario);
    localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
    input.value = "";
    exibirFeedback(videoAtualId);
  }
}

function exibirFeedback(videoId) {
  const container = document.getElementById("feedbackContainer");
  if (!container) return;
  container.innerHTML = "<h4>Comentários</h4>";
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || {};
  const comentariosDoVideo = feedbacks[videoId] || [];
  if (comentariosDoVideo.length === 0) {
    container.innerHTML += "<p>Nenhum feedback ainda. Seja o primeiro!</p>";
  } else {
    comentariosDoVideo.forEach(comentario => {
      const post = document.createElement("div");
      post.classList.add("feedback-post");
      post.textContent = comentario;
      container.appendChild(post);
    });
  }
}

// =================== INICIALIZAÇÃO DA PÁGINA ===================
// Agora a inicialização é mais simples, apenas chamamos a função principal.
window.onload = carregarFilmes;