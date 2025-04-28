// Função para alternar a exibição do submenu
function toggleSubMenu(button) {
  const subMenu = button.nextElementSibling;
  subMenu.style.display = subMenu.style.display === "flex" ? "none" : "flex";
}

// Função para buscar os casos filtrados
async function fetchCases() {
  const filterStatus = document.getElementById('filter-status');
  const filterDate = document.getElementById('filter-date');
  const searchCase = document.getElementById('search-case');
  const caseListContainer = document.querySelector('.cases-list-container');

  const statusValue = filterStatus.value;
  const dateValue = filterDate.value;
  const searchValue = searchCase.value.toLowerCase();

  // Verifica se o token está disponível
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Você precisa estar logado!");
    return;
  }

  try {
    // Construção da URL com os filtros
    const url = new URL('https://laudos-pericias.onrender.com/api/cases');
    const params = {
      status: statusValue,
      date: dateValue,
      search: searchValue
    };

    // Adicionando os parâmetros de consulta à URL
    Object.keys(params).forEach(key => {
      if (params[key]) {
        url.searchParams.append(key, params[key]);
      }
    });

    // Exibe mensagem de carregamento
    caseListContainer.innerHTML = "<p class='loading-message'>Carregando casos...</p>";

    // Fazendo a requisição GET para o backend com autenticação JWT
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Erro ao buscar casos");
    }

    const cases = await response.json();

    // Limpar a lista de casos antes de adicionar os novos
    caseListContainer.innerHTML = '';

    if (!cases || cases.length === 0) {
      caseListContainer.innerHTML = "<p class='error-message'>Nenhum caso encontrado.</p>";
      return;
    }

    // Adicionando os casos retornados pela API
    cases.forEach((caseItem) => {
      const caseElement = document.createElement('div');
      caseElement.classList.add('case-list-item');

      caseElement.innerHTML = `
        <div class="case-list-content" onclick="window.location='view-case.html?id=${caseItem._id}'">
          <div class="case-list-main">
            <span class="case-id">#${caseItem._id}</span>
            <h3 class="case-title">${caseItem.title}</h3>
            <span class="case-status ${getStatusClass(caseItem.status)}">${caseItem.status}</span>
          </div>
          <div class="case-list-details">
            <p class="case-description">${caseItem.description}</p>
            <div class="case-meta">
              <span><i class="fas fa-calendar-alt"></i> ${formatDate(caseItem.openDate)}</span>
              <span><i class="fas fa-user-md"></i> ${caseItem.expert}</span>
            </div>
          </div>
        </div>
      `;

      caseListContainer.appendChild(caseElement);
    });
  } catch (error) {
    console.error("Erro ao buscar casos:", error);
    caseListContainer.innerHTML = "<p class='error-message'>Erro ao carregar casos. Tente novamente.</p>";
  }
}

// Função para obter a classe de status do caso (ajuste conforme necessário)
function getStatusClass(status) {
  switch (status) {
    case 'aberto':
      return 'status-aberto';
    case 'em andamento':
      return 'status-em-andamento';
    case 'pendente':
      return 'status-pendente';
    case 'concluído':
      return 'status-concluido';
    default:
      return '';
  }
}

// Função para formatar as datas
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', options);
}

// Função de filtro de casos
function filterCases() {
  fetchCases();
}

// Adicionar ouvintes de eventos aos filtros
document.getElementById('filter-status').addEventListener('change', filterCases);
document.getElementById('filter-date').addEventListener('change', filterCases);
document.getElementById('search-case').addEventListener('input', filterCases);

// Inicializa a busca ao carregar a página
window.addEventListener('load', fetchCases);
