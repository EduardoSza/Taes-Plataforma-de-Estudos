const API_URL_MATERIAIS = 'http://localhost:3000/api/study_materials';

// Listar materiais
async function fetchMaterials() {
    try {
        const response = await fetch(API_URL_MATERIAIS);
        if (!response.ok) throw new Error('Erro ao buscar materiais');
        const materials = await response.json();
        renderMaterials(materials);
    } catch (err) {
        console.error('Erro ao buscar materiais:', err);
    }
}

// Criar material
async function createMaterial(title, description, userId, topic, level) {
    try {
        const response = await fetch(API_URL_MATERIAIS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, userId, topic, level }),
        });
        if (!response.ok) throw new Error('Erro ao criar material');
        alert('Material criado com sucesso');
        fetchMaterials();
    } catch (err) {
        console.error('Erro ao criar material:', err);
    }
}

// Renderizar materiais no frontend
function renderMaterials(materials) {
    const container = document.getElementById('materials-list');
    container.innerHTML = '';
    materials.forEach(material => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3>${material.title}</h3>
            <p>${material.description}</p>
            <p>Tema: ${material.topic} | Nível: ${material.level}</p>
        `;
        container.appendChild(div);
    });
}

async function uploadMaterial() {
    const formData = new FormData(document.getElementById('materialForm'));

    try {
        const response = await fetch('/api/materials/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Erro ao enviar material');
        const result = await response.json();
        alert(result.message);
        console.log('Arquivo enviado para:', result.filePath);
    } catch (err) {
        console.error('Erro ao enviar material:', err);
    }
}

async function submitRating(button) {
    const materialId = button.closest('.post').dataset.materialId; // Associe `data-material-id` nos posts
    const rating = button.previousElementSibling.value;

    try {
        const response = await fetch(`/api/study_materials/${materialId}/rating`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating: parseInt(rating, 10) }),
        });

        if (!response.ok) throw new Error('Erro ao enviar avaliação');
        const updatedMaterial = await response.json();
        alert(`Nova média: ${updatedMaterial.average_rating.toFixed(2)}`);
    } catch (err) {
        console.error('Erro ao enviar avaliação:', err);
    }
}

// Função para listar materiais de estudo
async function fetchMaterials() {
    try {
        const response = await fetch('http://localhost:3000/api/study_materials');
        if (!response.ok) throw new Error('Erro ao buscar materiais');
        const materials = await response.json();
        renderMaterials(materials);
    } catch (err) {
        console.error('Erro ao buscar materiais:', err);
    }
}

// Função para renderizar materiais na página
function renderMaterials(materials) {
    const container = document.getElementById('materials-list');
    container.innerHTML = ''; // Limpa a lista antes de renderizar

    materials.forEach(material => {
        const post = document.createElement('div');
        post.className = 'post';
        post.setAttribute('data-material-id', material.id); // Adiciona o ID real do material

        post.innerHTML = `
            <h3>${material.title}</h3>
            <p>Publicado por ${material.username} em ${new Date(material.created_at).toLocaleDateString()}</p>
            <p>${material.description}</p>
            <div class="post-buttons">
                <button onclick="viewMaterial()">Ver Conteúdo</button>
                <button onclick="showRatingForm(this)">Avaliar</button>
                <button onclick="showCommentForm(this)">Comentar</button>
                <button onclick="toggleComments(this)">Ver Todos os Comentários</button>
            </div>
            <div class="comments-section" style="display: none; margin-top: 10px;"></div>
            <div class="ratings-section" style="margin-top: 10px;"></div>
        `;
        container.appendChild(post);
    });
}

// Chama a função fetchMaterials ao carregar a página
window.onload = fetchMaterials;

// Exemplo de uso
// fetchMaterials();
