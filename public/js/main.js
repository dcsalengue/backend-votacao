import criptografia from "./cripto.js";
import cpf from "./cpf.js";
import api from "./api.js";
import ui from "./ui.js"

import htmlPermissao1DadosVotacao from "./html-permissao1-dados-eleicao.js";
import htmlPermissao1CriarEleicao from "./html-permissao1-criar-eleicao.js";
import criarDefinicaoEleitores from "./definirEleitores.js";
import criarMenuNav from "./menu-nav-horizontal.js";
import criarSelectComLabel from "./criar_select_com_label.js"


const overlay = document.getElementById('overlay');
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
const divTituloHeader = document.getElementById("header-titulo")
const sectionCadastro = document.getElementById("section-cadastro")
const sectionLogin = document.getElementById("section-login")
const selecionaUsuario = document.getElementById("lista-usuarios")

function setOverlay() {
    if (!overlay.classList.contains("hidden")) {
        overlay.classList.add("hidden")
    }
}

function clearOverlay() {

    if (overlay.classList.contains("hidden")) {
        overlay.classList.remove("hidden")
    }
}

async function toggleOverlay() {
    if (overlay.classList.contains("hidden")) {
        overlay.classList.remove("hidden")
    } else {
        overlay.classList.add("hidden")
    }

}

function getCookie(nome) {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        let [chave, valor] = cookies[i].split('=');
        if (chave === nome) return valor;
    }
    return null; // Retorna null se o cookie não existir
}

const validaSenhaCadastro = () => {

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
repeteSenha.oninput = () => validaSenhaCadastro()
cadastroSenha.oninput = () => validaSenhaCadastro()

// Seleciona o campo de CPF e aplica a máscara ao digitar
cadastroCpf.addEventListener('input', cpf.aplicarMascaraCPF);
loginCpf.addEventListener('input', cpf.aplicarMascaraCPF);
cadastroCpf.addEventListener('change', cpf.aplicarMascaraCPF);
loginCpf.addEventListener('change', cpf.aplicarMascaraCPF);

const exibeBotaoAtualizar = (nomeUsuario, emailUsuario, dadosUsuario) => {

    let exibirBotao = 0
    const permissaoUsuario = document.getElementById("radio-permissao-usuario")

    let dadosAlteradosPermissao = false
    dadosAlteradosPermissao = Array.from(permissaoUsuario.getElementsByTagName("input")).some(radio => {
        if (radio.checked) {
            return radio.value.split(' ')[1] != dadosUsuario.permissao;
        }
        return false;
    });

    exibirBotao += (nomeUsuario.value != dadosUsuario.nome)
    exibirBotao += (emailUsuario.value != dadosUsuario.email)
    exibirBotao += (dadosAlteradosPermissao ? 1 : 0)

    const botaoUpdate = document.getElementById("botao-update")
    if (exibirBotao)
        botaoUpdate.classList.remove("hidden")
    else
        botaoUpdate.classList.add("hidden")

    console.log(exibirBotao)

}

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
        await toggleOverlay()
        await api.requisitarTokenDeSessao();
        //await api.cadastrarUsuario(cadastroNome.value, cadastroEmail.value, cadastroCpf.value, cadastroSenha.value);
        footer.innerHTML = `${await api.cadastrarUsuario(cadastroNome.value, cadastroEmail.value, cadastroCpf.value, cadastroSenha.value)}`
        await modificaBotaoSessao()
        await api.sairDaSessao()
        deleteCookie("sessionId");
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        alert("Não foi possível conectar ao servidor.");
    }

    finally {
        await toggleOverlay() // Depois de fazer o processo de carregamento esconde a ampulheta
    }

});


