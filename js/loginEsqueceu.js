document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('esqueceuSenhaForm');
    const mensagemErro = document.getElementById('mensagemErro');
    const mensagemSucesso = document.getElementById('mensagemSucesso');
    const botaoSubmit = form.querySelector('input[type="submit"]');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const matricula = document.getElementById('matricula').value.trim();
        mensagemErro.style.display = 'none';
        mensagemSucesso.style.display = 'none';

        // Validação básica
        if (!matricula) {
            mostrarErro('Digite sua matrícula.');
            return;
        }

        if (matricula.length < 5) {
            mostrarErro('Matrícula deve ter pelo menos 5 dígitos.');
            return;
        }

        // Simulação de envio para o administrador
        solicitarRecuperacao(matricula);
    });

    function mostrarErro(mensagem) {
        mensagemErro.textContent = mensagem;
        mensagemErro.style.display = 'block';
    }

    function mostrarSucesso(mensagem) {
        mensagemSucesso.innerHTML = mensagem;
        mensagemSucesso.style.display = 'block';
    }

    function solicitarRecuperacao(matricula) {
        // Mostrar loading no botão
        const textoOriginal = botaoSubmit.value;
        botaoSubmit.value = "Enviando...";
        botaoSubmit.disabled = true;

        // Simulação de requisição ao servidor (substitua por uma chamada real)
        setTimeout(() => {
            // Em um sistema real, aqui seria uma chamada fetch/axios para seu backend
            console.log('Solicitação de recuperação para matrícula:', matricula);

            // Feedback para o usuário
            mostrarSucesso(`
                <p>Solicitação enviada ao administrador!</p>
                <p>Você receberá uma nova senha por e-mail ou outro canal definido.</p>
                <p><a href="login.html">Voltar para o login</a></p>
            `);

            // Resetar o formulário
            form.reset();
            botaoSubmit.value = textoOriginal;
            botaoSubmit.disabled = false;
        }, 1500);
    }

    // Opcional: Registrar Service Worker (se for um PWA)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('Service Worker registrado:', reg.scope))
                .catch(err => console.error('Erro no Service Worker:', err));
        });
    }
});