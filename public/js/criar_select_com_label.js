function criarDatalistComLabel(id, labelTexto, opcoes, aoSelecionar, aoCriarNovaOpcao) {
    const container = document.createElement("div");

    // Criar label
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = labelTexto;
    label.classList.add("block", "font-semibold", "mb-1");

    // Criar input
    const input = document.createElement("input");
    input.setAttribute("list", id + "-datalist");
    input.setAttribute("id", id);
    input.setAttribute("name", id);
    input.classList.add("border", "p-2", "rounded", "w-full");

    // Criar datalist
    const datalist = document.createElement("datalist");
    datalist.setAttribute("id", id + "-datalist");

    console.log(opcoes);
    if (!Array.isArray(opcoes)) {
        opcoes = [opcoes]; // Transforma um objeto único em array
    }

    // Criar um mapa para armazenar UUIDs das opções
    const opcoesMap = new Map();

    // Adicionar opções ao datalist
    opcoes.forEach((opcao, index) => {
        const optionElement = document.createElement("option");
        const { uuid, titulo } = opcao;
        console.log(opcao);

        optionElement.value = titulo;
        datalist.appendChild(optionElement);

        // Armazena o UUID associado ao título no mapa
        opcoesMap.set(titulo, uuid);
        // Coloca a primeira opção no input
        if (index == 0) {
            input.value = titulo
            input.setAttribute("uuid", uuid)
        }
    });


    // Adicionar evento "change" para capturar valores selecionados ou digitados
    input.addEventListener("change", () => {
        const inputValue = input.value;
        const uuid = opcoesMap.get(inputValue) || null; // Obtém o UUID da opção se existir
        
        if (!uuid && inputValue.trim() !== "") {
            // Se a opção não existir no datalist, chamar aoCriarNovaOpcao
            aoCriarNovaOpcao(inputValue);
        } else {
            input.setAttribute("uuid", uuid)
            // Se for uma opção existente, chamar aoSelecionar com UUID
            aoSelecionar({ titulo: inputValue, uuid });

        }
    });

    // Adicionar elementos ao container
    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(datalist);

    return container;
}

export default criarDatalistComLabel;