// Geração de PDF para o Laudo
document.getElementById('generate-laudo').addEventListener('click', function() {
    const doc = new jsPDF();

    // Adicionar a logo (exemplo com uma imagem local ou base64)
    const logo = 'data:image/png;base64,...';  // Coloque aqui o conteúdo base64 da sua logo ou uma URL
    doc.addImage(logo, 'PNG', 20, 10, 50, 50); // Parâmetros: imagem, formato, x, y, largura, altura

    // Definindo título do laudo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text('Laudo de Evidência', 20, 70);  // Ajuste a posição após a logo

    // Descrição da evidência
    doc.setFontSize(12);
    doc.text('Descrição:', 20, 80);
    doc.setFontSize(10);
    doc.text(document.getElementById('evidence-description-readonly').value, 20, 90);

    // Perito Responsável
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text('Perito Responsável:', 20, 110);
    doc.setFontSize(10);
    doc.text(document.getElementById('expert-name').value, 20, 120);

    // Constatações
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text('Constatações:', 20, 140);
    doc.setFontSize(10);
    doc.text(document.getElementById('laudo-findings').value, 20, 150);

    // Conclusões
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text('Conclusões:', 20, 170);
    doc.setFontSize(10);
    doc.text(document.getElementById('laudo-conclusions').value, 20, 180);

    // Gerando PDF
    doc.save('laudo_evidencia.pdf');
});

// Geração de PDF para o Relatório
document.getElementById('generate-report').addEventListener('click', function() {
    const doc = new jsPDF();

    // Adicionar a logo (exemplo com uma imagem local ou base64)
    const logo = 'data:image/png;base64,...';  // Coloque aqui o conteúdo base64 da sua logo ou uma URL
    doc.addImage(logo, 'PNG', 20, 10, 50, 50); // Parâmetros: imagem, formato, x, y, largura, altura

    // Definindo título do relatório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text('Relatório do Caso', 20, 70);  // Ajuste a posição após a logo

    // Título do relatório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text('Título:', 20, 90);
    doc.setFontSize(10);
    doc.text(document.getElementById('report-title').value, 20, 100);

    // Descrição do relatório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text('Descrição:', 20, 120);
    doc.setFontSize(10);
    doc.text(document.getElementById('report-description').value, 20, 130);

    // Data do relatório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text('Data do Relatório:', 20, 150);
    doc.setFontSize(10);
    doc.text(document.getElementById('report-date').value, 20, 160);

    // Usuário responsável
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text('Usuário Responsável:', 20, 180);
    doc.setFontSize(10);
    doc.text(document.getElementById('user-id').value, 20, 190);

    // Gerando PDF
    doc.save('relatorio_caso.pdf');
});
