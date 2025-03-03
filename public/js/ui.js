import api from "./api.js";

import htmlPermissao1DadosVotacao from "./html-permissao1-dados-eleicao.js";
import htmlPermissao1CriarEleicao from "./html-permissao1-criar-eleicao.js";
import criarDefinicaoEleitores from "./definirEleitores.js";
// Colocar aqui as funções que comunicam com o DOM html

const ui = {
  montaListaDeUsuarios(usuarios) {
    const listaUsuarios = document.getElementById("lista-usuarios");
    usuarios.forEach((usuario) => {
      listaUsuarios.innerHTML += `<li>[${usuario.nome}][${usuario.cpf}][${usuario.usuario}][${usuario.senha}]</li>`;
    });
  },

  async selecionaItemNav(item, opcoes, containerDadosMenu, dadosEntrada) {
    document
      .querySelectorAll(".menu-item")
      .forEach((el) => el.classList.remove("border-b-2", "border-indigo-600"));
    item.classList.add("border-b-2", "border-indigo-600");
    item.setAttribute("selecionado", true);
    containerDadosMenu.innerHTML = ""; // Limpa a seção antes de adicionar novos elementos
    const uuidEleicao = document
      .getElementById("lista-eleicoes")
      .getAttribute("uuid");

    // Tomar ação dependendo do item do menu
    if (item.textContent === "Dados") {
      console.log("Dados");
      if (opcoes.length > 0) {
        const dadosEleicao = await api.dadoseleicoes(uuidEleicao);
        console.log(`${dadosEleicao} ${uuidEleicao}`);

        const htmlDados = await htmlPermissao1DadosVotacao(dadosEleicao);
        // Isso aqui precisa melhorar, não precisa pedir novamente os dados
        containerDadosMenu.appendChild(htmlDados);
      } else containerDadosMenu.innerHTML = "Nenhuma eleição cadastrada";
    } else if (item.textContent === "Eleitores") {
      console.log("Eleitores");
      const dadosSaida = await api.listaEleitores();
      let dadosFiltrados;
      if (dadosSaida) {
        // Criar um conjunto (Set) para rápida verificação de CPFs já existentes
        const cpfsExistentes = new Set(
          dadosSaida.map((eleitor) => eleitor.cpf)
        );

        // Filtrar os dados de entrada, removendo CPFs que já estão em dadosSaida
        dadosFiltrados = dadosEntrada.filter(
          (usuario) => !cpfsExistentes.has(usuario.cpf)
        );
      } else {
        dadosFiltrados = dadosEntrada;
      }

      containerDadosMenu.appendChild(
        criarDefinicaoEleitores("eleitores", dadosFiltrados, dadosSaida)
      );
    } else if (item.textContent === "Candidatos") {
      console.log("Candidatos");
      dadosEntrada = await api.listaEleitores();
      const dadosSaida = await api.listaCandidatos();

      let dadosFiltrados;
      if (dadosSaida) {
        // Criar um conjunto (Set) para rápida verificação de CPFs já existentes
        const cpfsExistentes = new Set(
          dadosSaida.map((candidato) => candidato.cpf)
        );

        // Filtrar os dados de entrada, removendo CPFs que já estão em dadosSaida
        dadosFiltrados = dadosEntrada.filter(
          (usuario) => !cpfsExistentes.has(usuario.cpf)
        );
      } else {
        dadosFiltrados = dadosEntrada;
      }
      containerDadosMenu.appendChild(
        criarDefinicaoEleitores("candidatos", dadosFiltrados, dadosSaida)
      );
    } else if (item.textContent === "Resultado") {
      console.log("Resultado");
    }
  },

  async montaDadosUsuario(listaUsuarios) {
    listaUsuarios.addEventListener("input", async () => {
      const cpfSelecionado = listaUsuarios.value;
      const dadosUsuario = await api.buscaDadosUsuario(cpfSelecionado);
      // Requisita ao backend os dados do usuário com o cpf selecionado
      if (dadosUsuario) {
        console.log(
          `montaDadosUsuario: ${dadosUsuario.nome}, ${dadosUsuario.email}, ${dadosUsuario.permissao}`
        );
        const sessaoLoginPermissao0 =
          document.getElementById("login-permissao_0");
        if (sessaoLoginPermissao0) {
          // Remove todas as divs dentro de `sessaoLoginPermissao0`
          Array.from(sessaoLoginPermissao0.getElementsByTagName("div")).forEach(
            (div) => div.remove()
          );
        }
        const divsUsuario = document.createElement("div");

        const cpfUsuario = document.createElement("p");
        cpfUsuario.textContent = `CPF do usuário: ${cpfSelecionado}`;

        const nomeUsuario = document.createElement("input");
        nomeUsuario.type = "text";
        nomeUsuario.id = "usuario-nome";
        nomeUsuario.placeholder = "Nome do usuário";
        nomeUsuario.value = dadosUsuario.nome;
        nomeUsuario.addEventListener("input", () => {
          exibeBotaoAtualizar(nomeUsuario, emailUsuario, dadosUsuario);
        });

        const emailUsuario = document.createElement("input");
        emailUsuario.type = "email";
        emailUsuario.id = "usuario-email";
        emailUsuario.placeholder = "Email do usuário";
        emailUsuario.value = dadosUsuario.email;
        emailUsuario.addEventListener("input", () => {
          exibeBotaoAtualizar(nomeUsuario, emailUsuario, dadosUsuario);
        });
        // Container do radio select
        const permissaoUsuario = document.createElement("div");
        permissaoUsuario.id = "radio-permissao-usuario";

        // Opções para o radio button
        const opcoes = ["Permissão 0", "Permissão 1", "Permissão 2"];

        opcoes.forEach((opcao, index) => {
          // Criar elemento <input> do tipo radio
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = "opcoes"; // Mesmo nome para agrupar os botões
          radio.id = `opcao${index}`;
          radio.value = opcao;

          if (dadosUsuario.permissao == index) radio.checked = true;

          // Criar um <label> associado ao botão
          const label = document.createElement("label");
          label.htmlFor = `opcao${index}`;
          label.textContent = opcao;

          // Adicionar evento ao radio
          radio.addEventListener("input", () => {
            console.log(`Selecionado: ${radio.value}`);
            // exibeBotaoAtualizar(nomeUsuario, emailUsuario, radio.value.split(' ')[1], dadosUsuario)
            exibeBotaoAtualizar(nomeUsuario, emailUsuario, dadosUsuario);
          });

          // Adicionar elementos ao permissaoUsuario
          permissaoUsuario.appendChild(radio);
          permissaoUsuario.appendChild(label);
          permissaoUsuario.appendChild(document.createElement("br"));
        });
        divsUsuario.appendChild(cpfUsuario);
        divsUsuario.appendChild(document.createElement("br"));
        divsUsuario.appendChild(nomeUsuario);
        divsUsuario.appendChild(emailUsuario);
        divsUsuario.appendChild(permissaoUsuario);

        const divBotoes = document.createElement("div");

        // Botão excluir usuário
        const botaoResetSenha = document.createElement("button");
        botaoResetSenha.textContent = "Reset senha (1234)";
        botaoResetSenha.classList.add(
          "text-indigo-800",
          "p-1",
          "border",
          "border-solid",
          "border-transparent",
          "rounded-md",
          "hover:border-indigo-800",
          "hover:bg-cyan-800",
          "hover:text-indigo-100"
        );
        botaoResetSenha.addEventListener("click", async () => {
          console.log(await api.resetSenha(cpfSelecionado));
        });

        // Botão excluir usuário
        const botaoExcluiUsuario = document.createElement("button");
        botaoExcluiUsuario.textContent = "Exclui usuário";
        botaoExcluiUsuario.classList.add(
          "text-indigo-800",
          "p-1",
          "border",
          "border-solid",
          "border-transparent",
          "rounded-md",
          "hover:border-indigo-800",
          "hover:bg-cyan-800",
          "hover:text-indigo-100"
        );
        botaoExcluiUsuario.addEventListener("click", async () => {
          const dadosListaUsuarios = await api.excluiUsuario(cpfSelecionado);
          listaUsuarios.innerHTML = "";
          listaUsuarios.innerHTML = dadosListaUsuarios.message;
          const sessaoLoginPermissao0 =
            document.getElementById("login-permissao_0");
          if (sessaoLoginPermissao0) {
            // Remove todas as divs dentro de `sessaoLoginPermissao0`
            Array.from(
              sessaoLoginPermissao0.getElementsByTagName("div")
            ).forEach((div) => div.remove());
          }
        });

        // Botão Limpeza de sessões
        const botaoLimpaSessoesAntigas = document.createElement("button");
        botaoLimpaSessoesAntigas.textContent = "Limpar Sessões";
        botaoLimpaSessoesAntigas.classList.add(
          "text-indigo-800",
          "p-1",
          "border",
          "border-solid",
          "border-transparent",
          "rounded-md",
          "hover:border-indigo-800",
          "hover:bg-cyan-800",
          "hover:text-indigo-100"
        );
        botaoLimpaSessoesAntigas.addEventListener("click", async () => {
          console.log(await api.excluiSessoesAntigas());
        });

        // Botão de atualizar dados e permissão de usuários
        const botaoUpdate = document.createElement("button");
        botaoUpdate.textContent = "Atualizar";
        botaoUpdate.id = "botao-update";
        botaoUpdate.classList.add(
          "text-indigo-800",
          "p-1",
          "border",
          "border-solid",
          "border-transparent",
          "rounded-md",
          "hover:border-indigo-800",
          "hover:bg-cyan-800",
          "hover:text-indigo-100",
          "hidden"
        );

        botaoUpdate.addEventListener("click", async () => {
          await api.updateUsuarioPermissao(
            cpfSelecionado,
            nomeUsuario.value,
            emailUsuario.value,
            permissaoAlterada
          );
        });

        // // Usar para testes no código
        // const botaoTestes = document.createElement('button');
        // botaoTestes.textContent = "Gera usuários (arquivo)"
        // botaoTestes.classList.add(
        //     "text-indigo-800",
        //     "p-1",
        //     "border", "border-solid", "border-transparent",
        //     "rounded-md",
        //     "hover:border-indigo-800",
        //     "hover:bg-cyan-800",
        //     "hover:text-indigo-100"
        // );
        // botaoTestes.addEventListener("click", async () => {
        // });

        divBotoes.appendChild(botaoUpdate);
        divBotoes.appendChild(botaoLimpaSessoesAntigas);
        divBotoes.appendChild(botaoExcluiUsuario);
        divBotoes.appendChild(botaoResetSenha);

        sessaoLoginPermissao0.appendChild(divsUsuario);
        sessaoLoginPermissao0.appendChild(divBotoes);
      }
    });
  },
};
export default ui;
