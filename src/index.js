import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import cripto from './criptografia.js';
import trataArquivos from './trataArquivos.js';

import { v4 as uuidv4 } from 'uuid';



const app = express();
app.use(bodyParser.json()); // Para interpretar JSON
app.use(bodyParser.text()); // Adicionado para aceitar payloads como texto
app.use(bodyParser.urlencoded({ extended: true })); // Para interpretar dados de formulário

const PORT = 3001;

// Middleware para habilitar CORS
app.use(cors({
    origin: 'http://127.0.0.1:5501',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'tokensession'],  // Cabeçalhos permitidos, incluindo o 'session'
    credentials: true,  // Permite o envio de cookies e cabeçalhos personalizados
}));

// Middleware para lidar com JSON no corpo da requisição
app.use(express.json());



// Rota para listar todos os usuários (READ)
app.get('/usuarios', (req, res) => {
    trataArquivos.refreshUsuarios()
    console.log(`ln  35 - ${trataArquivos.arquivoUsuarios}`)
    res.json(trataArquivos.arquivoUsuarios);
});

// Rota para obter um usuário específico pelo ID (READ)
app.get('/usuarios/:cpf', (req, res) => {
    const { cpf } = req.params;
    const usuario = trataArquivos.arquivoUsuarios.find(usuario => usuario.cpf === parseInt(cpf));

    if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
    }

    res.json(usuario);
});

// Rota para atualizar um usuário pelo ID (UPDATE)
app.put('/usuarios/:cpf', (req, res) => {
    const { cpf } = req.params;
    const { nome, usuario, senha } = req.body;

    const usuarioIndex = trataArquivos.arquivoUsuarios.findIndex(usuario => usuario.cpf === parseInt(cpf));

    if (usuarioIndex === -1) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
    }

    // Atualiza o usuário
    trataArquivos.arquivoUsuarios[usuarioIndex] = { cpf: parseInt(cpf), nome, usuario, senha };
    res.json({ message: 'Usuário atualizado com sucesso!', usuario: trataArquivos.arquivoUsuarios[usuarioIndex] });
});

// Rota para excluir um usuário pelo ID (DELETE)
app.delete('/usuarios/:cpf', (req, res) => {
    const { cpf } = req.params;
    const usuarioIndex = trataArquivos.arquivoUsuarios.findIndex(usuario => usuario.cpf === parseInt(cpf));

    if (usuarioIndex === -1) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
    }

    trataArquivos.arquivoUsuarios.splice(usuarioIndex, 1);
    res.json({ message: 'Usuário excluído com sucesso!' });
});

// Usar algum meio de excluir as sessões mais antigas de tempos em tempos caso não sejam usadas 
let globalKeys = {}; // Para armazenar pares de chaves para sessões específicas

// Rota para obter um usuário específico pelo ID (READ)
app.get('/tokendesessao', (req, res) => {
    const { publicKey, privateKey } = cripto.gerarParDeChaves();
    const sessionId = uuidv4(); // Gera identificador único para a sessão

    // Salva as chaves na memória (pode ser aprimorado para persistência segura)
    globalKeys[sessionId] = { publicKey, privateKey };

    // Envia a chave pública e o ID da sessão ao cliente
    res.json({ publicKey, sessionId });
});

// Rota para criar um novo usuário (CREATE)
app.post('/usuarios', async (req, res) => {
    try {
        const { data, sessionId } = req.body;

        // Verifica se a sessão é válida
        if (!globalKeys[sessionId]) {
            return res.status(400).json({ error: 'Sessão inválida ou expirou.' });
        }

        const privateKey = globalKeys[sessionId].privateKey;
        const decryptedData = await cripto.descriptografar(data, privateKey);

        // Converte os dados descriptografados de volta para JSON
        const { nome, cpf, usuario, senha } = JSON.parse(decryptedData);

        // Garante que os usuários estão sendo carregados corretamente
        let users = [];
        if (Array.isArray(trataArquivos.arquivoUsuarios)) {
            users = trataArquivos.arquivoUsuarios;
        } else if (typeof trataArquivos.arquivoUsuarios === 'string') {
            users = JSON.parse(trataArquivos.arquivoUsuarios);
        }

        // Verifica se o CPF já existe
        if (users.find(u => u.cpf === cpf)) {
            return res.status(400).json({ error: 'Usuário com este CPF já existe!' });
        }

        // Adiciona o novo usuário e atualiza o arquivo JSON
        const newUser = { nome, cpf, usuario, senha };
        trataArquivos.updateJsonFile(newUser);
        trataArquivos.refreshUsuarios();

        res.status(201).json({ message: 'Usuário criado com sucesso!', usuario: newUser });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário. Verifique os dados enviados.' });
    }
});

// Rota para criar um novo usuário (CREATE)
app.post('/login', async (req, res) => {
    try {
        const { data, sessionId } = req.body;

        // Verifica se a sessão é válida
        if (!globalKeys[sessionId]) {
            return res.status(400).json({ error: 'Sessão inválida ou expirou.' });
        }

        const privateKey = globalKeys[sessionId].privateKey;
        const decryptedData = await cripto.descriptografar(data, privateKey);

        // Converte os dados descriptografados de volta para JSON
        const { usuario, senha } = JSON.parse(decryptedData);

        console.log(usuario)

        // Garante que os usuários estão sendo carregados corretamente
        let users = [];
        if (Array.isArray(trataArquivos.arquivoUsuarios)) {
            users = trataArquivos.arquivoUsuarios;
        } else if (typeof trataArquivos.arquivoUsuarios === 'string') {
            users = JSON.parse(trataArquivos.arquivoUsuarios);
        }

        // Tenta encontrar o usuário
        const user = users.find(u => u.cpf === usuario);

        // Verifica se o CPF já existe
        if (user) {
            console.log(`CPF está cadastrado`);
            if (user.senha === senha) {
                res.status(200).json({ message: `Login efetuado! ${user.nome}` });
            } else {
                return res.status(400).json({ error: 'Senha incorreta!' });
            }
        } else {
            return res.status(400).json({ error: 'CPF não cadastrado!' });
        }


    } catch (error) {
        console.error('Erro ao logar usuário:', error);
        res.status(500).json({ error: 'Erro ao logar usuário. Verifique os dados enviados.' });
    }
});

app.post('/teste', (req, res) => {
    const mensagem = JSON.stringify(req.body, null, 2)
    // Serializa e exibe o payload recebido
    console.log(`Dado recebido (JSON):\n${req.body}`);


    const mensagemTeste = mensagem //"isso é um teste"

    console.log(`criptografar: ${mensagemTeste} ${publicKey}\r\n`);
    const mensagemCriptografada = cripto.criptografar(mensagemTeste, globalPublicKey)

    console.log(`mensagemCriptografada: ${mensagemCriptografada}\r\n`);
    const mensagemDescriptografada = cripto.descriptografar(mensagemCriptografada, globalPrivateKey)
    console.log(`mensagemDescriptografada: ${mensagemDescriptografada}\r\n`);
    res.send(mensagemDescriptografada);
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});








