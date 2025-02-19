function htmlPermissao1DadosEleicao() {
    
    const sessaoDados = document.createElement("section");
    sessaoDados.classList.add("bg-indigo-100", "text-indigo-800", "p-2", "flex" , "flex-col" );
    
    const criarElemento = (tituloTexto, conteudoTexto, conteudoId) => {
        const elemento = document.createElement("p");
        const conteudo = document.createElement("span");

        elemento.classList.add("font-semibold");
        conteudo.classList.add("regular", "ml-2");

        elemento.textContent = tituloTexto;
        conteudo.textContent = conteudoTexto;
        conteudo.id = conteudoId;

        return { elemento, conteudo };
    };

    const { elemento: titulo, conteudo: tituloConteudo } = criarElemento("Título", "Eleição para diretor", "titulo-conteudo");
    const { elemento: descricao, conteudo: descricaoConteudo } = criarElemento("Descrição", "Escolha do diretor da escola a ocorrer no dia 17/02/2025", "descricao-conteudo");
    const { elemento: cnpj, conteudo: cnpjConteudo } = criarElemento("CNPJ", "12.345.678/0001-99", "cnpj-conteudo");
    const { elemento: dataInicio, conteudo: dataInicioConteudo } = criarElemento("Data início", "17/02/2025 às 08:00", "dataInicio-conteudo");
    const { elemento: dataFim, conteudo: dataFimConteudo } = criarElemento("Data fim", "18/02/2025 às 18:00", "dataFim-conteudo");
    const { elemento: status, conteudo: statusConteudo } = criarElemento("Status", "Não iniciado / Em andamento / Finalizado / Cancelado", "status-conteudo");

    

    sessaoDados.appendChild(titulo);
    sessaoDados.appendChild(tituloConteudo);
    sessaoDados.appendChild(descricao);
    sessaoDados.appendChild(descricaoConteudo);
    sessaoDados.appendChild(cnpj);
    sessaoDados.appendChild(cnpjConteudo);
    sessaoDados.appendChild(dataInicio);
    sessaoDados.appendChild(dataInicioConteudo);
    sessaoDados.appendChild(dataFim);
    sessaoDados.appendChild(dataFimConteudo);
    sessaoDados.appendChild(status);
    sessaoDados.appendChild(statusConteudo);

    return sessaoDados;
}

export default htmlPermissao1DadosEleicao;
