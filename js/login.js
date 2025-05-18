document.addEventListener('DOMContentLoaded', function () {
    // Toggle do menu lateral
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Gerar e preencher ID do caso automaticamente
    function generateCaseId() {
        const prefix = 'CASO-';
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return prefix + randomNum;
    }

    document.getElementById('case-id').value = generateCaseId();

    // Submissão do formulário
    const caseForm = document.getElementById('case-form');

    caseForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(caseForm);

        const caseData = {
            caseId: formData.get('caseId'),
            description: formData.get('description'),
            patientName: formData.get('patientName'),
            patientDOB: formData.get('patientDOB'),
            patientGender: formData.get('patientGender'),
            patientID: formData.get('patientID'),
            patientContact: formData.get('patientContact'),
            incidentDate: formData.get('incidentDate'),
            incidentLocation: formData.get('incidentLocation'),
            incidentDescription: formData.get('incidentDescription'),
            incidentWeapon: formData.get('incidentWeapon'),
            user: formData.get('user') // ou extraído do token
        };

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Você precisa estar logado para cadastrar um caso.");
            return;
        }

        try {
            const response = await fetch('https://laudos-pericias.onrender.com/api/cases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(caseData)
            });

            if (response.ok) {
                alert('Caso cadastrado com sucesso!');
                window.location.href = 'list-case.html';
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao cadastrar caso.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar caso. Por favor, tente novamente.');
        }
    });
});
