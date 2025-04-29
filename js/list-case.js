async function fetchCases() {
  const caseListContainer = document.querySelector('.cases-list-container');
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
    return;
  }

  try {
    // Construindo a URL sem filtros para teste
    const url = new URL('https://laudos-pericias.onrender.com/api/cases');
    const filters = {
      status: document.getElementById('filter-status').value,
      date: document.getElementById('filter-date').value,
      search: document.getElementById('search-case').value.toLowerCase()
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        url.searchParams.append(key, value);
      }
    });

    caseListContainer.innerHTML = "<p class='loading-message'>Carregando casos...</p>";

    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert("Sessão expirada! Faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
      } else {
        throw new Error("Erro ao buscar casos");
      }
    }

    const cases = await response.json();
    renderCases(cases);
  } catch (error) {
    console.error("Erro ao buscar casos:", error);
    caseListContainer.innerHTML = "<p class='error-message'>Erro ao carregar casos.</p>";
  }
}

function renderCases(cases) {
  const caseListContainer = document.querySelector('.cases-list-container');
  caseListContainer.innerHTML = ''; // Limpa antes de renderizar

  if (!cases.length) {
    caseListContainer.innerHTML = "<p class='error-message'>Nenhum caso encontrado.</p>";
    return;
  }

  cases.forEach(caseItem => {
    if (!caseItem.caseId || caseItem.caseId === "001" || caseItem.caseId === "ID não disponível") {
      return;
    }

    const caseElement = document.createElement('div');
    caseElement.classList.add('case-list-item');

    const caseId = caseItem.caseId;
    const descricao = caseItem.description || "Sem descrição";
    const status = caseItem.status || "Status não definido";
    const dataRegistro = caseItem.createdAt || "Data não disponível";
    const medico = caseItem.doctor || "Médico não informado";

    caseElement.innerHTML = `
      <div class="case-list-content" onclick="window.location='view-case.html?id=${caseItem._id}'">
        <h3 class="case-title">${caseId}</h3>
        <p class="case-description">${descricao}</p>
        <span class="case-status ${getStatusClass(status)}">${status}</span>
        <p class="case-date"><strong>Data:</strong> ${new Date(dataRegistro).toLocaleDateString()}</p>
        <p class="case-doctor"><strong>Médico Responsável:</strong> ${medico}</p>
      </div>
    `;

    caseListContainer.appendChild(caseElement);
  });
}

// Corrigir layout
document.querySelector('.cases-list-container').style.width = "100%";

document.getElementById('filter-status').addEventListener('change', fetchCases);
document.getElementById('filter-date').addEventListener('change', fetchCases);
document.getElementById('search-case').addEventListener('input', fetchCases);

window.addEventListener('load', fetchCases);