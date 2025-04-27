// Exemplo de função para alternar submenu (caso tenha)
function toggleSubMenu(button) {
    const subMenu = button.nextElementSibling;
    if (subMenu) {
        subMenu.style.display = subMenu.style.display === "flex" ? "none" : "flex";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('case-form');
    const caseIdInput = document.getElementById('case-id');
    const generateReportBtn = document.getElementById('generate-report');
    
    // URL da API (ajustada para o Render)
    const API_URL = 'https://laudos-pericias.onrender.com/api/cases';
    
    // Gerar ID do caso (simulação - o ideal é que o backend gere)
    function generateCaseId() {
        const timestamp = Date.now().toString().slice(-6);
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `CASO-${timestamp}-${randomNum}`;
    }
    
    // Preencher campo de ID automaticamente
    caseIdInput.value = generateCaseId();
    
    // Preencher campo de usuário logado (simulação)
    // Na implementação real, você deve obter do sistema de autenticação
    document.getElementById('user-id').value = 'USER-123';
    
    // Validar data de nascimento
    function validateBirthDate(dateString) {
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 0; // Retorna true se a data for válida
    }
    
    // Validar formulário
    function validateForm(formData) {
        let isValid = true;
        
        // Validar data de nascimento
        if (!validateBirthDate(formData.get('patientAge'))) {
            alert('Por favor, insira uma data de nascimento válida');
            isValid = false;
        }
        
        // Validar data do incidente não pode ser no futuro
        const incidentDate = new Date(formData.get('incidentDate'));
        const today = new Date();
        
        if (incidentDate > today) {
            alert('A data do incidente não pode ser no futuro');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Enviar formulário
    async function submitForm(formData) {
        try {
            const token = localStorage.getItem('token');  // Supondo que o token esteja armazenado no localStorage
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Envia o token de autenticação
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            throw error;
        }
    }
    
    // Manipular envio do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Mostrar loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        submitBtn.disabled = true;
        
        // Coletar dados do formulário
        const formData = new FormData(form);
        
        // Validar formulário
        if (!validateForm(formData)) {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        try {
            // Enviar para o backend
            const result = await submitForm(formData);
            
            // Mostrar mensagem de sucesso
            alert('Caso cadastrado com sucesso!');
            
            // Redirecionar para a lista de casos
            window.location.href = 'list-case.html';
            
        } catch (error) {
            // Mostrar mensagem de erro
            alert('Erro ao cadastrar caso. Por favor, tente novamente.');
            console.error('Erro:', error);
            
            // Restaurar botão
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
    
    // Botão de gerar relatório (opcional)
    generateReportBtn.addEventListener('click', function() {
        alert('Relatório será gerado após o cadastro do caso.');
    });
    
    // Preencher automaticamente a data de criação (opcional)
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16);
    document.getElementById('case-open-date').value = formattedDate;
});
