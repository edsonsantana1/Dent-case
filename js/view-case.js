document.addEventListener('DOMContentLoaded', function () {
    // Função utilitária para pegar elementos com segurança
    function getElementSafe(id) {
      const el = document.getElementById(id);
      if (!el) console.warn(`Elemento com id "${id}" não encontrado.`);
      return el;
    }
  
    // Base URL do backend no Render
    const API_BASE_URL = 'https://laudos-pericias.onrender.com/api';
  
    // Menu toggle
    const menuToggle = getElementSafe('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (menuToggle) menuToggle.addEventListener('click', () => sidebar?.classList.toggle('active'));
  
    // Obter ID do caso pela URL
    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('id');
    if (!caseId) {
      alert('Caso não encontrado.');
      return window.location.href = 'list-case.html';
    }
  
    // Autenticação
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para acessar esta página.');
      return window.location.href = 'login.html';
    }
  
    // Elementos dos modais
    const evidenceModal = getElementSafe('evidence-modal');
    const reportModal = getElementSafe('report-modal');
    document.querySelectorAll('.close').forEach(button => {
      button.addEventListener('click', () => {
        if (evidenceModal) evidenceModal.style.display = 'none';
        if (reportModal) reportModal.style.display = 'none';
      });
    });
  
    // Configuração da interface
    async function setupUI() {
      try {
        const response = await fetch(`${API_BASE_URL}/case/${caseId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Resposta HTML inesperada em setupUI:', text);
          throw new Error('Resposta não é JSON');
        }
        const caseData = await response.json();
        const isOwner = caseData.assignedUser?.toString() === userId;
  
        // Mostrar botões conforme perfil
        getElementSafe('edit-case')?.style.setProperty('display', (userRole === 'admin' || (userRole === 'perito' && isOwner)) ? 'inline-block' : 'none');
        getElementSafe('delete-case')?.style.setProperty('display', (userRole === 'admin') ? 'inline-block' : 'none');
        getElementSafe('add-evidence')?.style.setProperty('display', (userRole === 'admin' || ((userRole === 'perito' || userRole === 'assistente') && isOwner)) ? 'inline-block' : 'none');
      } catch (error) {
        console.error('Erro ao configurar UI:', error);
      }
    }
  
    // Carregar detalhes do caso
    async function loadCaseDetails() {
      try {
        const response = await fetch(`${API_BASE_URL}/case/${caseId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!response.ok) {
          const text = await response.text(); console.error('Erro caso HTML:', text);
          throw new Error(`Status ${response.status}`);
        }
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await response.text(); console.error('Resposta HTML inesperada em loadCaseDetails:', text);
          throw new Error('Resposta não é JSON');
        }
        const caseData = await response.json();
        console.log('Dados do caso:', caseData);
  
        // Preencher informações na tela
        const setText = (id, text) => { const el = getElementSafe(id); if (el) el.textContent = text; };
        setText('case-title', `${caseData.patientName || ''} - ${(caseData.incidentDescription||'').slice(0,50)}${caseData.incidentDescription?.length>50?'...':''}`);
        setText('case-id', `#${caseData.caseId||''}`);
        const statusEl = getElementSafe('case-status');
        if (statusEl) {
          statusEl.textContent = caseData.status||'';
          statusEl.className = `case-status status-${(caseData.status||'').toLowerCase().replace(/\s+/g,'-')}`;
        }
        setText('case-description', caseData.description||'');
        setText('case-date', caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('pt-BR') : '');
        setText('case-expert', caseData.assignedUser?.name||'Não informado');
  
        // Dados adicionais
        setText('patient-name', caseData.patientName||'Não informado');
        setText('patient-dob', caseData.patientDOB ? new Date(caseData.patientDOB).toLocaleDateString('pt-BR') : 'Não informado');
        setText('patient-gender', caseData.patientGender||'Não informado');
        setText('patient-id', caseData.patientID||'Não informado');
        setText('patient-contact', caseData.patientContact||'Não informado');
  
        setText('incident-date', caseData.incidentDate ? new Date(caseData.incidentDate).toLocaleString('pt-BR') : 'Não informado');
        setText('incident-location', caseData.incidentLocation||'Não informado');
        setText('incident-description', caseData.incidentDescription||'Não informado');
        setText('incident-weapon', caseData.incidentWeapon||'Não informado');
  
        // Carregar evidências
        await loadEvidences();
      } catch (error) {
        console.error('Erro ao carregar caso:', error);
        alert(`Erro ao carregar detalhes do caso: ${error.message}`);
        window.location.href = 'list-case.html';
      }
    }
  
    // Carregar evidências
    async function loadEvidences() {
      const list = getElementSafe('evidence-list');
      const empty = getElementSafe('empty-evidence-message');
      try {
        const response = await fetch(`${API_BASE_URL}/evidences/case/${caseId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!response.ok) { const text = await response.text(); console.error('Erro evidências HTML:', text); throw new Error(`Status ${response.status}`); }
        const contentType = response.headers.get('content-type')||'';
        if (!contentType.includes('application/json')) { const text = await response.text(); console.error('HTML evidências:', text); throw new Error('Resposta não é JSON'); }
        const evidences = await response.json();
        if (!evidences.length) { empty.style.display='block'; list.innerHTML=''; return; }
        empty.style.display='none'; list.innerHTML='';
        evidences.forEach(ev => {
          const div = document.createElement('div'); div.className='evidence-item';
          div.innerHTML = `<div class="evidence-content">
              <h4>${ev.collectionDate?new Date(ev.collectionDate).toLocaleDateString('pt-BR'):'Data não informada'}${ev.collectionTime?' - '+ev.collectionTime:''}</h4>
              <p>${ev.description||'Descrição não informada'}</p>
              ${ev.latitude&&ev.longitude?`<p><strong>Local:</strong> ${ev.latitude}, ${ev.longitude}</p>`:''}
              ${ev.imageUrl?`<img src="${ev.imageUrl}" alt="Evidência" class="evidence-image">`:''}
              <p><strong>Adicionado por:</strong> ${ev.addedBy?.name||'Usuário não informado'}</p></div>`;
          list.appendChild(div);
        });
      } catch (error) {
        console.error('Erro ao carregar evidências:', error);
        empty.style.display='block'; empty.innerHTML='<p>Erro ao carregar evidências. Tente recarregar a página.</p>';
      }
    }
  
    // Abrir modal de adicionar evidência
    getElementSafe('add-evidence')?.addEventListener('click', () => {
      const today = new Date().toISOString().split('T')[0]; getElementSafe('collection-date').value = today;
      if (evidenceModal) evidenceModal.style.display = 'block';
    });
  
    // Submeter evidência
    getElementSafe('evidence-form')?.addEventListener('submit', async function (e) {
      e.preventDefault();
      const evidenceData = {
        caseId, collectionDate: getElementSafe('collection-date').value||new Date().toISOString(),
        collectionTime: getElementSafe('collection-time').value||new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
        description: getElementSafe('evidence-description-field').value,
        location: (getElementSafe('evidence-lat').value&&getElementSafe('evidence-long').value)?`${getElementSafe('evidence-lat').value}, ${getElementSafe('evidence-long').value}`:null,
        imageUrl: getElementSafe('evidence-image-url').value||null, addedBy: userId
      };
      if (!evidenceData.description) { alert('Por favor, insira uma descrição para a evidência.'); return; }
      try {
        const response = await fetch(`${API_BASE_URL}/evidences`, { method:'POST', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}` }, body:JSON.stringify(evidenceData) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message||'Erro ao adicionar evidência');
        alert('Evidência adicionada com sucesso!'); if (evidenceModal) evidenceModal.style.display='none'; getElementSafe('evidence-form').reset(); await loadEvidences();
      } catch (error) {
        console.error('Erro ao submeter evidência:',error);
        alert(`Falha ao adicionar evidência: ${error.message}`);
      }
    });
  
    // Editar caso
    getElementSafe('edit-case')?.addEventListener('click', () => window.location.href = `edit-case.html?id=${caseId}`);
  
    // Excluir caso
    getElementSafe('delete-case')?.addEventListener('click', async () => {
      if (!confirm('Tem certeza que deseja excluir este caso permanentemente?')) return;
      try {
        const response = await fetch(`${API_BASE_URL}/case/${caseId}`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } });
        if (!response.ok) { const data = await response.json(); throw new Error(data.message||'Erro ao excluir caso'); }
        alert('Caso excluído com sucesso!'); window.location.href = 'list-case.html';
      } catch (error) {
        console.error('Erro ao excluir caso:',error);
        alert(`Erro ao excluir caso: ${error.message}`);
      }
    });
  
    // Inicializar UI e dados
    setupUI(); loadCaseDetails();
  });
  