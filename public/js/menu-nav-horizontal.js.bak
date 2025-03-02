import api from "./api.js";


import ui from "./ui.js";



function criarMenuNav(itens, opcoes, dadosEntrada, containerDadosMenu) {
    // Criando o elemento nav
    const nav = document.createElement("nav");
    nav.id = "menuNav"
    nav.classList.add("flex", "space-x-4", "bg-gray-100", "p-4");
    console.log(containerDadosMenu)
    // Criando os itens do menu
    itens.forEach((itemTexto, index) => {
        const item = document.createElement("div");
        item.textContent = itemTexto;
        item.classList.add(
            "cursor-pointer",
            "px-4", "py-2",
            "relative",
            "text-gray-700",
            "hover:text-indigo-600"
        );
        // Desmarca todos para atribuir selecionado somente ao item clicado
        item.removeAttribute("selecionado"); // Remove o atributo "selecionado"
        // Event Listener para marcar o item selecionado
        item.addEventListener("click", () => ui.selecionaItemNav(item, opcoes, containerDadosMenu, dadosEntrada));

        item.classList.add("menu-item"); // Classe para fácil manipulação
        nav.appendChild(item);

        // Marcar o primeiro item por padrão
        if (index === 0) {
            item.classList.add("border-b-2", "border-indigo-600");
            item.click() // Forçar o clique do primeiro item
        }
    });

    return nav;
}

export default criarMenuNav;