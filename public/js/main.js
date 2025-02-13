import criptografia from "./cripto.js";
import cpf from "./cpf.js";
import api from "./api.js";
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
        // const usuarios = JSON.parse(await api.listarUsuarios())     
        // console.log(usuarios)
        // usuarios.forEach(usuario => {
        //     listaUsuarios.innerHTML += `<li>[${usuario.nome}][${usuario.cpf}][${usuario.usuario}][${usuario.senha}]</li>`
        // }); 
        await toggleOverlay()// Exibe a ampulheta ao carregar a página
        const sessionId = getCookie("sessionId")
        //console.log(document.cookie);
        if (!sessionId)
            return
        const resposta = await api.obtemPaginaDeLogin(sessionId)
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
        await api.sairDaSessao()
        deleteCookie("sessionId");
        location.reload(true);

    } catch (error) {
        console.log(error)
    }
    finally {
        await toggleOverlay() // Depois de fazer o processo de carregamento esconde a ampulheta
    }

});

async function montaDadosUsuario(listaUsuarios) {
    listaUsuarios.addEventListener("change", async () => {
        const cpfSelecionado = listaUsuarios.value;
        const dadosUsuario = await api.buscaDadosUsuario(cpfSelecionado)
        // Requisita ao backend os dados do usuário com o cpf selecionado
        if (dadosUsuario) {

            console.log(`${dadosUsuario.nome}, ${dadosUsuario.email}, ${dadosUsuario.permissao}`);
            const sessaoLoginPermissao0 = document.getElementById("login-permissao_0")
            if (sessaoLoginPermissao0) {
                // Remove todas as divs dentro de `sessaoLoginPermissao0`
                Array.from(sessaoLoginPermissao0.getElementsByTagName("div")).forEach(div => div.remove());
            }
            const divsUsuario = document.createElement('div');

            const cpfUsuario = document.createElement('p');
            cpfUsuario.textContent = `CPF do usuário: ${cpfSelecionado}`

            const nomeUsuario = document.createElement('input');
            nomeUsuario.type = "text";
            nomeUsuario.id = "usuario-nome";
            nomeUsuario.placeholder = 'Nome do usuário'
            nomeUsuario.value = dadosUsuario.nome;


            const emailUsuario = document.createElement('input');
            emailUsuario.type = "email";
            emailUsuario.id = "usuario-email";
            emailUsuario.placeholder = 'Email do usuário'
            emailUsuario.value = dadosUsuario.email;

            // Container do radio select
            const permissaoUsuario = document.createElement('div');

            // Opções para o radio button
            const opcoes = ["Permissão 0", "Permissão 1", "Permissão 2"];


            opcoes.forEach((opcao, index) => {
                // Criar elemento <input> do tipo radio
                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "opcoes"; // Mesmo nome para agrupar os botões
                radio.id = `opcao${index}`;
                radio.value = opcao;

                if (dadosUsuario.permissao == index)
                    radio.checked = true;

                // Criar um <label> associado ao botão
                const label = document.createElement("label");
                label.htmlFor = `opcao${index}`;
                label.textContent = opcao;

                // Adicionar evento ao radio
                radio.addEventListener("change", () => {
                    console.log(`Selecionado: ${radio.value}`);
                });

                // Adicionar elementos ao permissaoUsuario
                permissaoUsuario.appendChild(radio);
                permissaoUsuario.appendChild(label);
                permissaoUsuario.appendChild(document.createElement("br"));
            });
            divsUsuario.appendChild(cpfUsuario)
            divsUsuario.appendChild(document.createElement("br"))
            divsUsuario.appendChild(nomeUsuario)
            divsUsuario.appendChild(emailUsuario)
            divsUsuario.appendChild(permissaoUsuario)

            const botaoUpdate = document.createElement('button');
            botaoUpdate.textContent = "Atualizar"
            botaoUpdate.addEventListener("click", async () => {
                const dadoAlteradoNome = (nomeUsuario.value != dadosUsuario.nome)
                const dadoAlteradoEmail = (emailUsuario.value != dadosUsuario.email)

                let permissaoAlterada = 0; // Inicializa como null
                let dadosAlteradosPermissao = Array.from(permissaoUsuario.getElementsByTagName("input")).some(radio => {
                    if (radio.checked) {
                        permissaoAlterada = radio.value.split(' ')[1]; // Define a permissão alterada
                        return radio.value.split(' ')[1] !== dadosUsuario.permissao;
                    }
                    return false;
                });
                
                dadosAlteradosPermissao = dadosAlteradosPermissao ? 1 : 0;
                
                console.log(`Nome alterado: ${dadoAlteradoNome}, Email alterado: ${dadoAlteradoEmail}, Permissão alterada: ${dadosAlteradosPermissao}`);
                console.log(`Nova permissão selecionada: ${permissaoAlterada}`);
                
                if ((dadoAlteradoNome + dadoAlteradoEmail + dadosAlteradosPermissao))
                    await api.updateUsuarioPermissao(
                        nomeUsuario.value,
                        emailUsuario.value,
                        permissaoAlterada
                    )

            });

            sessaoLoginPermissao0.appendChild(divsUsuario)
            sessaoLoginPermissao0.appendChild(botaoUpdate)
        }
    });

}

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

        //const resposta = await api.obtemPaginaDeLogin(api.sessionId)
        console.log(resposta)
        if (resposta?.pagina) {
            main.innerHTML = resposta.pagina.data


            const listaUsuarios = document.getElementById('lista-usuarios')
            if (listaUsuarios) {
                montaDadosUsuario(listaUsuarios)
            }
            //     //+++
            //     listaUsuarios.addEventListener("change", async () => {
            //         const cpfSelecionado = listaUsuarios.value;
            //         const dadosUsuario = await api.buscaDadosUsuario(cpfSelecionado)
            //         // Requisita ao backend os dados do usuário com o cpf selecionado
            //         if (dadosUsuario) {

            //             console.log(`${dadosUsuario.nome}, ${dadosUsuario.email}, ${dadosUsuario.permissao}`);
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
            //             nomeUsuario.placeholder = 'Nome do usuário'
            //             nomeUsuario.value = dadosUsuario.nome;


            //             const emailUsuario = document.createElement('input');
            //             emailUsuario.type = "text";
            //             emailUsuario.placeholder = 'Email do usuário'
            //             emailUsuario.value = dadosUsuario.email;

            //             const permissaoUsuario = document.createElement('div');

            //             // Opções para o radio button
            //             const opcoes = ["Permissão 0", "Permissão 1", "Permissão 2"];

            //             // Container onde os botões serão inseridos
            //             //  const permissaoUsuario = document.getElementById("radio-permissaoUsuario");

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
            //                 radio.addEventListener("change", () => {
            //                     console.log(`Selecionado: ${radio.value}`);
            //                 });

            //                 // Adicionar elementos ao permissaoUsuario
            //                 permissaoUsuario.appendChild(radio);
            //                 permissaoUsuario.appendChild(label);
            //                 permissaoUsuario.appendChild(document.createElement("br"));
            //             });
            //             divsUsuario.appendChild(nomeUsuario)
            //             divsUsuario.appendChild(emailUsuario)
            //             divsUsuario.appendChild(permissaoUsuario)
            //             sessaoLoginPermissao0.appendChild(divsUsuario)
            //         }
            //     });

            // }
            // //++++
            const btTestesPermissao0 = document.getElementById('botao-testes')
            btTestesPermissao0.addEventListener('click', () => {
                console.log('btTestesPermissao0 clicado')
            })
            console.log(`Nome: ${resposta.pagina.nome}, Permissão: ${resposta.pagina.permissao}`);

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
    } else {
        // Sair da sessão, excluir cookie, excluir sessionId no servidor
        await toggleOverlay() // Depois de fazer o processo de carregamento esconde a ampulheta
        await api.sairDaSessao()
        deleteCookie("sessionId");
        location.reload(true);
    }
})


selecionaUsuario.addEventListener("change", function () {
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
        navCadastroSair.textContent = "Sair"
        navCadastroSair.setAttribute("modo", "sair"); // Atualiza o atributo
    } else if (navCadastroSair.getAttribute("modo") == "sair") {
        await toggleOverlay()
        navCadastroSair.setAttribute("modo", "cadastro");
        navCadastroSair.textContent = "Cadastro"
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