// Lista usuários ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Teste do select com input
        // const opcoes = [
        //     { valor: "Chrome" },
        //     { valor: "Firefox" },
        //     { valor: "Internet Explorer" },
        //     { valor: "Opera" },
        //     { valor: "Safari" }
        // ];


        // const selectEleicao = criarSelectComLabel("lista-eleicoes", "Selecione uma eleição:", opcoes, aoSelecionar, aoCriarNovaOpcao)
        //     divTituloHeader.appendChild(selectEleicao);

        await toggleOverlay()// Exibe a ampulheta ao carregar a página
        const sessionId = getCookie("sessionId")
        //console.log(document.cookie);
        if (!sessionId)
            return
        const resposta = await api.obtemPaginaDeLogin(sessionId)
        console.log(`Permissão: ${resposta.permissao}`);
        main.innerHTML = resposta.data
        // Executar scripts manualmente
        main.querySelectorAll('script').forEach(script => {
            const novoScript = document.createElement('script');
            if (script.src) {
                novoScript.src = script.src; // Para scripts externos
                novoScript.async = true;
            } else {
                novoScript.textContent = script.textContent; // Para scripts inline
            }
            document.body.appendChild(novoScript); // Executa o script
        });
        console.log(`Nome: ${resposta.nome}, Permissão: ${resposta.permissao}`);
        await modificaBotaoSessao()
        //await api.sairDaSessao()
        deleteCookie("sessionId");
        location.reload(true);

    } catch (error) {
        console.log(error)
    }
    finally {
        await toggleOverlay() // Depois de fazer o processo de carregamento esconde a ampulheta
    }

});

// async function montaDadosUsuario(listaUsuarios) {
//     listaUsuarios.addEventListener("input", async () => {
//         const cpfSelecionado = listaUsuarios.value;
//         const dadosUsuario = await api.buscaDadosUsuario(cpfSelecionado)
//         // Requisita ao backend os dados do usuário com o cpf selecionado
//         if (dadosUsuario) {

//             console.log(`montaDadosUsuario: ${dadosUsuario.nome}, ${dadosUsuario.email}, ${dadosUsuario.permissao}`);
//             const sessaoLoginPermissao0 = document.getElementById("login-permissao_0")
//             if (sessaoLoginPermissao0) {
//                 // Remove todas as divs dentro de `sessaoLoginPermissao0`
//                 Array.from(sessaoLoginPermissao0.getElementsByTagName("div")).forEach(div => div.remove());
//             }
//             const divsUsuario = document.createElement('div');

//             const cpfUsuario = document.createElement('p');
//             cpfUsuario.textContent = `CPF do usuário: ${cpfSelecionado}`

//             const nomeUsuario = document.createElement('input');
//             nomeUsuario.type = "text";
//             nomeUsuario.id = "usuario-nome";
//             nomeUsuario.placeholder = 'Nome do usuário'
//             nomeUsuario.value = dadosUsuario.nome;
//             nomeUsuario.addEventListener("input", () => {
//                 exibeBotaoAtualizar(nomeUsuario, emailUsuario, dadosUsuario)

//             });

//             const emailUsuario = document.createElement('input');
//             emailUsuario.type = "email";
//             emailUsuario.id = "usuario-email";
//             emailUsuario.placeholder = 'Email do usuário'
//             emailUsuario.value = dadosUsuario.email;
//             emailUsuario.addEventListener("input", () => {
//                 exibeBotaoAtualizar(nomeUsuario, emailUsuario, dadosUsuario)

//             });
//             // Container do radio select
//             const permissaoUsuario = document.createElement('div');
//             permissaoUsuario.id = "radio-permissao-usuario"

//             // Opções para o radio button
//             const opcoes = ["Permissão 0", "Permissão 1", "Permissão 2"];


//             opcoes.forEach((opcao, index) => {
//                 // Criar elemento <input> do tipo radio
//                 const radio = document.createElement("input");
//                 radio.type = "radio";
//                 radio.name = "opcoes"; // Mesmo nome para agrupar os botões
//                 radio.id = `opcao${index}`;
//                 radio.value = opcao;

//                 if (dadosUsuario.permissao == index)
//                     radio.checked = true;

//                 // Criar um <label> associado ao botão
//                 const label = document.createElement("label");
//                 label.htmlFor = `opcao${index}`;
//                 label.textContent = opcao;

//                 // Adicionar evento ao radio
//                 radio.addEventListener("input", () => {
//                     console.log(`Selecionado: ${radio.value}`);
//                     // exibeBotaoAtualizar(nomeUsuario, emailUsuario, radio.value.split(' ')[1], dadosUsuario)
//                     exibeBotaoAtualizar(nomeUsuario, emailUsuario, dadosUsuario)

//                 });

