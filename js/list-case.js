document.addEventListener('DOMContentLoaded', function () {
  const API_BASE_URL = 'https://laudos-pericias.onrender.com/api';

  // Função utilitária para pegar elementos com segurança
  function getElementSafe(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`Elemento com id "${id}" não encontrado.`);
    return el;
  }

  // Menu toggle
  const menuToggle = getElementSafe('menu-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar?.classList.toggle('active');
    });
  }

  // Obter ID do caso pela URL
  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('id');

  if (!caseId) {
    alert('Caso não encontrado.');
    window.location.href = 'list-case.html';
    return;
  }

  // Obter dados do usuário
  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'login.html';
    return;
  }

  // Elementos dos modais
  const evidenceModal = getElementSafe('evidence-modal');
  const reportModal = getElementSafe('report-modal');
  const closeButtons = document.querySelectorAll('.close');

  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (evidenceModal) evidenceModal.style.display = 'none';
      if (reportModal) reportModal.style.display = 'none';
    });
  });

  // Carregar detalhes do caso
  async function loadCaseDetails() {
    try {
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Caso não encontrado');
      }

      const caseData = await response.json();
      console.log('Dados do caso:', caseData);

      // Preencher informações básicas
      getElementSafe('case-title').textContent = `${caseData.patientName || 'Sem nome'} - ${(caseData.incidentDescription || '').slice(0, 50)}${caseData.incidentDescription?.length > 50 ? '...' : ''}`;
      getElementSafe('case-id').textContent = `#${caseData.caseId || caseData._id}`;
      getElementSafe('case-status').textContent = caseData.status || 'Sem status';
      getElementSafe('case-status').className = `case-status status-${(caseData.status || '').toLowerCase().replace(' ', '-')}`;
      getElementSafe('case-description').textContent = caseData.description || 'Sem descrição';
      getElementSafe('case-date').textContent = caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('pt-BR') : 'Data não informada';
      getElementSafe('case-expert').textContent = caseData.assignedUser?.name || 'Não informado';

      // Preencher informações do paciente
      getElementSafe('patient-name').textContent = caseData.patientName || 'Não informado';
      getElementSafe('patient-dob').textContent = caseData.patientDOB ? new Date(caseData.patientDOB).toLocaleDateString('pt-BR') : 'Não informado';
      getElementSafe('patient-gender').textContent = caseData.patientGender || 'Não informado';
      getElementSafe('patient-id').textContent = caseData.patientID || 'Não informado';
      getElementSafe('patient-contact').textContent = caseData.patientContact || 'Não informado';

      // Preencher informações do incidente
      getElementSafe('incident-date').textContent = caseData.incidentDate ? new Date(caseData.incidentDate).toLocaleString('pt-BR') : 'Não informado';
      getElementSafe('incident-location').textContent = caseData.incidentLocation || 'Não informado';
      getElementSafe('incident-description').textContent = caseData.incidentDescription || 'Não informado';
      getElementSafe('incident-weapon').textContent = caseData.incidentWeapon || 'Não informado';

      // Carregar mídias (imagens, vídeos, documentos)
      loadMedia(caseData);

      await loadEvidences();
    } catch (error) {
      console.error('Erro ao carregar caso:', error);
      alert(`Erro ao carregar detalhes do caso: ${error.message}`);
      window.location.href = 'list-case.html';
    }
  }

  // Carregar mídias do caso
  function loadMedia(caseData) {
    const mediaContainer = getElementSafe('case-media-container');
    if (!mediaContainer) return;

    mediaContainer.innerHTML = '';

    // Adicionar imagem se existir
    if (caseData.imageUrl) {
      const imgDiv = document.createElement('div');
      imgDiv.className = 'media-item';
      imgDiv.innerHTML = `
        <h4>Imagem</h4>
        <img src="${caseData.imageUrl}" alt="Imagem do caso" class="case-media">
      `;
      mediaContainer.appendChild(imgDiv);
    }

    // Adicionar vídeo se existir
    if (caseData.videoUrl) {
      const videoDiv = document.createElement('div');
      videoDiv.className = 'media-item';
      videoDiv.innerHTML = `
        <h4>Vídeo</h4>
        <video controls class="case-media">
          <source src="${caseData.videoUrl}" type="video/mp4">
          Seu navegador não suporta o elemento de vídeo.
        </video>
      `;
      mediaContainer.appendChild(videoDiv);
    }

    // Adicionar documento se existir
    if (caseData.documentUrl) {
      const docDiv = document.createElement('div');
      docDiv.className = 'media-item';
      docDiv.innerHTML = `
        <h4>Documento</h4>
        <iframe src="${caseData.documentUrl}" class="case-document" frameborder="0"></iframe>
        <a href="${caseData.documentUrl}" target="_blank" class="btn-download">Baixar documento</a>
      `;
      mediaContainer.appendChild(docDiv);
    }

    // Mostrar mensagem se não houver mídias
    if (!caseData.imageUrl && !caseData.videoUrl && !caseData.documentUrl) {
      mediaContainer.innerHTML = '<p class="no-media">Nenhuma mídia disponível para este caso.</p>';
    }
  }

  // Carregar evidências
  async function loadEvidences() {
    const evidenceList = getElementSafe('evidence-list');
    const emptyMessage = getElementSafe('empty-evidence-message');
  
    try {
      const response = await fetch(`${API_BASE_URL}/evidences/case/${caseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (!response.ok) throw new Error('Erro ao carregar evidências');
  
      const evidences = await response.json();
  
      if (!evidences.length) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        if (evidenceList) evidenceList.innerHTML = '';
        return;
      }
  
      if (emptyMessage) emptyMessage.style.display = 'none';
      if (evidenceList) evidenceList.innerHTML = '';
  
      evidences.forEach(ev => {
        const div = document.createElement('div');
        div.className = 'evidence-item';
        div.innerHTML = `
          <div class="evidence-content">
            <h4>${ev.collectionDate ? new Date(ev.collectionDate).toLocaleDateString('pt-BR') : 'Data não informada'} ${ev.collectionTime ? ' - ' + ev.collectionTime : ''}</h4>
            <p>${ev.description || 'Descrição não informada'}</p>
            ${ev.latitude && ev.longitude ? `<p><strong>Local:</strong> ${ev.latitude}, ${ev.longitude}</p>` : ''}
            ${ev.imageUrl ? `<img src="${ev.imageUrl}" alt="Evidência" class="evidence-image">` : ''}
            <p><strong>Adicionada por:</strong> ${ev.addedBy?.name || 'Usuário não informado'}</p>
          </div>
        `;
        if (evidenceList) evidenceList.appendChild(div);
      });
  
    } catch (error) {
      console.error('Erro ao carregar evidências:', error);
      if (emptyMessage) {
        emptyMessage.style.display = 'block';
        emptyMessage.innerHTML = '<p>Erro ao carregar evidências. Tente recarregar a página.</p>';
      }
    }
  }

  // Inicialização
  loadCaseDetails();
});