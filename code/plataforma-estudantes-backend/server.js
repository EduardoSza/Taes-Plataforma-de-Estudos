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

// Inicializa o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