//                 // Adicionar elementos ao permissaoUsuario
//                 permissaoUsuario.appendChild(radio);
//                 permissaoUsuario.appendChild(label);
//                 permissaoUsuario.appendChild(document.createElement("br"));
//             });
//             divsUsuario.appendChild(cpfUsuario)
//             divsUsuario.appendChild(document.createElement("br"))
//             divsUsuario.appendChild(nomeUsuario)
//             divsUsuario.appendChild(emailUsuario)
//             divsUsuario.appendChild(permissaoUsuario)

//             const divBotoes = document.createElement("div");

//             // Botão excluir usuário
//             const botaoResetSenha = document.createElement('button');
//             botaoResetSenha.textContent = "Reset senha (1234)"
//             botaoResetSenha.classList.add(
//                 "text-indigo-800",
//                 "p-1",
//                 "border", "border-solid", "border-transparent",
//                 "rounded-md",
//                 "hover:border-indigo-800",
//                 "hover:bg-cyan-800",
//                 "hover:text-indigo-100"
//             );
//             botaoResetSenha.addEventListener("click", async () => {
//                 console.log(await api.resetSenha(cpfSelecionado))
//             });

//             // Botão excluir usuário
//             const botaoExcluiUsuario = document.createElement('button');
//             botaoExcluiUsuario.textContent = "Exclui usuário"
//             botaoExcluiUsuario.classList.add(
//                 "text-indigo-800",
//                 "p-1",
//                 "border", "border-solid", "border-transparent",
//                 "rounded-md",
//                 "hover:border-indigo-800",
//                 "hover:bg-cyan-800",
//                 "hover:text-indigo-100"
//             );
//             botaoExcluiUsuario.addEventListener("click", async () => {
//                 const dadosListaUsuarios = await api.excluiUsuario(cpfSelecionado)
//                 listaUsuarios.innerHTML = ""
//                 listaUsuarios.innerHTML = dadosListaUsuarios.message
//                 const sessaoLoginPermissao0 = document.getElementById("login-permissao_0")
//                 if (sessaoLoginPermissao0) {
//                     // Remove todas as divs dentro de `sessaoLoginPermissao0`
//                     Array.from(sessaoLoginPermissao0.getElementsByTagName("div")).forEach(div => div.remove());
//                 }
//             });

//             // Botão Limpeza de sessões
//             const botaoLimpaSessoesAntigas = document.createElement('button');
//             botaoLimpaSessoesAntigas.textContent = "Limpar Sessões"
//             botaoLimpaSessoesAntigas.classList.add(
//                 "text-indigo-800",
//                 "p-1",
//                 "border", "border-solid", "border-transparent",
//                 "rounded-md",
//                 "hover:border-indigo-800",
//                 "hover:bg-cyan-800",
//                 "hover:text-indigo-100"
//             );
//             botaoLimpaSessoesAntigas.addEventListener("click", async () => {
//                 console.log(await api.excluiSessoesAntigas())
//             });



//             // Botão de atualizar dados e permissão de usuários
//             const botaoUpdate = document.createElement('button');
//             botaoUpdate.textContent = "Atualizar"
//             botaoUpdate.id = "botao-update"
//             botaoUpdate.classList.add(
//                 "text-indigo-800",
//                 "p-1",
//                 "border", "border-solid", "border-transparent",
//                 "rounded-md",
//                 "hover:border-indigo-800",
//                 "hover:bg-cyan-800",
//                 "hover:text-indigo-100",
//                 "hidden"
//             );



//             botaoUpdate.addEventListener("click", async () => {
//                 await api.updateUsuarioPermissao(
//                     cpfSelecionado,
//                     nomeUsuario.value,
//                     emailUsuario.value,
//                     permissaoAlterada
//                 )

//             });



//             // // Usar para testes no código
//             // const botaoTestes = document.createElement('button');
//             // botaoTestes.textContent = "Gera usuários (arquivo)"
//             // botaoTestes.classList.add(
//             //     "text-indigo-800",
//             //     "p-1",
//             //     "border", "border-solid", "border-transparent",
//             //     "rounded-md",
//             //     "hover:border-indigo-800",
//             //     "hover:bg-cyan-800",
//             //     "hover:text-indigo-100"
//             // );
//             // botaoTestes.addEventListener("click", async () => {
//             // });




