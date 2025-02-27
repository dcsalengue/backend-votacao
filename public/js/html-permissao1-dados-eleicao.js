// import api from "./api.js";
// import ui from "./ui.js";
async function htmlPermissao1DadosEleicao(dados) {
    const sessaoDados = document.createElement("section");
    sessaoDados.classList.add("bg-indigo-100", "text-indigo-800", "p-2", "flex", "flex-col");

    const criarElemento = (tituloTexto, conteudoTexto, conteudoId) => {
        const container = document.createElement("div");
        container.classList.add("flex", "items-center", "gap-2");

        const elemento = document.createElement("p");
        const conteudo = document.createElement("span");

        elemento.classList.add("font-semibold");
        conteudo.classList.add("regular");

        elemento.textContent = tituloTexto + ":";
        conteudo.textContent = conteudoTexto || "N/A"; // Se `conteudoTexto` for `null`, usa "N/A"
        conteudo.id = conteudoId;

        container.appendChild(elemento);
        container.appendChild(conteudo);

        return container;
    };

console.log(dados)
    const { titulo, descricao, cnpj, data_inicio, data_fim } = dados[0]

    console.log("Dados recebidos:", dados);
    console.log("Título:", titulo);
    console.log("Descrição:", descricao);
    console.log("CNPJ:", cnpj);
    console.log("Data Início:", data_inicio);
    console.log("Data Fim:", data_fim);


    const elementos = [
        criarElemento("Título", titulo, "titulo-conteudo"),
        criarElemento("Descrição", descricao, "descricao-conteudo"),
        criarElemento("CNPJ", cnpj, "cnpj-conteudo"),
        criarElemento("Data início", data_inicio, "dataInicio-conteudo"),
        criarElemento("Data fim", data_fim, "dataFim-conteudo"),
        criarElemento("Status", "Não iniciado / Em andamento / Finalizado / Cancelado", "status-conteudo"),
    ];

    // Adiciona todos os elementos de uma vez, melhorando a performance
    sessaoDados.append(...elementos);
   
    // const opcoes = await api.listaEleicoes()
    // const dadosEntrada = await api.listacpfs();
    // const containerDadosMenu = document.getElementById('section-dados-menu');
    // const item = document.querySelector(".menu-item[selecionado]");

    // ui.selecionaItemNav(item, opcoes, containerDadosMenu, dadosEntrada)

    return sessaoDados;
}

export default htmlPermissao1DadosEleicao;
