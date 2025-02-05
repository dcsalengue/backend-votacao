// Colocar aqui as funções de comunicação com o backend
import criptografia from "./cripto.js";

const URL_BASE =
    window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : `https://${window.location.hostname}` // Substitua pelo seu domínio real

console.log(URL_BASE)
// let sessionId = null
// let publicKeySession = null
class Api {
    constructor() {
        this.sessionId = null;       // ID de sessão gerado
        this.publicKeySession = null; // Chave pública recebida do servidor
    }
    // sessionId ,       // Id de sessão enviado pelo servidor
    // publicKeySession,// Chave pública relacionada a sessionId
    async listarUsuarios() {
        try {
            const response = await axios.get(`${URL_BASE}/usuarios`, {
                withCredentials: true,  // Permite enviar e receber cookies de terceiros
            });
            return await response.data
        } catch (error) {
            alert(`Erro ao listar usuários \r\n${error}`);
            throw error;
        }
    }

    async cadastrarUsuario(nome, email, cpf, senha) {
        // Transforma senha em um hash RSA256
        const hashSenha = await criptografia.hash(senha)
        let jsonCadastro =
        {
            "nome": `${nome}`,
            "email": `${email}`,
            "cpf": `${cpf}`,
            "senha": `${hashSenha}`
        }
        // Criptografando os dados
        const encryptedData = await criptografia.encryptUserData(this.publicKeySession, jsonCadastro);
        let resposta
        try {
            const response = await axios.post(`${URL_BASE}/usuarios`, {
                data: encryptedData,
                sessionId: this.sessionId
            });
            resposta = await response.data.message
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 409) {
                    resposta = 'Já existe uma conta cadastrada com este CPF.' ;
                } else {
                    resposta = error.response.data;
                }
            } else {
                resposta =  'Erro inesperado ao tentar cadastrar.' ;
            }
        }
        finally {
            console.log(resposta)
            return resposta
        }
    }

    async loginUsuario(loginUsuario) {
        let resposta
        const loginEncriptado = await criptografia.encryptUserData(this.publicKeySession, loginUsuario);
        try {
            const response = await axios.post(`${URL_BASE}/login`, {
                data: loginEncriptado,
                sessionId: this.sessionId
            });
            resposta = await response.data

        } catch (error) {
            if (error.response) {
                // Captura a resposta do servidor em caso de erro (status 400, 500, etc.)
                resposta = error.response.data.error;
            } else {
                // Captura erro inesperado (ex: falha de rede)
                resposta = 'Erro inesperado ao tentar logar.';
            }
            console.error("Erro no login:", resposta.error);
        }
        finally {
            console.log(resposta)
            return resposta
        }
    }

    async requisitarTokenDeSessao() {
        try {
            const response = await axios.get(`${URL_BASE}/tokendesessao`, {
                withCredentials: true,  // Isso garante que os cookies e cabeçalhos personalizados sejam enviados
            });
            ({ publicKey: this.publicKeySession, sessionId: this.sessionId } = response.data);

            // Obtendo os dados do corpo da resposta (body)
            return (`sessionId: ${this.sessionId} | publicKey: ${this.publicKeySession} `);

        } catch (error) {
            alert(`Erro ao requisitar token de sessão \r\n${error}`);
            throw error;
        }
    }


    async testecriasessao() {
        try {
            const response = await axios.get(`${URL_BASE}/testecriasessao`, {
                withCredentials: true,  // Isso garante que os cookies e cabeÃ§alhos personalizados sejam enviados
            });
            ({ publicKey: this.publicKeySession, sessionId: this.sessionId } = response.data);

            // Obtendo os dados do corpo da resposta (body)
            return (`sessionId: ${this.sessionId} | publicKey: ${this.publicKeySession} `);

        } catch (error) {
            alert(`Erro ao requisitar token de sessÃ£o \r\n${error}`);
            throw error;
        }
    }

    async testeobtemsessoes() {
        try {
            const response = await axios.get(`${URL_BASE}/testeobtemsessoes`, {
                withCredentials: true,  // Isso garante que os cookies e cabeÃ§alhos personalizados sejam enviados
            });
            console.log(response.data)
            // Obtendo os dados do corpo da resposta (body)
            return (response.data);

        } catch (error) {
            alert(`Erro ao requisitar token de sessÃ£o \r\n${error}`);
            throw error;
        }
    }

    async testarConexao() {
        try {
            const response = await axios.get(`${URL_BASE}/testarConexao`);
            console.log(response.data)
            // Obtendo os dados do corpo da resposta (body)
            return (response.data);

        } catch (error) {
            alert(`Erro ao requisitar token de sessÃ£o \r\n${error}`);
            throw error;
        }
    }
}
// Exporta uma instância da API para uso
const api = new Api();
export default api;