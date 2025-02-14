import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import cripto from './criptografia.js';
import trataArquivos from './trataArquivos.js';
import bd from './trataBd.js'

import { v4 as uuidv4 } from 'uuid';

import path from 'path';
import { fileURLToPath } from 'url';
import { ok } from 'assert';

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

app.get('/usuario', async (req, res) => {
  const cpf = req.headers['cpf']; // Exemplo: Token de autenticação
  const sessionId = req.headers['session-id']; // Exemplo: Informações do navegador
  console.log(`${sessionId} , ${cpf}`)
  // Verifica se sessionId existe e se é de usuário com permissão 0
  // Obtém permissões do usuário
  const userData = await bd.obtemPermissaoUsuarioSessao(sessionId);

  if (!userData) {
    return res.status(403).json({ error: "Não autorizado." });
  }

  // Extrai nome e permissão, garantindo que existem
  const { nome, permissao } = userData;

  console.log(`Usuário ${nome} com permissão ${permissao}`);
  let conteudoPagina
  if (permissao !== 0) {
    return res.status(403).json({ error: "Não autorizado." });

  }
  res.json(await bd.buscaDadosUsuario(cpf));
})

// Rota para obter um usuário específico pelo ID (READ)
app.get('/usuarios/:cpf', (req, res) => {
  const { cpf } = req.params;
  const usuario = trataArquivos.arquivoUsuarios.find(usuario => usuario.cpf === parseInt(cpf));

  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado!' });
  }

  res.json(usuario);
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


app.delete('/limpasessoes', async (req, res) => {
  try {
    await bd.excluiSessoesAntigas()
    res.json({ message: `Sessões antigas excluídas` });
  } catch (error) {
    console.log(error)
  }
});

// Rota para atualizar um usuário pelo ID (UPDATE)
app.put('/updatepermissao', async (req, res) => {
  try {
    const { data, sessionId } = req.body;

    // Verifica se a sessão é de permissão máxima
    const permissaoSessao = await bd.obtemPermissaoUsuarioSessao(sessionId)
    console.log(`permissao ${JSON.stringify(permissaoSessao)}`)
    if (permissaoSessao.permissao != 0) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    const privateKey = await bd.obtemPrivateKeyDeSessao(sessionId)
    // Verifica se a sessão é válida
    if (!privateKey) {
      return res.status(400).json({ error: 'Sessão inválida ou expirou.' });
    }

    // Decriptografa os dados de login usando a chave privada da sessão
    const decryptedData = await cripto.descriptografar(data, privateKey);

    // Converte os dados descriptografados de volta para JSON
    const { cpf, nome, email, permissao } = JSON.parse(decryptedData);
    console.log(`server ln 139: ${cpf} ${nome} ${email} ${permissao}`)

    if (permissao == '0')
      return res.status(403).json({ error: 'Não autorizado, permissão máxima não permitida .' });

    await bd.updatePermissao(cpf, nome, email, permissao)

    res.json({ message: `${cpf} ${nome} ${email} ${permissao}` });
  } catch (error) {
    console.log(error)
  }
});

// Rota para excluir um usuário pelo ID (DELETE)
app.delete('/usuario', async (req, res) => {
  const cpf = req.headers['cpf'];
  try {
    await bd.excluiUsuario(cpf)
    let conteudoLista = ''
    // Atualiza lista de usuários
    const usuarios = await bd.obtemUsuarios()
    usuarios.forEach(usuario => {
      let linha = `<option value="${usuario.cpf}">${usuario.nome}</option >`
      conteudoLista += linha

    });
    res.json({ message: `${conteudoLista}` });
  } catch (error) {
    res.json({ error: 'Problema ao excluir usuário, ou usuário já era inexistente!' });
  }

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



// Cria uma nova sessão no banco de dados e retorna o sessionId e a publicKey
app.get('/tokendesessao', async (req, res) => {
  const cpf = req.query.cpf; // Captura o valor do parâmetro "cpf"

  if (!cpf) {
    cpf = '000.000.000-00'
  }
  const sessao = await bd.insereSessao(cpf)
  res.json(sessao)
})

// Verifica se a sessão ainda é válida, inicialmente exclui as expiradas
app.get('/verificaValidadeToken', async (req, res) => {
  const sessionId = req.query.sessionId; // Captura o valor do parâmetro "sessionId"
  const result = await bd.verificaSessaoExiste(sessionId)
  res.json({ sessaoExiste: `${result}` })
})


// Rota para criar um novo usuário (CREATE)
app.post('/usuarios', async (req, res) => {
  try {
    const { data, sessionId } = req.body;

    console.log(sessionId);
    // Recupera a chave privada da sessão a partir do sessionId
    const privateKey = await bd.obtemPrivateKeyDeSessao(sessionId);

    // Verifica se a sessão é válida
    if (!privateKey) {
      return res.status(400).json({ error: 'Sessão inválida ou expirou.' });
    }

    const decryptedData = await cripto.descriptografar(data, privateKey);
    const newUser = JSON.parse(decryptedData);

    // Se o CPF já existir, interrompe a execução
    if (await bd.verificaCpfExiste(newUser.cpf))
      return res.status(409).json({ error: 'Usuário com este CPF já existe!' });


    // Adiciona o novo usuário
    await bd.insereUsuario(newUser);

    return res.status(201).json({ message: 'Usuário criado com sucesso!', usuario: newUser });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro ao criar usuário. Verifique os dados enviados.' });
  }
});

app.post('/sair', async (req, res) => {
  const { sessionId } = req.body;
  try {
    await bd.excluirSessao(sessionId)
    res.send('ok')
  } catch (error) {
    console.log(error)
  }
})



app.post('/pagina', async (req, res) => {
  const { sessionId } = req.body;

  try {
    const privateKey = await bd.obtemPrivateKeyDeSessao(sessionId);

    // Verifica se a sessão é válida
    if (!privateKey) {
      return res.status(400).json({ error: 'Sessão inválida ou expirou.' });
    }

    // Obtém permissões do usuário
    const userData = await bd.obtemPermissaoUsuarioSessao(sessionId);

    if (!userData) {
      return res.status(403).json({ error: "Usuário não encontrado ou sem permissão." });
    }

    // Extrai nome e permissão, garantindo que existem
    const { nome, permissao } = userData;

    console.log(`Usuário ${nome} com permissão ${permissao}`);
    let conteudoPagina
    if (permissao == 0) {
      const usuarios = await bd.obtemUsuarios()
      conteudoPagina = `
          <section id="login-permissao_0">
        <s class="text-indigo-800 leading-none text-left"> O superusuario lista todos os usuários ao fazer login</s><br>
        <s class="text-indigo-800 leading-none text-left"> Selecionar o usuário e obter todas as informações<br>
        O superusuario pode excluir um usuário</s><br>
        <s class="text-indigo-800 leading-none text-left"> O superusuario pode fazer refresh das sessões, excluindo as antigas</s><br>
        O superusuário pode resetar a senha de outro usuário<br>
        <s class="text-indigo-800 leading-none text-left"> O superusuário pode alterar o nível de permissão de outro usuário (nunca ao nível máximo, permitido somente ao
        superusuário)</s> <br>
        <label for="lista-usuarios">Nome dos usuários:</label>
        <select name="lista-usuarios" id="lista-usuarios">

        `
      usuarios.forEach(usuario => {
        let linha = `<option value="${usuario.cpf}">${usuario.nome}</option >`
        conteudoPagina += linha

      });

      conteudoPagina +=
        `
        </select>
        <button id="botao-testes" type="button"
                class="text-indigo-800 p-1  border border-solid border-transparent rounded-md hover:border-indigo-800 hover:bg-cyan-800 hover:text-indigo-100">
                Teste
            </button>
    </section>

    <script>
    const selecionaUsuario = document.getElementById("lista-usuarios")
    selecionaUsuario.addEventListener("change", function () {
    mostrarValor(select.options[selecionaUsuario.selectedIndex].value) 
    console.log("Novo valor selecionado:", this.value);
});
    function mostrarValor(cpf) {
        alert("Valor: " + cpf);
    }
    </script>

      `
    }


    res.set({
      'X-User-Name': nome,
      'X-User-Permission': permissao
    });
    // res.sendFile(path.join(__dirname, `permissao${permissao}.html`));
    res.send(conteudoPagina)
  } catch (error) {
    console.error("Erro no endpoint /pagina:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

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
        await bd.excluirSessao(sessionId)
        console.log(`Senha incorreta!`)
        return res.status(401).json({ error: 'Senha incorreta!' });
      }
    } else {
      await bd.excluirSessao(sessionId)
      console.log(`CPF não cadastrado!`)
      return res.status(404).json({ error: 'CPF não cadastrado!' });
    }


  } catch (error) {
    console.error('Erro ao logar usuário:', error);
    res.status(500).json({ error: 'Erro ao logar usuário. Verifique os dados enviados.' });
  }
});

app.post('/refreshSessao', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (await bd.refreshSessao(sessionId) == 0)
      return res.status(404).json({ error: `sessão expirada` });
    return res.status(200).send(`Refresh da sessão ${sessionId}`);
  } catch (error) {
    console.log(error)
    return res.status(404).json({ error: `${error}` });

  }
})

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


app.get('/testarConexao', async (req, res) => {
  await bd.insereSessao()
  res.json(await bd.obtemSessoes())
})
export default app;


