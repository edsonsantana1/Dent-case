document.addEventListener("DOMContentLoaded", function () {
    // Elementos principais
    const addEvidenceBtn = document.getElementById("add-evidence");
    const evidenceModal = document.getElementById("evidence-modal");
    const evidenceForm = document.getElementById("evidence-form");
    const evidenceList = document.getElementById("evidence-list");
    const emptyEvidenceMessage = document.getElementById("empty-evidence-message");
    const generateReportBtn = document.getElementById("generate-report");
    const reportModal = document.getElementById("report-modal");
    const reportForm = document.getElementById("report-form");
    const userIdSelect = document.getElementById("user-id");
    const editCaseBtn = document.getElementById("edit-case");
    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("edit-form");
    const cancelEditBtn = document.getElementById("cancel-edit");
    const changeStatusBtn = document.getElementById("change-status");
    const evidenceLaudoModal = document.getElementById("evidence-laudo-modal");
    const evidenceLaudoForm = document.getElementById("evidence-laudo-form");
    const getLocationBtn = document.getElementById("get-location");
    const closeButtons = document.querySelectorAll(".close");
    const deleteCaseBtn = document.getElementById("delete-case");

    // Dados do caso selecionado
    const caseData = {
        id: "CASO-001",
        title: "Identificação de vítima em acidente rodoviário",
        description: "Vítima do sexo masculino, aproximadamente 30 anos, com fraturas dentárias características.",
        dateOpened: "2024-05-15",
        expert: "Dr. Silva",
        status: "Em andamento"
    };

    // Status disponíveis
    const statusOptions = ["Aberto", "Em andamento", "Pendente", "Concluido"];

    // Carregar detalhes do caso
    function loadCaseDetails() {
        document.getElementById('case-title').textContent = caseData.title;
        document.getElementById('case-description').textContent = caseData.description;
        document.getElementById('case-date').textContent = formatDate(caseData.dateOpened);
        document.getElementById('case-expert').textContent = caseData.expert;
        document.getElementById('case-status').textContent = caseData.status;
        document.getElementById('case-status').className = "case-status status-" + caseData.status.replace(/\s+/g, '-').toLowerCase();
    }

    // Formatar data para exibição
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    // Inicializar página
    loadCaseDetails();
    fetchUsersForReport();

    // Função para confirmar e excluir caso
    deleteCaseBtn.addEventListener("click", () => {
        if (confirm("Tem certeza que deseja excluir este caso permanentemente?")) {
            alert("Caso excluído com sucesso!");
            // Redirecionar para a lista de casos
            window.location.href = "list-case.html";
        }
    });

    // Abrir modal de adicionar evidência
    addEvidenceBtn.addEventListener("click", () => {
        evidenceModal.style.display = "block";
    });

    // Fechar modais
    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".modal").forEach(modal => {
                modal.style.display = "none";
            });
        });
    });

    // Fechar modais ao clicar fora
    window.addEventListener("click", (event) => {
        if (event.target.classList.contains("modal")) {
            event.target.style.display = "none";
        }
    });

    // Adicionar nova evidência
    evidenceForm.addEventListener("submit", (e) => {
        e.preventDefault();
    
        const collectionDate = document.getElementById("collection-date").value;
        const collectionTime = document.getElementById("collection-time").value;
        const description = document.getElementById("evidence-description-field").value;
        const latitude = document.getElementById("evidence-lat").value;
        const longitude = document.getElementById("evidence-long").value;
        const imageUrl = document.getElementById("evidence-image-url").value;
        const videoUrl = document.getElementById("evidence-video-url").value;
        const documentUrl = document.getElementById("evidence-document-url").value;
        const file = document.getElementById("evidence-file").files[0];
    
        // Criação de um objeto para enviar os dados ao backend
        const evidenceData = {
            collectionDate,
            collectionTime,
            description,
            latitude,
            longitude,
            imageUrl,
            videoUrl,
            documentUrl,
            file
        };
    
        // Requisição POST para adicionar evidência ao backend
        fetch("https://laudos-pericias.onrender.com/api/evidences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(evidenceData)
        })
        .then(response => response.json())
        .then(data => {
            // Se a evidência for criada com sucesso, adicionar ao frontend
            const evidenceItem = document.createElement("div");
            evidenceItem.classList.add("evidence-item");
            evidenceItem.dataset.evidenceId = data.id; // Usar ID retornado pelo backend
            evidenceItem.innerHTML = `
                <div class="evidence-content">
                    <div><strong>Data:</strong> ${collectionDate} ${collectionTime}</div>
                    <div><strong>Descrição:</strong> ${description}</div>
                    ${latitude || longitude ? `<div><strong>Localização:</strong> ${latitude ? `Lat: ${latitude}` : ''}${latitude && longitude ? ', ' : ''}${longitude ? `Long: ${longitude}` : ''}</div>` : ''}
                    <div class="evidence-files">
                        ${imageUrl ? `<p><strong>Imagem:</strong> <a href="${imageUrl}" target="_blank">Ver Imagem</a></p>` : ''}
                        ${videoUrl ? `<p><strong>Vídeo:</strong> <a href="${videoUrl}" target="_blank">Ver Vídeo</a></p>` : ''}
                        ${documentUrl ? `<p><strong>Documento:</strong> <a href="${documentUrl}" target="_blank">Ver Documento</a></p>` : ''}
                        ${file ? `<p><strong>Arquivo:</strong> ${file.name}</p>` : ''}
                    </div>
                </div>
                <div class="evidence-actions">
                    <button class="btn btn-laudo"><i class="fas fa-file-medical"></i> Gerar Laudo</button>
                    <button class="btn btn-edit-evidence"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-delete-evidence"><i class="fas fa-trash"></i> Excluir</button>
                </div>
            `;
            evidenceList.appendChild(evidenceItem);
            emptyEvidenceMessage.style.display = "none";
            evidenceForm.reset();
            evidenceModal.style.display = "none";
        })
        .catch(error => {
            alert("Erro ao adicionar evidência: " + error.message);
        });

    

        // Adicionar evento ao botão de gerar laudo
        evidenceItem.querySelector(".btn-laudo").addEventListener("click", () => {
            document.getElementById("evidence-description-readonly").value = description;
            evidenceLaudoModal.style.display = "block";
        });

        // Adicionar evento ao botão de editar evidência
        evidenceItem.querySelector(".btn-edit-evidence").addEventListener("click", () => {
            // Preencher modal de edição com os dados atuais
            document.getElementById("collection-date").value = collectionDate;
            document.getElementById("collection-time").value = collectionTime;
            document.getElementById("evidence-description-field").value = description;
            document.getElementById("evidence-lat").value = latitude;
            document.getElementById("evidence-long").value = longitude;
            document.getElementById("evidence-image-url").value = imageUrl;
            document.getElementById("evidence-video-url").value = videoUrl;
            document.getElementById("evidence-document-url").value = documentUrl;
            
            // Remover a evidência atual
            evidenceItem.remove();
            if (evidenceList.children.length === 1) { // Se só tiver a mensagem vazia
                emptyEvidenceMessage.style.display = "block";
            }
            
            evidenceModal.style.display = "block";
        });

        // Adicionar evento ao botão de excluir evidência
        evidenceItem.querySelector(".btn-delete-evidence").addEventListener("click", () => {
            if (confirm("Tem certeza que deseja excluir esta evidência?")) {
                evidenceItem.remove();
                if (evidenceList.children.length === 1) { // Se só tiver a mensagem vazia
                    emptyEvidenceMessage.style.display = "block";
                }
            }
        });

        evidenceList.appendChild(evidenceItem);
        emptyEvidenceMessage.style.display = "none";
        evidenceForm.reset();
        evidenceModal.style.display = "none";
    });

    // Abrir modal de relatório
    generateReportBtn.addEventListener("click", () => {
        document.getElementById("report-title").value = `Relatório do Caso ${caseData.id}`;
        document.getElementById("report-description").value = `Relatório completo do caso ${caseData.title}`;
        document.getElementById("report-date").valueAsDate = new Date();
        reportModal.style.display = "block";
    });

    // Popular usuários no select do relatório
    function fetchUsersForReport() {
        const users = [
            { id: 1, name: "Dr. Silva" },
            { id: 2, name: "Dr. Costa" },
            { id: 3, name: "Dr. Oliveira" }
        ];

        userIdSelect.innerHTML = '<option value="">Selecione o usuário</option>';
        users.forEach(user => {
            const option = document.createElement("option");
            option.value = user.id;
            option.textContent = user.name;
            userIdSelect.appendChild(option);
        });
    }

    // Gerar relatório PDF
    reportForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const reportTitle = document.getElementById("report-title").value;
        const reportDescription = document.getElementById("report-description").value;
        const reportDate = document.getElementById("report-date").value;
        const userId = document.getElementById("user-id").value;
        const userName = document.getElementById("user-id").selectedOptions[0].textContent;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Cabeçalho
        doc.setFontSize(18);
        doc.text(reportTitle, 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Caso: ${caseData.id}`, 105, 30, { align: 'center' });

        // Linha divisória
        doc.line(20, 35, 190, 35);

        // Corpo do relatório
        doc.setFontSize(14);
        doc.text('1. Dados do Caso', 20, 45);
        doc.setFontSize(12);
        doc.text(`Título: ${caseData.title}`, 20, 55);
        doc.text(`Descrição: ${caseData.description}`, 20, 65);
        doc.text(`Status: ${caseData.status}`, 20, 75);
        doc.text(`Perito Responsável: ${caseData.expert}`, 20, 85);

        // Seção de evidências
        doc.setFontSize(14);
        doc.text('2. Evidências', 20, 100);
        
        // Rodapé
        doc.setFontSize(10);
        doc.text(`Relatório gerado em: ${reportDate}`, 20, 280);
        doc.text(`Responsável: ${userName}`, 20, 285);

        doc.save(`relatorio_${caseData.id}.pdf`);
        reportModal.style.display = "none";
    });

    // Editar caso
    editCaseBtn.addEventListener("click", () => {
        document.getElementById("edit-title").value = caseData.title;
        document.getElementById("edit-description").value = caseData.description;
        document.getElementById("edit-date").value = caseData.dateOpened;
        document.getElementById("edit-expert").value = caseData.expert;
        document.getElementById("edit-status").value = caseData.status;
        editModal.style.display = "block";
    });

    // Cancelar edição
    cancelEditBtn.addEventListener("click", () => {
        editModal.style.display = "none";
    });

    // Salvar edição
    editForm.addEventListener("submit", (e) => {
        e.preventDefault();

        caseData.title = document.getElementById("edit-title").value;
        caseData.description = document.getElementById("edit-description").value;
        caseData.dateOpened = document.getElementById("edit-date").value;
        caseData.expert = document.getElementById("edit-expert").value;
        caseData.status = document.getElementById("edit-status").value;

        loadCaseDetails();
        editModal.style.display = "none";
    });

    // Alterar status
    changeStatusBtn.addEventListener("click", () => {
        const currentIndex = statusOptions.indexOf(caseData.status);
        const nextIndex = (currentIndex + 1) % statusOptions.length;
        caseData.status = statusOptions[nextIndex];
        loadCaseDetails();
    });

    // Gerar laudo de evidência
    evidenceLaudoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const findings = document.getElementById("laudo-findings").value;
        const conclusions = document.getElementById("laudo-conclusions").value;
        const expertName = document.getElementById("expert-name").value;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Laudo Pericial', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Caso: ${caseData.id}`, 105, 30, { align: 'center' });
        doc.line(20, 35, 190, 35);

        doc.setFontSize(14);
        doc.text('Descrição da Evidência:', 20, 45);
        doc.setFontSize(12);
        doc.text(document.getElementById("evidence-description-readonly").value, 20, 55, { maxWidth: 170 });

        doc.setFontSize(14);
        doc.text('Constatações:', 20, 80);
        doc.setFontSize(12);
        doc.text(findings, 20, 90, { maxWidth: 170 });

        doc.setFontSize(14);
        doc.text('Conclusões:', 20, 140);
        doc.setFontSize(12);
        doc.text(conclusions, 20, 150, { maxWidth: 170 });

        doc.setFontSize(10);
        doc.text(`Perito Responsável: ${expertName}`, 20, 280);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 285);

        doc.save(`laudo_${caseData.id}_${Date.now()}.pdf`);
        evidenceLaudoModal.style.display = "none";
        evidenceLaudoForm.reset();
    });

    // Pegar localização em tempo real
    getLocationBtn.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                document.getElementById("evidence-lat").value = position.coords.latitude.toFixed(6);
                document.getElementById("evidence-long").value = position.coords.longitude.toFixed(6);
            }, (error) => {
                alert("Erro ao obter localização: " + error.message);
            });
        } else {
            alert("Geolocalização não suportada no navegador.");
        }
    });
});