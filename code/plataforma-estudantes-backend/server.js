const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const bcrypt = require('bcrypt'); // Para criptografar a senha

const app = express();
app.use(cors());
app.use(express.json());

const multer = require('multer');

// Configuração do armazenamento de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Diretório para armazenar os arquivos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nome único para cada arquivo
    }
});

const upload = multer({ storage });

// Rota para upload de arquivos de materiais
app.post('/api/materials/upload', upload.single('file'), (req, res) => {
    try {
        res.status(200).json({ message: 'Arquivo enviado com sucesso!', filePath: req.file.path });
    } catch (err) {
        console.error('Erro ao enviar arquivo:', err);
        res.status(500).send('Erro ao enviar arquivo');
    }
});

// Configurações do banco de dados
const client = new Client({
    user: 'postgres',            
    host: 'localhost',           
    database: 'plataforma_estudantes',
    password: 'Andromenda@1',
    port: 5432,                  
});

// Conectando ao banco de dados
client.connect()
    .then(() => console.log("Conectado ao PostgreSQL"))
    .catch(err => console.error('Erro ao conectar ao PostgreSQL', err));

// Endpoint para cadastrar um novo usuário
app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body; 
    try {
        // Criptografa a senha antes de salvar
        const hashedPassword = await bcrypt.hash(password, 10);
        await client.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
        res.status(201).send('Usuário criado com sucesso');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao criar usuário');
    }
});

// Endpoint para listar todos os usuários
app.get('/api/users', async (req, res) => {
    try {
        const result = await client.query('SELECT id, username, email FROM users'); // Evita enviar senhas
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// Endpoint para login de usuário
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca o usuário pelo email
        const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).send('Usuário não encontrado');
        }

        const user = userResult.rows[0];

        // Verifica a senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Senha incorreta');
        }

        // Login bem-sucedido
        res.status(200).send({ message: 'Login bem-sucedido', userId: user.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao realizar login');
    }
});

// Endpoint para listar mensagens de um usuário
app.get('/api/direct_messages/user', async (req, res) => {
    const userId = req.query.userId; // Passe o ID do usuário como query parameter
    try {
        const result = await client.query(`
            SELECT dm.id, dm.message, dm.created_at, 
                   u.username AS sender 
            FROM direct_messages dm
            JOIN users u ON dm.sender_id = u.id
            WHERE dm.recipient_id = $1
            ORDER BY dm.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar mensagens');
    }
});

// Endpoint para enviar mensagem
app.post('/api/direct_messages', async (req, res) => {
    const { senderId, recipient, message } = req.body;
    try {
        const recipientResult = await client.query('SELECT id FROM users WHERE username = $1', [recipient]);
        if (recipientResult.rows.length === 0) {
            return res.status(404).send('Usuário destinatário não encontrado');
        }
        const recipientId = recipientResult.rows[0].id;

        await client.query(`
            INSERT INTO direct_messages (sender_id, recipient_id, message)
            VALUES ($1, $2, $3)
        `, [senderId, recipientId, message]);
        res.status(201).send('Mensagem enviada');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao enviar mensagem');
    }
});

// Endpoint para apagar mensagem
app.delete('/api/direct_messages/:id', async (req, res) => {
    const messageId = req.params.id;
    try {
        await client.query('DELETE FROM direct_messages WHERE id = $1', [messageId]);
        res.status(200).send('Mensagem apagada');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao apagar mensagem');
    }
});

// Endpoint para listar notificações de um usuário
app.get('/api/notifications/user', async (req, res) => {
    const userId = req.query.userId;
    try {
        const result = await client.query(`
            SELECT id, message, is_read, created_at 
            FROM notifications 
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar notificações');
    }
});

// Endpoint para marcar notificação como lida
app.patch('/api/notifications/:id', async (req, res) => {
    const notificationId = req.params.id;
    try {
        await client.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [notificationId]);
        res.status(200).send('Notificação marcada como lida');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar notificação');
    }
});

// Endpoint para apagar notificação
app.delete('/api/notifications/:id', async (req, res) => {
    const notificationId = req.params.id;
    try {
        await client.query('DELETE FROM notifications WHERE id = $1', [notificationId]);
        res.status(200).send('Notificação apagada');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao apagar notificação');
    }
});