//             divBotoes.appendChild(botaoUpdate)
//             divBotoes.appendChild(botaoLimpaSessoesAntigas)
//             divBotoes.appendChild(botaoExcluiUsuario)
//             divBotoes.appendChild(botaoResetSenha)

//             sessaoLoginPermissao0.appendChild(divsUsuario)
//             sessaoLoginPermissao0.appendChild(divBotoes)

//         }
//     });

// }



const aoSelecionarEleicao = async ({ titulo, uuid }) => {
    console.log(`Selecionado: ${titulo} ${uuid}`);
    try {
        const dadosEleicao = await api.dadoseleicoes(uuid)
        console.log(dadosEleicao)
        const htmlDados = await htmlPermissao1DadosVotacao(dadosEleicao)
        // Isso aqui precisa melhorar, não precisa pedir novamente os dados
        const sectionDadosMenu = document.getElementById('section-dados-menu')
        sectionDadosMenu.innerHTML = ``
        sectionDadosMenu.appendChild(htmlDados);
    } catch (error) {
        console.log(error)
    }
};

const aoCriarNovaEleicao = (valor) => {
    console.log("Criar nova:", valor);
    main.innerHTML = ``
    main.appendChild(htmlPermissao1CriarEleicao(valor))
};







botaoLogin.addEventListener("click", async () => {

    // Validações
    if (!loginCpf.checkValidity()) {
        alert('Por favor, insira um CPF válido no formato 000.000.000-00.');
        return;
    } else if (!cpf.validarCPF(loginCpf.value)) {
        alert('CPF inválido');
        return;
    }
    try {

        await toggleOverlay()
        const publicKeyPem = await api.requisitarTokenDeSessao(loginCpf.value)

        const hashSenha = await criptografia.hash(loginSenha.value)
        const usuario = { cpf: `${loginCpf.value}`, senha: `${hashSenha}` };

        const resposta = await api.loginUsuario(usuario)

        // Mostra mensagem de login
        footer.innerHTML = `${resposta.resposta}`

        console.log(resposta.permissao)
        if (resposta?.pagina) {
            const permissao = resposta.pagina.permissao
            main.innerHTML = resposta.pagina.data

            const opcoes = await api.listaEleicoes()

            console.log(opcoes)
            console.log(permissao)
            divTituloHeader.innerHTML = ''
            const selectEleicao = criarSelectComLabel("lista-eleicoes", "Selecione uma eleição:", opcoes, aoSelecionarEleicao, aoCriarNovaEleicao)
            divTituloHeader.appendChild(selectEleicao);  //Lista de eleições (já deveria estar com o primeiro dado selecionado, ou o último, recuperado através de cookie)
            if (permissao == 0) {
                const listaUsuarios = document.getElementById('lista-usuarios')
                if (listaUsuarios) {
                    await ui.montaDadosUsuario(listaUsuarios)
                    // Para ler o arquivo local com usuários
                    const inputFile = document.createElement('input');
                    inputFile.type = "file"
                    inputFile.id = "fileInput"
                    footer.appendChild(inputFile)
                    document.getElementById('fileInput').addEventListener('change', function (event) {
                        const file = event.target.files[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = function (e) {
                            api.geraUsuarios(e.target.result);
                        };
                        reader.readAsText(file); // Lê como texto
                    });
                }
            }
            const dadosEntrada = await api.listacpfs();

            // Criando a seção para os dados do menu
            const containerDadosMenu = document.createElement("section");
            containerDadosMenu.classList.add("w-full", "flex-1", "flex", "flex-col", "jutify-center", "items-center", "text-center");
            containerDadosMenu.textContent = "Hello";
            containerDadosMenu.id = 'section-dados-menu';

            // Criando a navegação do menu
            const menuNav = criarMenuNav(["Dados", "Eleitores", "Candidatos", "Resultado"], opcoes, dadosEntrada, containerDadosMenu);



            // Adicionando os elementos na ordem correta
            main.appendChild(menuNav);          // Primeiro, adiciona o menu
            main.appendChild(containerDadosMenu); // Depois, adiciona o conteúdo abaixo do menu
            // document.createElement("select")

            // opcoes = null
            // if (permissao <= 1) {
            //     main.appendChild(criarMenuNav(["Dados", "Eleitores", "Candidatos", "Resultado"]));
            //     if (opcoes)
            //         main.appendChild(htmlPermissao1DadosVotacao());
            //     else
            //         main.innerHTML = "Nenhuma eleição cadastrada"
            // }

            // if (permissao <= 2) {
            //     const dadosEntrada = await api.listacpfs()
            //     // main.appendChild(htmlPermissao1CriarEleicao());
            //     main.appendChild(criarDefinicaoEleitores("candidatos", dadosEntrada));
            // }
        }

    } catch (error) {
        console.log(error)
        await api.sairDaSessao()
        await modificaBotaoSessao()
        deleteCookie("sessionId");


    } finally {
        await modificaBotaoSessao()
        await toggleOverlay() // Depois de fazer o processo de carregamento esconde a ampulheta
    }

});


const btTeste = document.getElementById("botao-testes")
btTeste.addEventListener('click', async () => {
    console.log("btTeste")
    exibeBotaoAtualizar()
    // console.log(await api.verificaValidadeTokenDeSessao())
    // await api.requisitarTokenDeSessao()
    // console.log(`${api.publicKeySession} | ${api.sessionId}`)
})
function deleteCookie(nome) {
    document.cookie = nome + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function excluiClassesBg() {
    navCadastroSair.classList.forEach(className => {
        if (className.startsWith("bg-[")) {
            navCadastroSair.classList.remove(className);
        }
    });
}

navCadastroSair.addEventListener("click", async () => {
    let modo = navCadastroSair.getAttribute("modo");
    console.log(navCadastroSair.textContent.trim())
    if (modo == "cadastro") {
        navCadastroSair.setAttribute("modo", "login"); // Atualiza o atributo
        sectionCadastro.style.display = "flex"
        sectionLogin.style.display = "none"
        excluiClassesBg()
        navCadastroSair.classList.add('bg-[url(/assets/icone-login.png)]')
        // navCadastroSair.textContent = "Login"
        divTituloHeader.textContent = "Cadastro"
    } else if (modo == "login") {
        navCadastroSair.setAttribute("modo", "cadastro"); // Atualiza o atributo
        sectionCadastro.style.display = "none"
        sectionLogin.style.display = "flex"
        excluiClassesBg()
        navCadastroSair.classList.add('bg-[url(/assets/icone-cadastrar.png)]')
        // navCadastroSair.textContent = "Cadastro"
        divTituloHeader.textContent = "Login"
    } else {
        // Sair da sessão, excluir cookie, excluir sessionId no servidor
        await toggleOverlay() // Depois de fazer o processo de carregamento esconde a ampulheta
        await api.sairDaSessao()
        deleteCookie("sessionId");
        location.reload(true);
    }
})


selecionaUsuario.addEventListener("input", function () {
    mostrarValor(select.options[selecionaUsuario.selectedIndex].value)
    console.log("Novo valor selecionado:", this.value);
});

function mostrarValor(cpf) {
    alert(`Valor: ${cpf}`);
}

const modificaBotaoSessao = async () => {
    // console.log(api.sessionId)
    const sessaoValida = await api.verificaValidadeTokenDeSessao()
    if (sessaoValida) {
        excluiClassesBg()
        navCadastroSair.classList.add('bg-[url(/assets/icone-logout.png)]')
        // navCadastroSair.textContent = "Sair"
        navCadastroSair.setAttribute("modo", "sair"); // Atualiza o atributo
    } else if (navCadastroSair.getAttribute("modo") == "sair") {
        await toggleOverlay()
        navCadastroSair.setAttribute("modo", "cadastro");
        excluiClassesBg()
        navCadastroSair.classList.add('bg-[url(/assets/icone-cadastrar.png)]')
        // navCadastroSair.textContent = "Cadastro"
        sectionLogin.style.display = "flex"
        deleteCookie("sessionId");
        location.reload(true);
    }

    // console.log(`sessaoValida: ${sessaoValida}`)
    timerVerificaValidadeToken()
}

const timerVerificaValidadeToken = async () => {
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
  53991756892
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