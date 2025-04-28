# 🦷 Sistema Odonto-Legal

Sistema web desenvolvido como projeto acadêmico para o gerenciamento de casos de perícia odontolegista.

## 📱 Tecnologias Utilizadas

- **HTML5**: Estruturação da página com tags semânticas.
- **CSS3**: Estilização responsiva utilizando media queries.
- **JavaScript**: Funcionalidades interativas e dinâmicas.
- **Font Awesome + Google Material Symbols**: Ícones para melhorar a experiência do usuário.
- **Progressive Web App (PWA)**: Funcionalidade offline e instalação no dispositivo (com integração de `manifest.json` e `Service Worker`).
- **Visual Studio Code**: Editor de código utilizado para o desenvolvimento.

## 🔐 Funcionalidades

- **Login com diferentes roles**: 
  - **Administrador**: Acesso total ao sistema, incluindo gerenciamento de casos, usuários e configurações.
  - **Perito**: Visualização e criação de casos, com capacidade de gerar laudos e adicionar evidências.
  - **Assistente**: Acesso limitado a casos aos quais o assistente está vinculado, com permissão para adicionar evidências.
  
- **Cadastro e gerenciamento de casos forenses**: Permite registrar e editar informações de casos, além de vincular evidências.
- **Visualização de evidências e histórico**: O sistema mantém um histórico das evidências e ações realizadas nos casos.
- **Layout responsivo com menu hambúrguer**: O design é adaptável para diferentes tamanhos de tela, facilitando o uso em dispositivos móveis.
- **Integração com `manifest.json` e `Service Worker` para PWA**: Permite que o sistema funcione como um aplicativo web progressivo, com suporte offline.

## 🧪 Como rodar o projeto

1. Clone o repositório:

   ```bash
   git clone https://github.com/edsonsantana1/Dent-case.git