// Endpoint para buscar dados do perfil do usuário
app.get('/api/user_profiles/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const result = await client.query(`
            SELECT u.username, up.interests, up.experience
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = $1
        `, [userId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar perfil do usuário');
    }
});

// Endpoint para atualizar dados do perfil do usuário
app.put('/api/user_profiles/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { username, interests, experience } = req.body;

    try {
        await client.query('UPDATE users SET username = $1 WHERE id = $2', [username, userId]);

        await client.query(`
            INSERT INTO user_profiles (user_id, interests, experience)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id)
            DO UPDATE SET interests = $2, experience = $3
        `, [userId, interests, experience]);

        res.status(200).send('Perfil atualizado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar perfil');
    }
});

// Endpoint para criar uma conexão
app.post('/api/connections', async (req, res) => {
    const { userId, connectedUserId } = req.body;
    try {
        await client.query(`
            INSERT INTO connections (user_id, connected_user_id, status)
            VALUES ($1, $2, 'pending')
        `, [userId, connectedUserId]);
        res.status(201).send('Solicitação de conexão enviada');
    } catch (err) {
        console.error('Erro ao criar conexão:', err);
        res.status(500).send('Erro ao criar conexão');
    }
});

// Endpoint para listar conexões de um usuário
app.get('/api/connections/user', async (req, res) => {
    const { userId } = req.query;
    try {
        const result = await client.query(`
            SELECT c.connected_user_id, u.username, c.status
            FROM connections c
            JOIN users u ON c.connected_user_id = u.id
            WHERE c.user_id = $1
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar conexões:', err);
        res.status(500).send('Erro ao listar conexões');
    }
});

// Endpoint para atualizar status de uma conexão
app.patch('/api/connections', async (req, res) => {
    const { userId, connectedUserId, status } = req.body;
    try {
        await client.query(`
            UPDATE connections SET status = $3
            WHERE user_id = $1 AND connected_user_id = $2
        `, [userId, connectedUserId, status]);
        res.status(200).send('Conexão atualizada');
    } catch (err) {
        console.error('Erro ao atualizar conexão:', err);
        res.status(500).send('Erro ao atualizar conexão');
    }
});

// Endpoint para criar material de estudo
app.post('/api/study_materials', async (req, res) => {
    const { title, description, userId, topic, level } = req.body;
    try {
        await client.query(`
            INSERT INTO study_materials (title, description, user_id, topic, level)
            VALUES ($1, $2, $3, $4, $5)
        `, [title, description, userId, topic, level]);
        res.status(201).send('Material de estudo criado');
    } catch (err) {
        console.error('Erro ao criar material de estudo:', err);
        res.status(500).send('Erro ao criar material de estudo');
    }
});

// Endpoint para listar materiais de estudo
app.get('/api/study_materials', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM study_materials');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar materiais de estudo:', err);
        res.status(500).send('Erro ao listar materiais de estudo');
    }
});

// Endpoint para criar um projeto colaborativo
app.post('/api/collaborative_projects', async (req, res) => {
    const { title, description, userId } = req.body;
    try {
        await client.query(`
            INSERT INTO collaborative_projects (title, description, user_id)
            VALUES ($1, $2, $3)
        `, [title, description, userId]);
        res.status(201).send('Projeto colaborativo criado');
    } catch (err) {
        console.error('Erro ao criar projeto colaborativo:', err);
        res.status(500).send('Erro ao criar projeto colaborativo');
    }
});

// Endpoint para listar projetos colaborativos
app.get('/api/collaborative_projects', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM collaborative_projects');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar projetos colaborativos:', err);
        res.status(500).send('Erro ao listar projetos colaborativos');
    }
});

// Endpoint para criar comentário
app.post('/api/comments', async (req, res) => {
    const { materialId, userId, comment } = req.body;
    try {
        await client.query(`
            INSERT INTO comments (material_id, user_id, comment)
            VALUES ($1, $2, $3)
        `, [materialId, userId, comment]);
        res.status(201).send('Comentário criado');
    } catch (err) {
        console.error('Erro ao criar comentário:', err);
        res.status(500).send('Erro ao criar comentário');
    }
});

// Endpoint para listar comentários de um material
app.get('/api/comments/material/:materialId', async (req, res) => {
    const { materialId } = req.params;
    try {
        const result = await client.query(`
            SELECT c.comment, u.username, c.created_at
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.material_id = $1
        `, [materialId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar comentários:', err);
        res.status(500).send('Erro ao listar comentários');
    }
});

// Endpoint para avaliar materiais
app.patch('/api/study_materials/:id/rating', async (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
        return res.status(400).send('Avaliação deve estar entre 1 e 5');
    }

    try {
        const updateQuery = `
            UPDATE study_materials
            SET total_ratings = total_ratings + $1,
                ratings_count = ratings_count + 1
            WHERE id = $2
        `;
        const result = await client.query(updateQuery, [rating, id]);

        const fetchQuery = `
            SELECT total_ratings, ratings_count,
                   CASE
                       WHEN ratings_count > 0 THEN total_ratings::FLOAT / ratings_count
                       ELSE NULL
                   END AS average_rating
            FROM study_materials WHERE id = $1
        `;
        const material = await client.query(fetchQuery, [id]);

        res.status(200).json(material.rows[0]);
    } catch (err) {
        console.error('Erro ao avaliar material:', err);
        res.status(500).send('Erro ao avaliar material');
    }
});



// Inicializa o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
