// Função para alternar a exibição do submenu
function toggleSubMenu(button) {
  const subMenu = button.nextElementSibling;
  subMenu.style.display = subMenu.style.display === "flex" ? "none" : "flex";
}

// Função para buscar todos os usuários, apenas se for administrador
async function fetchUsers() {
  const userListContainer = document.querySelector('.users-list-container');
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token || userRole !== "administrador") {
    alert("Apenas administradores podem gerenciar usuários!");
    window.location.href = "dashboard.html";
    return;
  }

  try {
    const response = await fetch('https://laudos-pericias.onrender.com/api/users', {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Erro ao buscar usuários");

    const users = await response.json();
    renderUserList(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    userListContainer.innerHTML = "<p class='error-message'>Erro ao carregar usuários.</p>";
  }
}

// Função para renderizar os usuários na interface
function renderUserList(users) {
  const userListContainer = document.querySelector('.users-list-container');
  userListContainer.innerHTML = '';

  if (!users.length) {
    userListContainer.innerHTML = "<p class='error-message'>Nenhum usuário encontrado.</p>";
    return;
  }

  users.forEach(user => {
    const userItem = document.createElement('div');
    userItem.classList.add('user-list-item');
    userItem.innerHTML = `
      <div class="user-list-content" onclick="openUserModal('view', '${user._id}')">
        <span class="user-id">#${user._id}</span>
        <h3 class="user-name">${user.name}</h3>
        <span class="user-role role-${user.role}">${user.role}</span>
      </div>
    `;
    userListContainer.appendChild(userItem);
  });
}

// Função para abrir o modal e carregar dados do usuário
async function openUserModal(action, userId = null) {
  const modal = document.getElementById('userModal');
  const modalTitle = document.getElementById('modalTitle');
  const deleteBtn = document.getElementById('deleteBtn');

  if (action === 'new') {
    modalTitle.textContent = 'Cadastrar Novo Usuário';
    deleteBtn.style.display = 'none';
    document.getElementById('userForm').reset();
  } else {
    modalTitle.textContent = 'Editar Usuário';
    deleteBtn.style.display = 'block';
    await loadUserData(userId);
  }

  modal.style.display = 'flex';
}

// Carregar dados do usuário ao abrir o modal
async function loadUserData(userId) {
  try {
    const response = await fetch(`https://laudos-pericias.onrender.com/api/users/${userId}`);
    const user = await response.json();

    document.getElementById('userRole').value = user.role;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
  }
}

// Fechar modal
function closeUserModal() {
  document.getElementById('userModal').style.display = 'none';
}

// Inicializa a busca ao carregar a página
document.addEventListener('DOMContentLoaded', fetchUsers);