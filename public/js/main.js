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

const footer = document.getElementById("footer")
const body = document.getElementById("body")
const main = document.getElementById("main")
const navCadastroSair = document.getElementById("nav-cadastro-sair")

const sectionCadastro = document.getElementById("section-cadastro")
const sectionLogin = document.getElementById("section-login")

function getCookie(nome) {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        let [chave, valor] = cookies[i].split('=');
        if (chave === nome) return valor;
    }
    return null; // Retorna null se o cookie não existir
}


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

    try {
        await api.requisitarTokenDeSessao();
        //await api.cadastrarUsuario(cadastroNome.value, cadastroEmail.value, cadastroCpf.value, cadastroSenha.value);

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        alert("Não foi possível conectar ao servidor.");
    }

    footer.innerHTML = `${await api.cadastrarUsuario(cadastroNome.value, cadastroEmail.value, cadastroCpf.value, cadastroSenha.value)}`

});


// Lista usuários ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // const usuarios = JSON.parse(await api.listarUsuarios())     
        // console.log(usuarios)
        // usuarios.forEach(usuario => {
        //     listaUsuarios.innerHTML += `<li>[${usuario.nome}][${usuario.cpf}][${usuario.usuario}][${usuario.senha}]</li>`
        // }); 
        const sessionId = getCookie("sessionId")
        console.log(document.cookie);
        if(!sessionId)
            return
        const resposta = await api.obtemPaginaDeLogin(sessionId)
        main.innerHTML = resposta.data
        console.log(`Nome: ${resposta.nome}, Permissão: ${resposta.permissao}`);
    } catch (error) {
        console.log(error)
    }


});
botaoLogin.addEventListener("click", async () => {

    // Validações
    if (!loginCpf.checkValidity()) {
        alert('Por favor, insira um CPF válido no formato 000.000.000-00.');
        return;
    } else if (!cpf.validarCPF(loginCpf.value)) {
        alert('CPF inválido');
        return;
    }

    const publicKeyPem = await api.requisitarTokenDeSessao(loginCpf.value)

    const hashSenha = await criptografia.hash(loginSenha.value)
    const usuario = { cpf: `${loginCpf.value}`, senha: `${hashSenha}` };

    // Mostra mensagem de login
    footer.innerHTML = `${await api.loginUsuario(usuario)}`

    const resposta = await api.obtemPaginaDeLogin(api.sessionId)
    console.log(resposta)
    main.innerHTML = resposta.data
    console.log(`Nome: ${resposta.nome}, Permissão: ${resposta.permissao}`);


});



const btTeste = document.getElementById("botao-testes")
btTeste.addEventListener('click', async () => {
    console.log("btTeste")
    console.log(await api.verificaValidadeTokenDeSessao())
    // await api.requisitarTokenDeSessao()
    // console.log(`${api.publicKeySession} | ${api.sessionId}`)
})
function deleteCookie(nome) {
    document.cookie = nome + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
navCadastroSair.addEventListener("click", async () => {
    let modo = navCadastroSair.getAttribute("modo");
    console.log(navCadastroSair.textContent.trim())
    if (modo == "cadastro") {
        navCadastroSair.setAttribute("modo", "login"); // Atualiza o atributo
        sectionCadastro.style.display = "flex"
        sectionLogin.style.display = "none"
        navCadastroSair.textContent = "Login"
    } else if (modo == "login") {
        navCadastroSair.setAttribute("modo", "cadastro"); // Atualiza o atributo
        sectionCadastro.style.display = "none"
        sectionLogin.style.display = "flex"
        navCadastroSair.textContent = "Cadastro"
    }else {
        // Sair da sessão, excluir cookie, excluir sessionId no servidor
        await api.sairDaSessao()
        deleteCookie("sessionId");
        location.reload(true);
        //await modificaBotaoSessao()
    }
})

const modificaBotaoSessao = async () => {
    console.log(api.sessionId)
    const sessaoValida = await api.verificaValidadeTokenDeSessao()
    if (sessaoValida) {
        navCadastroSair.textContent = "Sair"
        navCadastroSair.setAttribute("modo", "sair"); // Atualiza o atributo
    } else if ( navCadastroSair.getAttribute("modo") == "sair" ) {
        navCadastroSair.setAttribute("modo", "cadastro"); 
        navCadastroSair.textContent = "Cadastro"
        sectionLogin.style.display = "flex"
        deleteCookie("sessionId");
        location.reload(true);
    }

    console.log(`sessaoValida: ${sessaoValida}`)
    timerVerificaValidadeToken()
}

const timerVerificaValidadeToken = () => {
    setTimeout(modificaBotaoSessao, 5000)
}
timerVerificaValidadeToken()
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