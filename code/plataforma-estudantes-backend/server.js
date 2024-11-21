const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const bcrypt = require('bcrypt'); // Para criptografar a senha

const app = express();
app.use(cors());
app.use(express.json());

// Configurações do banco de dados
const client = new Client({
    user: 'postgres',            
    host: 'localhost',           
    database: 'plataforma_estudantes',
    password: 'Andromenda@1',
    port: 5432,                  
});

async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/users'); // Corrigir a URL
        if (!response.ok) throw new Error('Erro ao buscar usuários');
        const users = await response.json();
        console.log(users); // Verificar os dados recebidos
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
    }
}


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


// Inicializa o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
