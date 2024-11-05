//index
function showForm(id) {
    document.getElementById(id).style.display = 'block';
}

function closeForm(id) {
    document.getElementById(id).style.display = 'none';
}

function showCommentForm(button) {
    const post = button.closest('.post');
    const commentForm = post.querySelector('.comment-form');
    commentForm.style.display = commentForm.style.display === 'none' ? 'block' : 'none';
}

function submitComment(button) {
    const form = button.parentNode;
    const commentText = form.querySelector('textarea').value;

    if (commentText.trim() !== "") {
        const post = form.closest('.post');
        const commentsSection = post.querySelector('.comments-section');
        
        const comment = document.createElement('div');
        comment.className = 'comment';
        comment.innerHTML = `
            <p>Você: ${commentText}</p>
            <button onclick="deleteComment(this)">Apagar</button>
        `;
        commentsSection.appendChild(comment);
        
        // Limpa e oculta o formulário após enviar
        form.querySelector('textarea').value = '';
        form.style.display = 'none';

        // Garante que a seção de comentários está visível
        commentsSection.style.display = 'block';
    }
}

function deleteComment(button) {
    const comment = button.parentNode;
    comment.remove();
}

function showRatingForm(button) {
    const post = button.closest('.post');
    const ratingForm = post.querySelector('.rating-form');
    ratingForm.style.display = ratingForm.style.display === 'none' ? 'block' : 'none';
}

function submitRating(button) {
    const form = button.parentNode;
    const selectedRating = form.querySelector('select').value;

    if (selectedRating) {
        const post = form.closest('.post');
        const ratingsSection = post.querySelector('.ratings-section');
        
        const rating = document.createElement('p');
        rating.innerText = `Sua Avaliação: ${"⭐".repeat(selectedRating)}`;
        ratingsSection.appendChild(rating);
        
        // Limpa e oculta o formulário após enviar
        form.style.display = 'none';
    }
}

function toggleComments(button) {
    const post = button.closest('.post');
    const commentsSection = post.querySelector('.comments-section');
    if (commentsSection.style.display === 'none' || commentsSection.style.display === '') {
        commentsSection.style.display = 'block';
        button.innerText = 'Ocultar Comentários';
    } else {
        commentsSection.style.display = 'none';
        button.innerText = 'Ver Todos os Comentários';
    }
}

// Função para simular a visualização do material
function viewMaterial() {
    alert("Redirecionando para a página do material...");
    // Aqui você poderia redirecionar para uma nova página que mostra detalhes do material
    // Exemplo: window.location.href = "material.html";
}

/////////////conectar
function search() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const studentsList = document.getElementById('studentsList');
    const students = studentsList.getElementsByClassName('student');
    
    // Esconder todos os estudantes inicialmente
    for (let student of students) {
        student.style.display = 'none';
    }
    
    // Exibir estudantes que correspondem à pesquisa
    let found = false;
    for (let student of students) {
        const name = student.querySelector('h3').innerText.toLowerCase();
        if (name.includes(query)) {
            student.style.display = 'block';
            found = true;
        }
    }
    
    // Mostrar ou esconder a lista de estudantes
    studentsList.style.display = found ? 'block' : 'none';
}

function toggleFilters() {
    const filters = document.getElementById('filters');
    filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
    filters.style.display = 'block';
    showFiltersButton.style.display = 'none';
}

function applyFilters() {
    const interesse = document.getElementById('interesse').value;
    const nivel = document.getElementById('nivel').value;
    // Implementar a lógica de filtragem aqui
    console.log('Filtrar por interesse:', interesse, 'e nível:', nivel);
}
function toggleConnection(button) {
    if (button.innerText === 'Conectar') {
        button.innerText = 'Desconectar';
    } else {
        button.innerText = 'Conectar';
    }
}

function showMessageForm(button) {
    const student = button.closest('.student');
    const messageForm = student.querySelector('.message-form');
    messageForm.style.display = messageForm.style.display === 'none' ? 'block' : 'none';
}

function sendMessage(button) {
    const form = button.parentNode;
    const messageText = form.querySelector('textarea').value;

    // Mostrar mensagem de confirmação
    const message = form.nextElementSibling;
    message.innerText = 'Mensagem enviada!';
    message.style.display = 'block';

    // Limpar o textarea
    form.querySelector('textarea').value = '';

    // Ocultar o formulário após 3 segundos
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}



