// Função para renderizar os casos corretamente
function renderCases(cases) {
  const caseListContainer = document.querySelector('.cases-list-container');
  caseListContainer.innerHTML = '';

  if (!cases.length) {
    caseListContainer.innerHTML = "<p class='error-message'>Nenhum caso encontrado.</p>";
    return;
  }

  cases.forEach(caseItem => {
    const caseElement = document.createElement('div');
    caseElement.classList.add('case-list-item');

    // Garantindo que todas as propriedades sejam carregadas corretamente
    const titulo = caseItem.title || "Título Indefinido";
    const caseId = caseItem.caseId || "ID não disponível";
    const status = caseItem.status || "Status não definido";
    const dataRegistro = caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString() : "Data não disponível";
    const usuario = caseItem.user || "Usuário não informado";

    caseElement.innerHTML = `
      <div class="case-list-content" onclick="window.location='view-case.html?id=${caseItem._id}'">
        <h3 class="case-title">${titulo}</h3>
        <p class="case-id"><strong>ID do Caso:</strong> ${caseId}</p>
        <span class="case-status ${getStatusClass(status)}">${status}</span>
        <p class="case-date"><strong>Data de Criação:</strong> ${dataRegistro}</p>
        <p class="case-user"><strong>Criado por:</strong> ${usuario}</p>
      </div>
    `;

    caseListContainer.appendChild(caseElement);
  });
}

// Função para obter a classe de status do caso
function getStatusClass(status) {
  return {
    'aberto': 'status-aberto',
    'em andamento': 'status-em-andamento',
    'pendente': 'status-pendente',
    'concluído': 'status-concluido'
  }[status] || '';
}

// Atualiza casos ao carregar a página
window.addEventListener('load', fetchCases);