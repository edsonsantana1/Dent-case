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
  
    async function setupUI(caseData) {
      const isOwner = caseData.assignedUser?._id === userId;
      const isParticipant = caseData.assistants?.some(a => a._id === userId);
  
      // Botões
      const deleteBtn = getElementSafe('delete-case');
      const editBtn = getElementSafe('edit-case');
      const addEvidenceBtn = getElementSafe('add-evidence');
  
      // Regras
      if (deleteBtn) {
        deleteBtn.style.display = (userRole === 'admin' || (userRole === 'perito' && isOwner)) ? 'inline-block' : 'none';
      }
      if (editBtn) {
        editBtn.style.display = (userRole === 'admin' || (userRole === 'perito' && isOwner)) ? 'inline-block' : 'none';
      }
      if (addEvidenceBtn) {
        addEvidenceBtn.style.display = (
          userRole === 'admin' ||
          (userRole === 'perito' && isOwner) ||
          (userRole === 'assistente' && isParticipant)
        ) ? 'inline-block' : 'none';
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
        if (!res.ok) throw new Error('Erro ao buscar caso');
  
        const caseData = await res.json();
  
        getElementSafe('case-title').textContent = caseData.title || '';
        getElementSafe('case-description').textContent = caseData.description || '';
        getElementSafe('case-id').textContent = caseData._id || '';
        getElementSafe('case-status').textContent = caseData.status || '';
        getElementSafe('case-date').textContent = caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : '';
        getElementSafe('case-expert').textContent = caseData.assignedUser?.name || '';
  
        // Paciente
        getElementSafe('patient-name').textContent = caseData.patient?.name || '';
        getElementSafe('patient-dob').textContent = caseData.patient?.dob || '';
        getElementSafe('patient-gender').textContent = caseData.patient?.gender || '';
        getElementSafe('patient-id').textContent = caseData.patient?.document || '';
        getElementSafe('patient-contact').textContent = caseData.patient?.contact || '';
  
        // Incidente
        getElementSafe('incident-date').textContent = caseData.incident?.date || '';
        getElementSafe('incident-location').textContent = caseData.incident?.location || '';
        getElementSafe('incident-description').textContent = caseData.incident?.description || '';
        getElementSafe('incident-weapon').textContent = caseData.incident?.weapon || '';
  
        await setupUI(caseData);
        await loadEvidences(caseData);
  
      } catch (error) {
        console.error('Erro ao carregar caso:', error);
        alert(`Erro ao carregar caso: ${error.message}`);
        window.location.href = 'list-case.html';
      }
    }
  
    async function loadEvidences(caseData) {
      try {
        const res = await fetch(`${API_BASE_URL}/evidences/case/${caseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao carregar evidências');
        const evidences = await res.json();
  
        const evidenceList = getElementSafe('evidence-list');
        const emptyMsg = getElementSafe('empty-evidence-message');
        if (!evidenceList) return;
  
        evidenceList.innerHTML = '';
        if (evidences.length === 0) {
          if (emptyMsg) emptyMsg.style.display = 'block';
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
  
          const isCreator = ev.addedBy?._id === userId;
          if (userRole === 'admin' || (userRole === 'perito' && isCreator)) {
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Excluir';
            delBtn.className = 'btn btn-delete';
            delBtn.onclick = async () => {
              if (confirm('Excluir esta evidência?')) {
                try {
                  const delRes = await fetch(`${API_BASE_URL}/evidences/${ev._id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (!delRes.ok) throw new Error('Erro ao excluir evidência');
                  alert('Evidência excluída.');
                  await loadEvidences(caseData);
                } catch (err) {
                  console.error(err);
                  alert('Erro ao excluir evidência');
                }
              }
            };
            div.appendChild(delBtn);
          }
  
          evidenceList.appendChild(div);
        });
      } catch (err) {
        console.error('Erro ao carregar evidências:', err);
      }
    }
  
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
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(ev)
        });
        if (!res.ok) throw new Error('Erro ao adicionar evidência');
        alert('Evidência adicionada!');
        evidenceModal.style.display = 'none';
        getElementSafe('evidence-form').reset();
        await loadEvidences();
      } catch (err) {
        console.error('Erro ao adicionar evidência:', err);
        alert(err.message);
      }
    });
  
    getElementSafe('delete-case')?.addEventListener('click', async () => {
      if (!confirm('Excluir este caso?')) return;
      try {
        const res = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao excluir caso');
        alert('Caso excluído.');
        window.location.href = 'list-case.html';
      } catch (err) {
        console.error('Erro ao excluir caso:', err);
        alert(err.message);
      }
    });
  
    // Iniciar
    loadCaseDetails();
  });
  