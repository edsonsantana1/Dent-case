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

  // Obtém o token do usuário
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole"); // Pegando a role do usuário

  console.log("Token armazenado:", token);
  console.log("Role do usuário:", userRole);

  if (!token) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
    return;
  }

  // Verifica se o usuário tem permissão para acessar casos
  if (userRole !== "admin" && userRole !== "perito") {
    alert("Você não tem permissão para acessar esta página.");
    window.location.href = "dashboard.html"; // Redireciona para a página inicial
    return;
  }

  try {
    // Construção da URL com filtros
    const url = new URL('https://laudos-pericias.onrender.com/api/cases');
    const params = { status: statusValue, date: dateValue, search: searchValue };

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

    console.log("Status da requisição:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        alert("Sessão expirada! Faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
      } else if (response.status === 403) {
        alert("Acesso negado! Você não tem permissão.");
        window.location.href = "dashboard.html";
      }
      
      const errorData = await response.json();
      throw new Error(errorData.msg || "Erro ao buscar casos");
    }

    const cases = await response.json();
    console.log("Casos recebidos:", cases);

    // Limpar a lista antes de adicionar os novos
    caseListContainer.innerHTML = '';

    if (!cases || cases.length === 0) {
      caseListContainer.innerHTML = "<p class='error-message'>Nenhum caso encontrado.</p>";
      return;
    }

    // Adicionando os casos retornados pela API
    cases.forEach((caseItem) => {
      if (!caseItem._id || !caseItem.title || !caseItem.status) return;

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
            <p class="case-description">${caseItem.description || "Sem descrição"}</p>
            <div class="case-meta">
              <span><i class="fas fa-calendar-alt"></i> ${formatDate(caseItem.openDate)}</span>
              <span><i class="fas fa-user-md"></i> ${caseItem.expert || "Não informado"}</span>
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

// Função para obter a classe de status do caso
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
  if (!dateString) return "Data não informada";

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