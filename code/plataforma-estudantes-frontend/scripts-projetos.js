const API_URL_PROJETOS = 'http://localhost:3000/api/collaborative_projects';

// Listar projetos colaborativos
async function fetchProjects() {
    try {
        const response = await fetch(API_URL_PROJETOS);
        if (!response.ok) throw new Error('Erro ao buscar projetos');
        const projects = await response.json();
        renderProjects(projects);
    } catch (err) {
        console.error('Erro ao buscar projetos:', err);
    }
}

// Criar projeto colaborativo
async function createProject(title, description, userId) {
    try {
        const response = await fetch(API_URL_PROJETOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, userId }),
        });
        if (!response.ok) throw new Error('Erro ao criar projeto');
        alert('Projeto criado com sucesso');
        fetchProjects();
    } catch (err) {
        console.error('Erro ao criar projeto:', err);
    }
}

// Renderizar projetos no frontend
function renderProjects(projects) {
    const container = document.getElementById('projects-list');
    container.innerHTML = '';
    projects.forEach(project => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
        `;
        container.appendChild(div);
    });
}

// Exemplo de uso
// fetchProjects();
