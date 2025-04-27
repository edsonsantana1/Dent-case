function toggleSubMenu(button) {
    const subMenu = button.nextElementSibling;
    subMenu.style.display = subMenu.style.display === "flex" ? "none" : "flex";
  }

// Função para buscar todos os usuários
async function fetchUsers() {
  try {
    const response = await fetch('https://laudos-pericias.onrender.com/api/users');
    const users = await response.json();
    populateUserList(users);
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  }
}

// Função para popular a lista de usuários na interface
function populateUserList(users) {
  const userListContainer = document.querySelector('.users-list-container');
  userListContainer.innerHTML = ''; // Limpar a lista existente

  users.forEach(user => {
    const userItem = document.createElement('div');
    userItem.classList.add('user-list-item');
    userItem.innerHTML = `
      <div class="user-list-content" onclick="openUserModal('view', '${user._id}')">
        <div class="user-list-main">
          <span class="user-id">#${user._id}</span>
          <h3 class="user-name">${user.name}</h3>
          <span class="user-role ${user.role}">${user.role}</span>
        </div>
        <div class="user-list-details">
          <p class="user-email">${user.email}</p>
          <div class="user-meta">
            <span><i class="fas fa-id-card"></i> Matrícula: ${user.registration}</span>
          </div>
        </div>
      </div>
    `;
    userListContainer.appendChild(userItem);
  });
}

// Função para adicionar ou editar um usuário
async function saveUser(userData, userId = null) {
  const url = userId ? `https://laudos-pericias.onrender.com/api/users/${userId}` : 'https://laudos-pericias.onrender.com/api/users';
  const method = userId ? 'PUT' : 'POST'; // Se userId existe, é uma edição, senão é criação

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      alert(userId ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
      fetchUsers(); // Recarregar a lista de usuários
      closeUserModal();
    } else {
      alert('Erro ao salvar usuário');
    }
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
  }
}

// Função para deletar um usuário
async function deleteUser(userId) {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    try {
      const response = await fetch(`https://laudos-pericias.onrender.com/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Usuário excluído com sucesso!');
        fetchUsers(); // Recarregar a lista de usuários
        closeUserModal();
      } else {
        alert('Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  }
}

// Função para abrir o modal para adicionar ou editar usuário
function openUserModal(action, userId = null) {
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
    // Carregar os dados do usuário
    loadUserData(userId);
  }

  modal.style.display = 'flex';
}

// Função para carregar os dados do usuário no modal
async function loadUserData(userId) {
  try {
    const response = await fetch(`https://laudos-pericias.onrender.com/api/users/${userId}`);
    const user = await response.json();
    
    // Preencher o formulário com os dados do usuário
    document.getElementById('userRole').value = user.role;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    // Não preenchemos a senha por questões de segurança
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
  }
}

// Fechar o modal
function closeUserModal() {
  document.getElementById('userModal').style.display = 'none';
}

// Enviar o formulário para salvar ou editar o usuário
document.getElementById('userForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const userData = {
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    role: document.getElementById('userRole').value,
    password: document.getElementById('userPassword').value, // A senha pode ser deixada em branco para manter a atual
  };

  const userId = document.getElementById('userForm').dataset.userId;

  saveUser(userData, userId);
});

// Ao carregar a página, buscar os usuários
document.addEventListener('DOMContentLoaded', fetchUsers);

