const API_URL = 'http://localhost:3000/api/connections';

// Listar conexões do usuário
async function fetchConnections(userId) {
    try {
        const response = await fetch(`${API_URL}/user?userId=${userId}`);
        if (!response.ok) throw new Error('Erro ao buscar conexões');
        const connections = await response.json();
        renderConnections(connections);
    } catch (err) {
        console.error('Erro ao buscar conexões:', err);
    }
}

// Criar uma nova conexão
async function createConnection(userId, connectedUserId) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, connectedUserId }),
        });
        if (!response.ok) throw new Error('Erro ao criar conexão');
        alert('Solicitação de conexão enviada');
    } catch (err) {
        console.error('Erro ao criar conexão:', err);
    }
}

// Renderizar conexões no frontend
function renderConnections(connections) {
    const container = document.getElementById('connections-list');
    container.innerHTML = '';
    connections.forEach(connection => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p>${connection.username} - Status: ${connection.status}</p>
        `;
        container.appendChild(div);
    });
}

// Exemplo de uso
// fetchConnections(userId); // Substitua "userId" pelo ID real do usuário