//////////////////notificaçoes
let notificationsEnabled = true; // Estado inicial das notificações

function toggleNotifications() {
    notificationsEnabled = !notificationsEnabled;
    const button = document.getElementById('toggle-notifications');
    const statusMessage = document.getElementById('status-message');

    button.innerText = notificationsEnabled ? 'Desativar Notificações' : 'Ativar Notificações';
    statusMessage.innerText = notificationsEnabled ? 'Notificações ativadas.' : 'Notificações desativadas.';

    // Ocultar a mensagem após 3 segundos
    setTimeout(() => {
        statusMessage.innerText = '';
    }, 3000);
}

function manageNotification(notification) {
    const actions = notification.querySelector('.notification-actions');
    actions.style.display = actions.style.display === 'none' ? 'block' : 'none';
}

function viewInteraction(button) {
    // Simula a visualização da interação (pode ser uma nova página ou modal)
    const message = button.closest('.notification').querySelector('.message');
    message.innerText = 'Você visualizou a interação.';
    message.style.display = 'block';

    // Ocultar a mensagem após 3 segundos
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

function deleteNotification(button) {
    const notification = button.closest('.notification');
    notification.remove();
}



///////////mensagens
function openConversation(recipient) {
    // Simula a abertura da conversa. Aqui você pode redirecionar para uma página de conversa específica.
    alert('Abrindo conversa com ' + recipient); // Substitua por uma lógica real de abertura de conversa
}

function deleteConversation(event, recipient) {
    event.stopPropagation(); // Impede a abertura da conversa
    const thread = event.target.closest('.message-thread');
    thread.remove(); // Remove a conversa da lista
}

function sendMessage() {
    const recipient = document.getElementById('recipient').value;
    const content = document.getElementById('message-content').value;
    const sentMessage = document.getElementById('sent-message');

    if (recipient && content) {
        // Aqui você pode adicionar lógica para realmente enviar a mensagem
        console.log(`Mensagem enviada para ${recipient}: ${content}`);

        // Limpa os campos
        document.getElementById('recipient').value = '';
        document.getElementById('message-content').value = '';

        // Mostra a mensagem de sucesso
        sentMessage.style.display = 'block';
        setTimeout(() => {
            sentMessage.style.display = 'none';
        }, 3000); // Esconde a mensagem após 3 segundos
    } else {
        alert('Por favor, preencha todos os campos.'); // Mantenha a validação
    }
}

////////////perfil
function showForm(id) {
    document.getElementById(id).style.display = 'block';
}

function closeForm(id) {
    document.getElementById(id).style.display = 'none';
}

// Função para salvar dados do perfil
function saveProfile() {
    const newName = document.getElementById("updateName").value;
    const newUniversity = document.getElementById("updateUniversity").value;
    const newCourse = document.getElementById("updateCourse").value;

    // Atualiza os dados no perfil
    document.getElementById("userName").innerText = newName;
    document.getElementById("userUniversity").innerText = newUniversity || "Não especificado";
    document.getElementById("userCourse").innerText = newCourse || "Não especificado";

    // Fecha o formulário de atualização
    closeForm("updateForm");

    // Mensagem de confirmação
    alert("Perfil atualizado com sucesso!");
}

// Função para buscar e exibir usuários
async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:3000/users'); // URL absoluta
        const users = await response.json();
        const userList = document.getElementById('userList');
        userList.innerHTML = ''; // Limpa a lista antes de adicionar novos itens
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.username;
            userList.appendChild(li);
        });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
    }
}

// Função para criar um novo usuário
async function createUser() {
    const username = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    // Verifica se os campos obrigatórios estão preenchidos
    if (username && email && password) {
        const response = await fetch('http://localhost:3000/api/users', { // URL absoluta
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
            fetchUsers(); // Atualiza a lista de usuários após a criação
            document.getElementById('name').value = ''; // Limpa o campo
            document.getElementById('email').value = ''; // Limpa o campo
            document.getElementById('password').value = ''; // Limpa o campo
            errorMessage.style.display = 'none'; // Esconde a mensagem de erro
        } else {
            console.error('Erro ao criar usuário');
        }
    } else {
        // Exibe mensagem de erro
        errorMessage.style.display = 'block';
    }
}

// Chame essa função quando a página carregar
fetchUsers(); // Carrega a lista de usuários ao iniciar