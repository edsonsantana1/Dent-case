document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Impede envio automático do formulário

    const matricula = document.getElementById("matricula").value;
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("mensagemErro");

    erro.innerHTML = "";
    erro.style.display = "none";

    // Validação
    if (!matricula || !senha) {
        mostrarSelecao("Preencha todos os campos corretamente.");
        return;
    }

    try {
        const response = await fetch('https://laudos-pericias.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Login bem-sucedido
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("userRole", data.user.role); // Salva a role
            localStorage.setItem("userId", data.user.id); // Salva o ID

            console.log("Login realizado com sucesso!");
            console.log("Token JWT:", localStorage.getItem("token"));
            console.log("Role do usuário:", localStorage.getItem("userRole"));
            console.log("ID do usuário:", localStorage.getItem("userId"));

            // Redireciona para a página de casos
            window.location.href = "list-case.html";  
        } else {
            mostrarSelecao(data.msg || "Erro ao fazer login");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        mostrarSelecao("Erro de conexão com o servidor");
    }
});

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

// Função para exibir mensagens de erro
function mostrarSelecao(mensagem) {
    var erro = document.getElementById("mensagemErro");
    erro.innerHTML = mensagem;
    erro.style.color = "red";
    erro.style.display = "block";
}