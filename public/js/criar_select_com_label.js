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

    // Adicionar opções ao datalist
    opcoes.forEach(opcao => {
        const optionElement = document.createElement("option");
        optionElement.value = opcao.valor;
        optionElement.text = opcao.texto;
        datalist.appendChild(optionElement);
    });

    // Adicionar evento "change" para capturar valores selecionados ou digitados
    input.addEventListener("change", () => {
        const inputValue = input.value;
        const exists = Array.from(datalist.options).some(option => option.value === inputValue);

        if (!exists && inputValue.trim() !== "") {
            // Criar uma nova opção no datalist se não existir
            // const newOption = document.createElement("option");
            // newOption.value = inputValue;
            // datalist.appendChild(newOption);
            // console.log("Nova opção adicionada:", inputValue);
            aoCriarNovaOpcao(inputValue)
        }
        else
            aoSelecionar(inputValue); // Chama a função de callback
    });

    // Adicionar elementos ao container
    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(datalist);

    return container;
}

export default criarDatalistComLabel