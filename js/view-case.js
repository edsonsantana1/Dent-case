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
  
    // setupUI idéntico, mas as chamadas usam /cases/
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
        // ... resto da lógica de mostrar botões (igual antes)
      } catch (err) {
        console.error('Erro ao configurar UI:', err);
      }
    }
  
    // loadCaseDetails também usa /cases/
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
        // ... preencher campos da página
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
        // ... renderização das evidências
      } catch (err) {
        console.error('Erro ao carregar evidências:', err);
        const empty = getElementSafe('empty-evidence-message');
        if (empty) {
          empty.style.display = 'block';
          empty.textContent = 'Erro ao carregar evidências.';
        }
      }
    }
  
    // Submissão de evidência—já aponta para /evidences e campos corretos
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
        getElementSafe('evidence-modal').style.display = 'none';
        getElementSafe('evidence-form').reset();
        await loadEvidences();
      } catch (err) {
        console.error('Erro ao adicionar evidência:', err);
        alert(err.message);
      }
    });
  
    // delete-case e edit-case permanecem iguais, exceto URL plural:
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
  