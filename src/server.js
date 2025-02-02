import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import cripto from './criptografia.js';
import trataArquivos from './trataArquivos.js';
import bd from './trataBd.js'

import { v4 as uuidv4 } from 'uuid';

import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname para ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json()); // Para interpretar JSON
app.use(bodyParser.text()); // Adicionado para aceitar payloads como texto
app.use(bodyParser.urlencoded({ extended: true })); // Para interpretar dados de formulário

// Usar algum meio de excluir as sessões mais antigas de tempos em tempos caso não sejam usadas 


// Middleware para habilitar CORS
app.use(cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'tokensession'],  // Cabeçalhos permitidos, incluindo o 'session'
  credentials: true,  // Permite o envio de cookies e cabeçalhos personalizados
}));
console.log("server.js foi carregado com sucesso!");

// Servindo arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.static(path.join(__dirname, '..')));
// Middleware para lidar com JSON no corpo da requisição
app.use(express.json());


app.get('/testecriasessao', (req, res) => {
  //const { publicKey, sessionId } = bd.criaSessao()
  //const sessoes = bd.obtemSessoes()

  res.json(bd.insereSessao());

});
app.get('/testeobtemsessoes', (req, res) => {
  // const { publicKey, sessionId } = bd.criaSessao()
  //const sessoes = bd.obtemSessoes()
  res.json(bd.obtemSessoes());

});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Rota para listar todos os usuários (READ) (proteger para somente o super usuário ober esses dados)
app.get('/usuarios', (req, res) => {
  trataArquivos.refreshUsuarios()
  console.log(`ln  55 - ${trataArquivos.arquivoUsuarios}`)
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

function formatMilliseconds(ms) { // COLOCAR ESSA FUNÇÃO EM OUTRO LUGAR PROVAVELMENTE EXISTA ALGUMA BIBLIOTECA PRONTA
  // Calculando as partes de tempo (horas, minutos, segundos, milissegundos)
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  // Criando a string formatada com o padrão de 2 dígitos para cada parte
  return new Intl.NumberFormat('pt-BR', { minimumIntegerDigits: 2 }).format(hours) +
    `h ${new Intl.NumberFormat('pt-BR', { minimumIntegerDigits: 2 }).format(minutes)}m ` +
    `${new Intl.NumberFormat('pt-BR', { minimumIntegerDigits: 2 }).format(seconds)}s ` +
    `${milliseconds}ms`;
}

app.get('/testarConexao', async (req, res) => {
  await bd.insereSessao()
  res.json(await bd.obtemSessoes())
})

// Cria uma nova sessão no banco de dados e retorna o sessionId e a publicKey
app.get('/tokendesessao', async (req, res) => {
  const sessao = await bd.insereSessao()
  res.json(sessao)
})

// Versão em arquivo json
// // Rota para obter um usuário específico pelo ID (READ)
// app.get('/tokendesessao', (req, res) => {
//   const { publicKey, privateKey } = cripto.gerarParDeChaves();
//   const sessionId = uuidv4(); // Gera identificador único para a sessão
//   const sessionKeys = { sessionId, publicKey, privateKey, timestamp: Date.now() }; // Para armazenar pares de chaves para sessões específicas
//   trataArquivos.criaArquivoDeSessoes(sessionKeys)
//   const listaDeSessoes = trataArquivos.leArquivoDeSessoes()

//   const sessoesValidas = listaDeSessoes.filter((sessao) => {
//     // Calcula o tempo de vida em milissegundos
//     const tempoDeVidaMs = Date.now() - sessao.timestamp;
//     console.log(`Tempo de vida da sessão ${Date.now()} - ${sessao.timestamp} = ${tempoDeVidaMs}`)

//     // Verifica se o tempo de vida é menor que 5 minutos (300000 ms)
//     return tempoDeVidaMs < 5 * 60 * 1000; // 5 minutos em milissegundos
//   });

//   // // Estrutura de debug
//   // console.log("Sessões válidas")
//   // sessoesValidas.forEach((sessao) => {
//   //   console.log(`Session ID: ${sessao.sessionId} -> ${formatMilliseconds(Date.now() - sessao.timestamp)}`);
//   //   // console.log(`Public Key: ${sessao.publicKey}`);
//   //   // console.log(`Private Key: ${sessao.privateKey}`);
//   //   // console.log(`Timestamp: ${sessao.timestamp}`);
//   // });

//   trataArquivos.atualizaArquivoDeSessoes(sessoesValidas)

//   // Envia a chave pública e o ID da sessão ao cliente
//   res.json({ publicKey, sessionId });
// });


// // Rota para criar um novo usuário (CREATE)
// app.post('/usuarios', async (req, res) => {
//   try {
//     const { data, sessionId } = req.body;

//     // Recupera  achave privada da sessão a partir do sessionId
//     const privateKey = trataArquivos.obtemPrivateKeyDeSessao(sessionId)
//     // Verifica se a sessão é válida
//     if (!privateKey) {
//       return res.status(400).json({ error: 'Sessão inválida ou expirou.' });
//     }
//     const decryptedData = await cripto.descriptografar(data, privateKey);

//     // Converte os dados descriptografados de volta para JSON
//     const { nome, email, cpf, senha } = JSON.parse(decryptedData);

//     // // Garante que os usuários estão sendo carregados corretamente
//     // let users = [];
//     // if (Array.isArray(trataArquivos.arquivoUsuarios)) {
//     //   users = trataArquivos.arquivoUsuarios;
//     // } else if (typeof trataArquivos.arquivoUsuarios === 'string') {
//     //   users = JSON.parse(trataArquivos.arquivoUsuarios);
//     // }

//     // Obtem o array de usuarios a partir do arquivo usuarios.json    
//     const users = trataArquivos.refreshUsuarios();

//     // Verifica se o CPF já existe
//     if (users.find(u => u.cpf === cpf)) {
//       return res.status(400).json({ error: 'Usuário com este CPF já existe!' });
//     }

//     // Adiciona o novo usuário e atualiza o arquivo JSON
//     const newUser = { nome, email, cpf, senha };
//     trataArquivos.updateJsonFile(newUser);
//     trataArquivos.refreshUsuarios();


//     res.status(201).json({ message: 'Usuário criado com sucesso!', usuario: newUser });
//   } catch (error) {
//     console.error('Erro ao criar usuário:', error);
//     res.status(500).json({ error: 'Erro ao criar usuário. Verifique os dados enviados.' });
//   }
// });


// Rota para criar um novo usuário (CREATE)
app.post('/usuarios', async (req, res) => {
  try {
    const { data, sessionId } = req.body;

    console.log(sessionId)
    // Recupera  a chave privada da sessão a partir do sessionId
    const privateKey = await bd.obtemPrivateKeyDeSessao(sessionId)

    // Verifica se a sessão é válida
    if (!privateKey) {
      return res.status(400).json({ error: 'Sessão inválida ou expirou.' });
    }
    const decryptedData = await cripto.descriptografar(data, privateKey);

    const newUser = JSON.parse(decryptedData);
    // Se o cpf já existir não cria o usuário
    if (await bd.verificaCpfExiste(newUser.cpf))
      return res.status(400).json({ error: 'Usuário com este CPF já existe!' });

    // Adiciona o novo usuário e atualiza o arquivo JSON

    await bd.insereUsuario(newUser)

    res.status(201).json({ message: 'Usuário criado com sucesso!', usuario: newUser });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário. Verifique os dados enviados.' });
  }
});

// // Rota para criar um novo usuário (CREATE)
// app.post('/login', async (req, res) => {
//   try {
//     const { data, sessionId } = req.body;

//     const privateKey = trataArquivos.obtemPrivateKeyDeSessao(sessionId)
//     // Verifica se a sessão é válida
//     if (!privateKey) {
//       return res.status(400).json({ error: 'Sessão inválida ou expirou.' });
//     }

//     // Decriptografa os dados de login usando a chave privada da sessão
//     const decryptedData = await cripto.descriptografar(data, privateKey);

//     // Converte os dados descriptografados de volta para JSON
//     const { cpf, senha } = JSON.parse(decryptedData);

//     // Obtem o array de usuarios a partir do arquivo usuarios.json    
//     const users = trataArquivos.refreshUsuarios();

//     // Tenta encontrar o usuário
//     const user = users.find(u => u.cpf === cpf);

//     // Verifica se o CPF já existe
//     if (user) {
//       console.log(`CPF está cadastrado`);
//       if (user.senha === senha) {
//         console.log(`Login efetuado! ${user.nome}`)
//         res.status(200).send(`Login efetuado! ${user.nome}`);
//       } else {
//         console.log(`Senha incorreta!`)
//         return res.status(400).json({ error: 'Senha incorreta!' });
//       }
//     } else {
//       console.log(`CPF não cadastrado!`)
//       return res.status(400).json({ error: 'CPF não cadastrado!' });
//     }


//   } catch (error) {
//     console.error('Erro ao logar usuário:', error);
//     res.status(500).json({ error: 'Erro ao logar usuário. Verifique os dados enviados.' });
//   }
// });

// Rota para criar um novo usuário (CREATE)
app.post('/login', async (req, res) => {
  try {
    const { data, sessionId } = req.body;

    const privateKey = await bd.obtemPrivateKeyDeSessao(sessionId)
    // Verifica se a sessão é válida
    if (!privateKey) {
      return res.status(400).json({ error: 'Sessão inválida ou expirou.' });
    }

    // Decriptografa os dados de login usando a chave privada da sessão
    const decryptedData = await cripto.descriptografar(data, privateKey);

    // Converte os dados descriptografados de volta para JSON
    const { cpf, senha } = JSON.parse(decryptedData);

    const user = await bd.obtemUsuarioComCpf(cpf)

    console.log(user)
    // Verifica se o CPF já existe
    if (user) {
      console.log(`CPF está cadastrado`);
      if (user.senha === senha) {
        console.log(`Login efetuado! ${user.nome}`)
        res.status(200).send(`Login efetuado! ${user.nome}`);
      } else {
        console.log(`Senha incorreta!`)
        return res.status(400).json({ error: 'Senha incorreta!' });
      }
    } else {
      console.log(`CPF não cadastrado!`)
      return res.status(400).json({ error: 'CPF não cadastrado!' });
    }


  } catch (error) {
    console.error('Erro ao logar usuário:', error);
    res.status(500).json({ error: 'Erro ao logar usuário. Verifique os dados enviados.' });
  }
});



/////////////////////////////////////////////////////////////////////////////////////
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

// app.get("/favicon.ico", (req, res) => res.status(204));


// setInterval(() => {
//   const now = Date.now();
//   onsole.log('setInterval executado');
// console.log('Estado atual de globalKeys:', JSON.stringify(globalKeys));
//   Object.keys(globalKeys).forEach(sessionId => {
//       if (now - globalKeys[sessionId].timestamp > 3600000) { // 1 hora
//           delete globalKeys[sessionId];
//       }
//   });
// }, 1000); // Executa a cada minuto



export default app;
