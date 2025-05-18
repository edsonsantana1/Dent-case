document.addEventListener('DOMContentLoaded', function () {
    function getElementSafe(id) {
      const el = document.getElementById(id);
      if (!el) console.warn(`Elemento com id "${id}" não encontrado.`);
      return el;
    }
  
    const API_BASE_URL = 'https://laudos-pericias.onrender.com/api';
    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('id');
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
  
    const evidenceModal = getElementSafe('evidence-modal');
    const reportModal = getElementSafe('report-modal');
  
    if (!caseId || !token) {
      alert('Parâmetros insuficientes ou não logado.');
      window.location.href = 'list-case.html';
      return;
    }
  
    async function setupUI() {
      try {
        const res = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Permissão negada ou caso não existe');
  
        const caseData = await res.json();
        const isOwner = caseData.assignedUser?._id === userId;
  
        const deleteBtn = getElementSafe('delete-case');
        if (deleteBtn) {
          deleteBtn.style.display = (userRole === 'admin' || isOwner) ? 'inline-block' : 'none';
        }
  
      } catch (err) {
        console.error('Erro ao configurar UI:', err);
        alert('Erro ao configurar interface: ' + err.message);
      }
    }
  
    async function loadCaseDetails() {
      try {
        const res = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.msg || err.error || 'Erro ao buscar caso');
        }
  
        const caseData = await res.json();
  
        // Dados gerais do caso
        getElementSafe('case-title').textContent = caseData.title || '';
        getElementSafe('case-description').textContent = caseData.description || '';
        getElementSafe('case-id').textContent = caseData._id || '';
        getElementSafe('case-status').textContent = caseData.status || '';
        getElementSafe('case-date').textContent = caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : '';
        getElementSafe('case-expert').textContent = caseData.assignedUser?.name || '';
  
        // 🧍‍♂️ Dados do paciente
        getElementSafe('patient-name').textContent = caseData.patient?.name || '';
        getElementSafe('patient-dob').textContent = caseData.patient?.dateOfBirth ? new Date(caseData.patient.dateOfBirth).toLocaleDateString() : '';
        getElementSafe('patient-gender').textContent = caseData.patient?.gender || '';
        getElementSafe('patient-id').textContent = caseData.patient?.document || '';
        getElementSafe('patient-contact').textContent = caseData.patient?.contact || '';
  
        // ⚠️ Dados do incidente
        getElementSafe('incident-date').textContent = caseData.incident?.date ? new Date(caseData.incident.date).toLocaleDateString() : '';
        getElementSafe('incident-location').textContent = caseData.incident?.location || '';
        getElementSafe('incident-description').textContent = caseData.incident?.description || '';
        getElementSafe('incident-weapon').textContent = caseData.incident?.weapon || '';
  
        await loadEvidences();
      } catch (error) {
        console.error('Erro ao carregar caso:', error);
        alert(`Erro ao carregar detalhes do caso: ${error.message}`);
        window.location.href = 'list-case.html';
      }
    }
  
    async function loadEvidences() {
      try {
        const res = await fetch(`${API_BASE_URL}/evidences/case/${caseId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Erro ao carregar evidências');
  
        const evidences = await res.json();
  
        const evidenceList = getElementSafe('evidence-list');
        const emptyMsg = getElementSafe('empty-evidence-message');
  
        if (!evidenceList) return;
  
        evidenceList.innerHTML = '';
  
        if (evidences.length === 0) {
          if (emptyMsg) {
            emptyMsg.style.display = 'block';
            emptyMsg.textContent = 'Nenhuma evidência encontrada.';
          }
          return;
        }
  
        if (emptyMsg) emptyMsg.style.display = 'none';
  
        evidences.forEach(ev => {
          const div = document.createElement('div');
          div.className = 'evidence-item';
          div.innerHTML = `
            <p><strong>Data:</strong> ${ev.collectionDate ? new Date(ev.collectionDate).toLocaleDateString() : ''} ${ev.collectionTime || ''}</p>
            <p><strong>Descrição:</strong> ${ev.description || ''}</p>
            <p><strong>Latitude:</strong> ${ev.latitude || ''}, <strong>Longitude:</strong> ${ev.longitude || ''}</p>
            ${ev.imageUrl ? `<img src="${ev.imageUrl}" alt="Imagem da evidência" style="max-width:200px;">` : ''}
          `;
          evidenceList.appendChild(div);
        });
      } catch (err) {
        console.error('Erro ao carregar evidências:', err);
        const empty = getElementSafe('empty-evidence-message');
        if (empty) {
          empty.style.display = 'block';
          empty.textContent = 'Erro ao carregar evidências.';
        }
      }
    }
  
    // Submissão de evidência
    getElementSafe('evidence-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const ev = {
        case: caseId,
        collectionDate: getElementSafe('collection-date').value,
        collectionTime: getElementSafe('collection-time').value,
        description: getElementSafe('evidence-description-field').value,
        latitude: parseFloat(getElementSafe('evidence-lat').value),
        longitude: parseFloat(getElementSafe('evidence-long').value),
        imageUrl: getElementSafe('evidence-image-url').value || null,
        addedBy: userId
      };
      try {
        const res = await fetch(`${API_BASE_URL}/evidences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(ev)
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Falha ao adicionar evidência');
        }
        alert('Evidência adicionada!');
        if (evidenceModal) evidenceModal.style.display = 'none';
        getElementSafe('evidence-form').reset();
        await loadEvidences();
      } catch (err) {
        console.error('Erro ao adicionar evidência:', err);
        alert(err.message);
      }
    });
  
    // Exclusão do caso
    getElementSafe('delete-case')?.addEventListener('click', async () => {
      if (!confirm('Excluir caso?')) return;
      try {
        const res = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.msg || err.error);
        }
        alert('Caso excluído');
        window.location.href = 'list-case.html';
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir: ' + err.message);
      }
    });
  
    // inicializa
    setupUI();
    loadCaseDetails();
  });
  