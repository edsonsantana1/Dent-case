document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Impede envio automático do formulário

    const cargo = document.getElementById("cargo").value;
    const matricula = document.getElementById("matricula").value;
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("mensagemErro");

    erro.innerHTML = "";
    erro.style.display = "none";

    // Validações simples
    if (cargo === '') {
        mostrarSelecao("Por favor, selecione seu cargo na lista");
        return;
    }
    if (matricula === '') {
        mostrarSelecao("Digite sua matrícula para continuar");
        return;
    }
    if (senha === '') {
        mostrarSelecao("Digite sua senha");
        return;
    }

    // 🔥 Aqui começa a integração real com seu backend
    try {
        const response = await fetch('https://laudos-pericias.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cargo: cargo,
                matricula: matricula,
                senha: senha
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Login bem-sucedido
            localStorage.setItem('token', data.token); // Salva o token JWT
            localStorage.setItem('user', JSON.stringify(data.user)); // Salva dados do usuário, se quiser

            window.location.href = "list-case.html"; // Redireciona para a página de casos
        } else {
            mostrarSelecao(data.message || "Erro ao fazer login");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        mostrarSelecao("Erro de conexão com o servidor");
    }
});

function mostrarSelecao(mensagem) {
    var erro = document.getElementById("mensagemErro");
    erro.innerHTML = mensagem;
    erro.style.color = "red";
    erro.style.display = "block";
}

// Registro do Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha ao registrar o Service Worker:', error);
            });
    });
}
