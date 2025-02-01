import criptografia from "./cripto.js";
import cpf from "./cpf.js";
import api from "./api.js";

const cadastroNome = document.getElementById('cadastro__nome');
const cadastroEmail = document.getElementById('cadastro__email');
const cadastroCpf = document.getElementById('cadastro__cpf');
const cadastroSenha = document.getElementById('cadastro__senha');
const repeteSenha = document.getElementById('repete-senha');
const botaCadastrar = document.getElementById('botao-cadastrar');

const loginUsuario = document.getElementById("login__usuario")
const loginCpf = document.getElementById("login__cpf")
const loginSenha = document.getElementById("login-senha")
const botaoLogin = document.getElementById("botao-login")

const listaUsuarios = document.getElementById("lista-usuarios")

repeteSenha.onchange = () => {
    if (cadastroSenha.value === repeteSenha.value) {
        cadastroSenha.style.background = "#7bc27b"
        cadastroSenha.setAttribute("valida", true)
    }
    else {
        cadastroSenha.style.background = "#f14747"
        cadastroSenha.style.color = "white"
        cadastroSenha.setAttribute("valida", false)
    }

}

// Seleciona o campo de CPF e aplica a máscara ao digitar
cadastroCpf.addEventListener('input', cpf.aplicarMascaraCPF);
loginCpf.addEventListener('input', cpf.aplicarMascaraCPF);

// Adiciona validação do formulário para exibir mensagens personalizadas

botaCadastrar.addEventListener('click', async function (event) {
    // Evita o comportamento padrão de recarregar a página
    event.preventDefault();

    const validaSenha = cadastroSenha.getAttribute("valida") === "true";

    // Validações
    if (!cadastroCpf.checkValidity()) {
        alert('Por favor, insira um CPF válido no formato 000.000.000-00.');
        return;
    } else if (!cpf.validarCPF(cadastroCpf.value)) {
        alert('CPF inválido');
        return;
    } else if (!validaSenha) {
        alert('Senhas precisam ser idênticas.');
        return;
    }
    // Validar email no formato texto@texto.texto (deve haver uma string antes e uma depois do @ e deve haver pelo menos 1 ponto

    console.log("CPF válido, senha confirmada");

    try {
        await api.requisitarTokenDeSessao();
        await api.cadastrarUsuario(cadastroNome.value, cadastroEmail.value, cadastroCpf.value, cadastroSenha.value);
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        alert("Erro ao cadastrar usuário. Tente novamente.");
    }
});


// Lista usuários ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const usuarios = JSON.parse(await api.listarUsuarios())     
        console.log(usuarios)
        usuarios.forEach(usuario => {
            listaUsuarios.innerHTML += `<li>[${usuario.nome}][${usuario.cpf}][${usuario.usuario}][${usuario.senha}]</li>`
        });   
    } catch (error) {
     console.log(error)   
    }
    

});
botaoLogin.addEventListener("click", async () => {
    const publicKeyPem = await api.requisitarTokenDeSessao()

    const hashSenha = await criptografia.hash(loginSenha.value)
    const usuario = { cpf: `${loginCpf.value}`, senha: `${hashSenha}` };

    api.loginUsuario(usuario)

    // Requisita token de sessão (get /tokendesessao)
    // Servidor gera um par de chaves pública e privada e coloca em uma lista de sessões ativas
    // Servidor envia a chave pública 
    // Informação digitada de senha é transformada em sha256
    // A informação de login e senha são criptografados com a chave pública
    // Envia hash de login e senha (post /login)
    // Servidor retorna nome de usuário 

});

const btTeste = document.getElementById("botao-testes")
btTeste.addEventListener('click', async () => {
   
    console.log(await api.requisitarTokenDeSessao())
    // await api.requisitarTokenDeSessao()
    // console.log(`${api.publicKeySession} | ${api.sessionId}`)
})


/*
Tabelas:



CREATE TABLE "public"."sessoes" (
  "sessionId" uuid  NOT NULL,
  "privateKey" TEXT UNIQUE NOT NULL,
  "publicKey" TEXT UNIQUE NOT NULL,
  "created_at" TIMESTAMP NOT NULL,
  "modified_at" TIMESTAMP NOT NULL,
)


CREATE TABLE "public"."usuarios" (
  "nome" varchar(80) NOT NULL,
  "email" varchar(80) NOT NULL,
  "cpf" varchar(14) PRIMARY KEY,
  "senha" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL,
  "permissao" INTEGER DEFAULT 0,
  "privateKey" TEXT UNIQUE NOT NULL,
  "publicKey" TEXT UNIQUE NOT NULL,
  "modified_at" TIMESTAMP NOT NULL,
)

*/