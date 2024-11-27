const API_URL_COMENTARIOS = 'http://localhost:3000/api/comments';

// Listar comentários de um material
async function fetchComments(materialId) {
    try {
        const response = await fetch(`${API_URL_COMENTARIOS}/material/${materialId}`);
        if (!response.ok) throw new Error('Erro ao buscar comentários');
        const comments = await response.json();
        renderComments(comments);
    } catch (err) {
        console.error('Erro ao buscar comentários:', err);
    }
}

// Criar comentário
async function createComment(materialId, userId, comment) {
    try {
        const response = await fetch(API_URL_COMENTARIOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ materialId, userId, comment }),
        });
        if (!response.ok) throw new Error('Erro ao criar comentário');
        alert('Comentário criado com sucesso');
        fetchComments(materialId);
    } catch (err) {
        console.error('Erro ao criar comentário:', err);
    }
}

// Renderizar comentários no frontend
function renderComments(comments) {
    const container = document.getElementById('comments-list');
    container.innerHTML = '';
    comments.forEach(comment => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p>${comment.username}: ${comment.comment}</p>
        `;
        container.appendChild(div);
    });
}

// Exemplo de uso
// fetchComments(materialId);
