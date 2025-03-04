// Colocar aqui as funções de comunicação com o backend
import criptografia from "./cripto.js";
import cpf from "./cpf.js";
// import axios from "axios";

const URL_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : `https://${window.location.hostname}`; // Substitua pelo seu domínio real

console.log(URL_BASE);
// let sessionId = null
// let publicKeySession = null
class Api {
  constructor() {
    this.sessionId = null; // ID de sessão gerado
    this.publicKeySession = null; // Chave pública recebida do servidor
    this.uuidEleicao = null; // ID da eleição selecionada
    this.cpfEleitoresAtual = [];
    this.cpfCandidatosdAtual = [];
  }
  // sessionId ,       // Id de sessão enviado pelo servidor
  // publicKeySession,// Chave pública relacionada a sessionId
  async listarUsuarios() {
    try {
      const response = await axios.get(`${URL_BASE}/usuarios`, {
        withCredentials: true, // Permite enviar e receber cookies de terceiros
      });
      return await response.data;
    } catch (error) {
      alert(`Erro ao listar usuários \r\n${error}`);
      throw error;
    }
  }

  async cadastrarUsuario(nome, email, cpf, senha) {
    // Transforma senha em um hash RSA256
    const hashSenha = await criptografia.hash(senha);
    let jsonCadastro = {
      nome: `${nome}`,
      email: `${email}`,
      cpf: `${cpf}`,
      senha: `${hashSenha}`,
    };
    // Criptografando os dados
    const encryptedData = await criptografia.encryptUserData(
      this.publicKeySession,
      jsonCadastro
    );
    let resposta;
    try {
      const response = await axios.post(`${URL_BASE}/usuarios`, {
        data: encryptedData,
        sessionId: this.sessionId,
      });
      resposta = await response.data.message;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          resposta = "Já existe uma conta cadastrada com este CPF.";
        } else {
          resposta = error.response.data;
        }
      } else {
        resposta = "Erro inesperado ao tentar cadastrar.";
      }
    } finally {
      console.log(resposta);
      return resposta;
    }
  }

  async sairDaSessao() {
    let resposta;
    try {
      const response = await axios.post(`${URL_BASE}/sair`, {
        sessionId: this.sessionId,
      });
      resposta = await response.data;
    } catch (error) {
      if (error.response) {
        // Captura a resposta do servidor em caso de erro (status 400, 500, etc.)
        resposta = error.response.data.error;
      } else {
        // Captura erro inesperado (ex: falha de rede)
        resposta = "Erro inesperado ao tentar excluir sessão.";
      }
      console.error("Erro ao excluir sessão:", resposta.error);
    } finally {
      console.log(resposta);
      return resposta;
    }
  }

  async refreshSessao() {
    try {
      const response = await axios.post(`${URL_BASE}/refreshSessao`, {
        sessionId: this.sessionId,
      });
      resposta = await response.data;
    } catch (error) {
      if (error.response) {
        // Captura a resposta do servidor em caso de erro (status 400, 500, etc.)
        resposta = error.response.data.error;
      } else {
        // Captura erro inesperado (ex: falha de rede)
        resposta = "Erro inesperado ao tentar refreshSessao.";
      }
      console.error("Erro no refreshSessao:", resposta.error);
    } finally {
      console.log(resposta);
      return resposta;
    }
  }

  async loginUsuario(loginUsuario) {
    let resposta;
    let pagina = null;
    const loginEncriptado = await criptografia.encryptUserData(
      this.publicKeySession,
      loginUsuario
    );
    try {
      const response = await axios.post(`${URL_BASE}/login`, {
        data: loginEncriptado,
        sessionId: this.sessionId,
      });
      resposta = await response.data;
      if (response.status === 200) {
        // Cookie para manter sessão viva
        const data = new Date();
        data.setTime(data.getTime() + 1 * 60 * 60 * 1000); // 1 hora (60 minutos * 60 segundos * 1000 ms)
        const expires = "expires=" + data.toUTCString();
        document.cookie = `sessionId=${this.sessionId};${expires};path=/`;
        pagina = await this.obtemPaginaDeLogin(this.sessionId);
      }
    } catch (error) {
      if (error.response) {
        // Captura a resposta do servidor em caso de erro (status 400, 500, etc.)
        resposta = error.response.data.error;
      } else {
        // Captura erro inesperado (ex: falha de rede)
        resposta = "Erro inesperado ao tentar logar.";
      }
      console.error("Erro no login:", resposta.error);
    } finally {
      console.log(`${resposta}`);
      console.log(`${pagina.nome} ${pagina.permissao}`);
      return { resposta, pagina };
    }
  }

  // async obtemPaginaDeLogin(sessionId) {
  //     try {
  //         const response = await axios.post(`${URL_BASE}/pagina`, {
  //             sessionId: sessionId
  //         });

  //         // Obtendo os dados do corpo da resposta (body)
  //         return (response.data);

  //     } catch (error) {
  //         alert(`Erro ao requisitar token de sessão \r\n${error}`);
  //         throw error;
  //     }
  // }

  async obtemPaginaDeLogin(sessionId) {
    try {
      const response = await axios.post(`${URL_BASE}/pagina`, {
        sessionId: sessionId,
      });
      console.log(sessionId);
      this.sessionId = sessionId;
      // Obtendo os dados do corpo da resposta (body)
      const data = response.data;

      // Obtendo os cabeçalhos da resposta
      const nome = response.headers["x-user-name"];
      const permissao = response.headers["x-user-permission"];

      console.log(`Nome: ${nome}, Permissão: ${permissao}`);

      return { data, nome, permissao };
    } catch (error) {
      alert(`Erro ao requisitar token de sessão \r\n${error}`);
      throw error;
    }
  }

  async buscaDadosUsuario(cpf) {
    try {
      console.log(`buscaDadosUsuario: ${cpf} `);
      const response = await axios.get(`${URL_BASE}/usuario`, {
        headers: {
          cpf: `${cpf}`,
          "session-id": `${this.sessionId}`,
        },
      });
      //({ publicKey: this.publicKeySession, sessionId: this.sessionId } = response.data);

      // Obtendo os dados do corpo da resposta (body)
      return response.data;
    } catch (error) {
      alert(`Erro ao requisitar token de sessão \r\n${error}`);
      throw error;
    }
  }

  async requisitarTokenDeSessao(cpf) {
    try {
      const response = await axios.get(`${URL_BASE}/tokendesessao?cpf=${cpf}`, {
        withCredentials: true, // Isso garante que os cookies e cabeçalhos personalizados sejam enviados
      });
      ({ publicKey: this.publicKeySession, sessionId: this.sessionId } =
        response.data);

      // Obtendo os dados do corpo da resposta (body)
      return `sessionId: ${this.sessionId} | publicKey: ${this.publicKeySession} `;
    } catch (error) {
      alert(`Erro ao requisitar token de sessão \r\n${error}`);
      throw error;
    }
  }

  async verificaValidadeTokenDeSessao() {
    try {
      // console.log(`verificaValidadeTokenDeSessao(${this.sessionId})`)
      if (!this.sessionId) return;
      const response = await axios.get(
        `${URL_BASE}/verificaValidadeToken?sessionId=${this.sessionId}`,
        {
          withCredentials: true, // Isso garante que os cookies e cabeçalhos personalizados sejam enviados
        }
      );
      console.log(response.data);
      if (response.data.sessaoExiste == "false") this.sessionId = null;
      // Obtendo os dados do corpo da resposta (body)
      return response.data.sessaoExiste;
    } catch (error) {
      alert(`Erro ao requisitar token de sessão \r\n${error}`);
      throw error;
    }
  }

  async testecriasessao() {
    try {
      const response = await axios.get(`${URL_BASE}/testecriasessao`, {
        withCredentials: true, // Isso garante que os cookies e cabeÃ§alhos personalizados sejam enviados
      });
      ({ publicKey: this.publicKeySession, sessionId: this.sessionId } =
        response.data);

      // Obtendo os dados do corpo da resposta (body)
      return `sessionId: ${this.sessionId} | publicKey: ${this.publicKeySession} `;
    } catch (error) {
      alert(`Erro ao requisitar token de sessÃ£o \r\n${error}`);
      throw error;
    }
  }

  async testeobtemsessoes() {
    try {
      const response = await axios.get(`${URL_BASE}/testeobtemsessoes`, {
        withCredentials: true, // Isso garante que os cookies e cabeÃ§alhos personalizados sejam enviados
      });
      console.log(response.data);
      // Obtendo os dados do corpo da resposta (body)
      return response.data;
    } catch (error) {
      alert(`Erro ao requisitar token de sessÃ£o \r\n${error}`);
      throw error;
    }
  }

  async testarConexao() {
    try {
      const response = await axios.get(`${URL_BASE}/testarConexao`);
      console.log(response.data);
      // Obtendo os dados do corpo da resposta (body)
      return response.data;
    } catch (error) {
      alert(`Erro ao requisitar token de sessÃ£o \r\n${error}`);
      throw error;
    }
  }

  async excluiSessoesAntigas() {
    try {
      const response = await axios.delete(`${URL_BASE}/limpasessoes`);
      console.log(response.data);
      // Obtendo os dados do corpo da resposta (body)
      return response.data;
    } catch (error) {
      alert(`Erro ao excluir sessões antigas \r\n${error}`);
      throw error;
    }
  }

  async excluiUsuario(cpf) {
    try {
      const response = await axios.delete(`${URL_BASE}/usuario`, {
        headers: {
          cpf: `${cpf}`,
        },
      });
      console.log(response.data);
      // Obtendo os dados do corpo da resposta (body)
      // depois de excluir monta a página novamente, sem o usuário na lista
      return response.data;
    } catch (error) {
      alert(`Erro ao excluir o usuário \r\n${error}`);
      throw error;
    }
  }
  async resetSenha(cpf) {
    try {
      const response = await axios.put(
        `${URL_BASE}/resetsenha`,
        {}, // Corpo da requisição vazio (caso necessário)
        {
          headers: {
            cpf: `${cpf}`,
          },
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      alert(`Erro ao inicializar a senha do usuário \r\n${error}`);
      throw error;
    }
  }

  async updateUsuarioPermissao(cpf, nome, email, permissao) {
    console.log(`nome: ${nome} email: ${email} permissao: ${permissao}`);
    let jsonCadastro = {
      cpf: `${cpf}`,
      nome: `${nome}`,
      email: `${email}`,
      permissao: `${permissao}`,
    };

    console.log(`${cpf} ${permissao}`);
    // Criptografando os dados
    const encryptedData = await criptografia.encryptUserData(
      this.publicKeySession,
      jsonCadastro
    );
    let resposta;
    try {
      const response = await axios.put(`${URL_BASE}/updatepermissao`, {
        data: encryptedData,
        sessionId: this.sessionId,
      });
      resposta = await response.data.message;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          resposta = "Já existe uma conta cadastrada com este CPF.";
        } else if (status === 403) {
          resposta =
            "Somente o su pode alterar a prermissão dos usuários e a permissão máxima não é permitida.";
        } else {
          resposta = error.response.data;
        }
      } else {
        resposta = "Erro inesperado ao tentar cadastrar.";
      }
    } finally {
      console.log(resposta);
      return resposta;
    }
  }

  async listaEleicoes() {
    // Enviar sessão, retornar somente as eleições relacionadas com o usuário, ou todas se for permissão 0
    try {
      const response = await axios.get(`${URL_BASE}/eleicoes`, {
        sessionId: this.sessionId,
      });
      console.log(response.data);
      // Obtendo os dados do corpo da resposta (body)
      return response.data;
    } catch (error) {
      alert(`Erro ao requisitar token de sessÃ£o \r\n${error}`);
      throw error;
    }
  }

  async dadoseleicoes(uuid) {
    // Enviar sessão, retornar somente as eleições relacionadas com o usuário, ou todas se for permissão 0
    try {
      const response = await axios.get(`${URL_BASE}/dadoseleicoes`, {
        headers: {
          "session-id": `${this.sessionId}`,
          uuid: `${uuid}`,
        },
      });
      this.uuidEleicao = uuid;
      console.log(response.data);
      // Obtendo os dados do corpo da resposta (body)
      return response.data;
    } catch (error) {
      alert(`Erro ao requisitar token de sessÃ£o \r\n${error}`);
      throw error;
    }
  }

  async dadosEleicao(uuidEleicao) {
    // criptografar sessão, uuid, retornar somente se uuid da eleição tiver relação com o usuário (através da sessão) , ou qualquer eleição válida para permissão 0
    try {
      const response = await axios.get(`${URL_BASE}/eleicao`);

      console.log(response.data);
      // Obtendo os dados do corpo da resposta (body)
      return response.data;
    } catch (error) {
      alert(`Erro ao requisitar token de sessÃ£o \r\n${error}`);
      throw error;
    }
  }

  async criarEleicao(dados) {
    const encryptedData = await criptografia.encryptUserData(
      this.publicKeySession,
      dados
    );
    let resposta;
    try {
      const response = await axios.put(`${URL_BASE}/eleicao`, {
        data: encryptedData,
        sessionId: this.sessionId,
      });
      resposta = await response.data.message;
    } catch (error) {
      alert(`Erro ao requisitar token de sessÃ£o \r\n${error}`);
      throw error;
    }
  }

  async listacpfs() {
    try {
      console.log("lista CPFs");
      const response = await axios.get(`${URL_BASE}/listacpfs`, {
        headers: {
          "session-id": `${this.sessionId}`,
        },
      });
      console.log(response.data);
      // Obtendo os dados do corpo da resposta (body)
      return response.data;
    } catch (error) {
      alert(`Erro ao requisitar token de sesssão \r\n${error}`);
      throw error;
    }
  }

  async criaEleitores(cpfs) {
    try {
      // Lista ignorar (se os cpfs já estiverem presentes no bd)
      // Lista excluir (se os cpfs estiverem presentes no bd mas não na lista)
      // Lista incluir (o resto da lista retirando os ignorados)

      const cpfsBd = [...this.cpfEleitoresAtual];

      console.log(`criaEleitores`);
      console.log(`lista cpfs: ${cpfs}`);
      console.log(`bd cpfs: ${cpfsBd}`);
      let cpfsIncluir;
      let cpfsExcluir;
      
      // Lista de cpfs no banco de dados
      if (cpfsBd) {
        cpfsIncluir = cpfs.filter((cpf) => !cpfsBd.includes(cpf));
      } else {
        cpfsIncluir = cpfs;
      }

      if (cpfsBd) {
        cpfsExcluir = cpfsBd.filter((cpf) => !cpfs.includes(cpf));
      } else {
        cpfsExcluir = [];
      }

      console.log(`cpfsIncluir: ${cpfsIncluir}`);
      console.log(`cpfsExcluir: ${cpfsExcluir}`);

      for (const cpf of cpfsIncluir) {
        let jsonEleitor = {
          cpfs: JSON.stringify([cpf]), // Enviando apenas um CPF por vez
          id_eleicao: `${this.uuidEleicao}`,
        };

        // Criptografando os dados
        const encryptedData = await criptografia.encryptUserData(
          this.publicKeySession,
          jsonEleitor
        );

        console.log(`Enviando CPF: ${cpf}`);
        console.log(`${encryptedData}`);

        // Enviar a requisição para cada CPF individualmente
        const response = await axios.post(`${URL_BASE}/eleitores`, {
          data: encryptedData,
          sessionId: this.sessionId,
        });

        console.log(`Resposta para ${cpf}:`, response.data.message);
      }

      for (const cpf of cpfsExcluir) {
        let jsonEleitor = {
          cpfs: JSON.stringify([cpf]), // Enviando apenas um CPF por vez
          id_eleicao: `${this.uuidEleicao}`,
        };

        // Criptografando os dados
        const encryptedData = await criptografia.encryptUserData(
          this.publicKeySession,
          jsonEleitor
        );

        console.log(`Enviando CPF: ${cpf}`);
        console.log(`${encryptedData}`);

        // Enviar a requisição para cada CPF individualmente
        const response = await axios.delete(`${URL_BASE}/eleitores`, {
          headers: { sessionid: this.sessionId },
          data: { data: encryptedData }, // ✅ O dado deve ir no `data`
        });

        console.log(`Resposta para ${cpf}:`, response.data.message);
      }
      return "Todos os eleitores foram processados com sucesso.";
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
    }
  }

  async listaEleitores() {
    try {
      const response = await axios.get(`${URL_BASE}/eleitores`, {
        headers: {
          "session-id": `${this.sessionId}`,
          "uuid-eleicao": `${this.uuidEleicao}`,
        },
      });

      // Obtendo os dados do corpo da resposta (body)
      if (response.data) {
        // Criar um conjunto (Set) para rápida verificação de CPFs já existentes
        this.cpfEleitoresAtual = new Set(
          response.data.map((eleitor) => eleitor.cpf)
        );
        console.log(this.cpfEleitoresAtual);
      }
      // Obtendo os dados do corpo da resposta (body)
      return response.data;
    } catch (error) {
      alert(`Erro ao requisitar eleitores \r\n${error}`);
      throw error;
    }
  }

  async criaCandidatos(cpfs) {
    try {
      console.log(`criaCandidatos`);
      console.log(`${this.publicKeySession}`);
      console.log(`${cpfs}`);

      for (const cpf of cpfs) {
        let jsonEleitor = {
          cpfs: JSON.stringify([cpf]), // Enviando apenas um CPF por vez
          id_eleicao: `${this.uuidEleicao}`,
        };

        // Criptografando os dados
        const encryptedData = await criptografia.encryptUserData(
          this.publicKeySession,
          jsonEleitor
        );

        console.log(`Enviando CPF: ${cpf}`);
        console.log(`${encryptedData}`);

        // Enviar a requisição para cada CPF individualmente
        const response = await axios.post(`${URL_BASE}/candidatos`, {
          data: encryptedData,
          sessionId: this.sessionId,
        });

        console.log(`Resposta para ${cpf}:`, response.data.message);
      }

      return "Todos os candidatos foram processados com sucesso.";
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
    }
  }
  async listaCandidatos() {
    try {
      const response = await axios.get(`${URL_BASE}/candidatos`, {
        headers: {
          "session-id": `${this.sessionId}`,
          "uuid-eleicao": `${this.uuidEleicao}`,
        },
      });

      console.log(response.data);
      // Obtendo os dados do corpo da resposta (body)
      if (response.data) {
        // Criar um conjunto (Set) para rápida verificação de CPFs já existentes
        this.cpfCandidatosdAtual = new Set(
          response.data.map((candidato) => candidato.cpf)
        );
      }
      return response.data;
    } catch (error) {
      alert(`Erro ao requisitar candidatos \r\n${error}`);
      throw error;
    }
  }

  geraUsuarios(conteudoArquivo) {
    const linhas = conteudoArquivo.split("\r\n");
    linhas.forEach(async (linha) => {
      const [novoCpf, nome, email, senha] = linha.split("|");
      if (cpf.validarCPF(novoCpf)) {
        console.log(`(${novoCpf})(${nome})(${email})(${senha})`);
        await this.cadastrarUsuario(nome, email, novoCpf, senha);
      } else console.log(`(${novoCpf}) não foi cadastrado, formato inválido`);
    });
    // console.log(conteudoArquivo)
    // console.log(bufferArquivo)
  }
}
// Exporta uma instância da API para uso
const api = new Api();
export default api;
