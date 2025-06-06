document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'https://laudos-pericias.onrender.com/api';
  
    function getElementSafe(id) {
      const el = document.getElementById(id);
      if (!el) console.warn(`Elemento com id "${id}" não encontrado.`);
      return el;
    }
  
    const menuToggle = getElementSafe('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
  
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        sidebar?.classList.toggle('active');
      });
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('id');
  
    if (!caseId) {
      alert('Caso não encontrado.');
      window.location.href = 'list-case.html';
      return;
    }
  
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('Você precisa estar logado para acessar esta página.');
      window.location.href = 'login.html';
      return;
    }
  
    const evidenceModal = getElementSafe('evidence-modal');
    const reportModal = getElementSafe('report-modal');
    const closeButtons = document.querySelectorAll('.close');
  
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (evidenceModal) evidenceModal.style.display = 'none';
        if (reportModal) reportModal.style.display = 'none';
      });
    });
  
    async function setupUI() {
      try {
        const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (!response.ok) throw new Error('Erro ao verificar permissões.');
  
        const caseData = await response.json();
        const isOwner = caseData.assignedUser?.toString() === userId;
  
        if (userRole === 'admin') {
          getElementSafe('edit-case')?.style.setProperty('display', 'inline-block');
          getElementSafe('delete-case')?.style.setProperty('display', 'inline-block');
          getElementSafe('add-evidence')?.style.setProperty('display', 'inline-block');
        } else if (userRole === 'perito') {
          getElementSafe('edit-case')?.style.setProperty('display', isOwner ? 'inline-block' : 'none');
          getElementSafe('delete-case')?.style.setProperty('display', 'none');
          getElementSafe('add-evidence')?.style.setProperty('display', isOwner ? 'inline-block' : 'none');
        } else if (userRole === 'assistente') {
          getElementSafe('edit-case')?.style.setProperty('display', 'none');
          getElementSafe('delete-case')?.style.setProperty('display', 'none');
          getElementSafe('add-evidence')?.style.setProperty('display', isOwner ? 'inline-block' : 'none');
        }
  
      } catch (error) {
        console.error('Erro ao configurar UI:', error);
      }
    }
  
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
  
        getElementSafe('case-title').textContent = `${caseData.patientName} - ${caseData.incidentDescription.slice(0, 50)}${caseData.incidentDescription.length > 50 ? '...' : ''}`;
        getElementSafe('case-id').textContent = `#${caseData.caseId}`;
        getElementSafe('case-status').textContent = caseData.status;
        getElementSafe('case-status').className = `case-status status-${caseData.status.toLowerCase().replace(' ', '-')}`;
        getElementSafe('case-description').textContent = caseData.description;
        getElementSafe('case-date').textContent = new Date(caseData.createdAt).toLocaleDateString('pt-BR');
        getElementSafe('case-expert').textContent = caseData.assignedUser?.name || 'Não informado';
  
        getElementSafe('patient-name').textContent = caseData.patientName;
        getElementSafe('patient-dob').textContent = caseData.patientDOB ? new Date(caseData.patientDOB).toLocaleDateString('pt-BR') : 'Não informado';
        getElementSafe('patient-gender').textContent = caseData.patientGender || 'Não informado';
        getElementSafe('patient-id').textContent = caseData.patientID || 'Não informado';
        getElementSafe('patient-contact').textContent = caseData.patientContact || 'Não informado';
  
        getElementSafe('incident-date').textContent = caseData.incidentDate ? new Date(caseData.incidentDate).toLocaleString('pt-BR') : 'Não informado';
        getElementSafe('incident-location').textContent = caseData.incidentLocation || 'Não informado';
        getElementSafe('incident-description').textContent = caseData.incidentDescription || 'Não informado';
        getElementSafe('incident-weapon').textContent = caseData.incidentWeapon || 'Não informado';
  
        await loadEvidences();
      } catch (error) {
        console.error('Erro ao carregar caso:', error);
        alert(`Erro ao carregar detalhes do caso: ${error.message}`);
        window.location.href = 'list-case.html';
      }
    }
  
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
          emptyMessage.style.display = 'block';
          evidenceList.innerHTML = '';
          return;
        }
  
        emptyMessage.style.display = 'none';
        evidenceList.innerHTML = '';
  
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
          evidenceList.appendChild(div);
        });
  
      } catch (error) {
        console.error('Erro ao carregar evidências:', error);
        if (emptyMessage) {
          emptyMessage.style.display = 'block';
          emptyMessage.innerHTML = '<p>Erro ao carregar evidências. Tente recarregar a página.</p>';
        }
      }
    }
  
    getElementSafe('add-evidence')?.addEventListener('click', () => {
      const today = new Date().toISOString().split('T')[0];
      getElementSafe('collection-date').value = today;
      if (evidenceModal) evidenceModal.style.display = 'block';
    });
  
    getElementSafe('evidence-form')?.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      const evidenceData = {
        caseId: caseId,
        collectionDate: getElementSafe('collection-date').value || new Date().toISOString(),
        collectionTime: getElementSafe('collection-time').value || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        description: getElementSafe('evidence-description-field').value,
        location: getElementSafe('evidence-lat').value && getElementSafe('evidence-long').value
          ? `${getElementSafe('evidence-lat').value}, ${getElementSafe('evidence-long').value}`
          : null,
        imageUrl: getElementSafe('evidence-image-url').value || null,
        addedBy: userId
      };
  
      if (!evidenceData.description) {
        alert('Por favor, insira uma descrição para a evidência.');
        return;
      }
  
      try {
        const response = await fetch(`${API_BASE_URL}/evidences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(evidenceData)
        });
  
        const responseData = await response.json();
  
        if (!response.ok) {
          throw new Error(responseData.message || 'Erro ao adicionar evidência');
        }
  
        alert('Evidência adicionada com sucesso!');
        if (evidenceModal) evidenceModal.style.display = 'none';
        getElementSafe('evidence-form').reset();
        await loadEvidences();
  
      } catch (error) {
        console.error('Erro:', error);
        alert(`Falha ao adicionar evidência: ${error.message}`);
      }
    });
  
    getElementSafe('edit-case')?.addEventListener('click', () => {
      window.location.href = `edit-case.html?id=${caseId}`;
    });
  
    getElementSafe('delete-case')?.addEventListener('click', async () => {
      if (!confirm('Tem certeza que deseja excluir este caso permanentemente?')) return;
  
      try {
        const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao excluir caso');
        }
  
        alert('Caso excluído com sucesso!');
        window.location.href = 'list-case.html';
  
      } catch (error) {
        console.error('Erro:', error);
        alert(`Erro ao excluir caso: ${error.message}`);
      }
    });
  
    setupUI();
    loadCaseDetails();
  });
  