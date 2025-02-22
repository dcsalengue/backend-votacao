import htmlPermissao1DadosVotacao from "./html-permissao1-dados-eleicao.js";
import htmlPermissao1CriarEleicao from "./html-permissao1-criar-eleicao.js";
import criarDefinicaoEleitores from "./definirEleitores.js";

function criarMenuNav(itens, opcoes, dadosEntrada, containerDadosMenu) {
    // Criando o elemento nav
    const nav = document.createElement("nav");
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
        
        // Event Listener para marcar o item selecionado
        item.addEventListener("click", () => {
            document.querySelectorAll(".menu-item").forEach(el => el.classList.remove("border-b-2", "border-indigo-600"));
            item.classList.add("border-b-2", "border-indigo-600");

            containerDadosMenu.innerHTML = ''; // Limpa a seção antes de adicionar novos elementos

            // Tomar ação dependendo do item do menu
            if (item.textContent === "Dados") {
                console.log("Dados");
                if (opcoes.length > 0)
                    containerDadosMenu.appendChild(htmlPermissao1DadosVotacao());
                else
                    containerDadosMenu.innerHTML = "Nenhuma eleição cadastrada";
            }
            else if (item.textContent === "Eleitores") {
                console.log("Eleitores");
                containerDadosMenu.appendChild(criarDefinicaoEleitores("candidatos", dadosEntrada));
            }
            else if (item.textContent === "Candidatos") {
                console.log("Candidatos");
            }
            else if (item.textContent === "Resultado") {
                console.log("Resultado");
            }
        });

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