
import api from "./api.js";
// Dados entrada recebidos da lista de usuários e dados de saída recebidos da lista de eleitores / candidatos (os dados de entrada devem ser filtrados para não reexibir os dados de saída)
function criarDefinicaoEleitores(tipo, dadosEntrada, dadosSaida) {
    const section = document.createElement("section");
    section.classList.add("w-full", "h-full", "bg-indigo-200", "flex", "flex-col", "justify-center");

    const containerLista = document.createElement("section");

    containerLista.classList.add("w-auto", "h-auto", "bg-indigo-200", "flex", "justify-center");
    const titulo = document.createElement("p");
    titulo.classList.add("bg-white", "flex", "justify-center", "items-center");


    titulo.textContent = tipo === "eleitores" ? "Definição de eleitores da eleição" : "Definição de candidatos da eleição"
    // Criar a função auxiliar para criar listas
    function criarLista(id, itens) {

        const div = document.createElement("div");
        div.classList.add("w-full", "h-full", "bg-indigo-100", "flex", "justify-center", "p-1", "border");
        div.id = id;

        const ul = document.createElement("ul");
        ul.id = `lista-${id}`;

        itens.forEach(item => {

            const ulInterno = document.createElement("ul");
            const liCpf = document.createElement("li");
            liCpf.textContent = item.cpf
            const liNome = document.createElement("li");
            liNome.textContent = item.nome
            ulInterno.classList.add("cursor-pointer", "p-2", "hover:bg-indigo-300");
            ulInterno.addEventListener("click", () => ulInterno.classList.toggle("bg-indigo-400"));
            ulInterno.appendChild(liCpf);
            ulInterno.appendChild(liNome);
            ul.appendChild(ulInterno);
        });

        div.appendChild(ul);
        return div;
    }

    // Criar listas de entrada e saída
    const entrada = criarLista("entrada", dadosEntrada) //["CPF 1", "CPF 2", "CPF 3"]);
    entrada.classList.add("border-r", "border-white");

    const saida = criarLista("saida", []);
    saida.classList.add("border-l", "border-white");

    // Criar os botões
    const botoes = document.createElement("div");
    botoes.classList.add("w-14", "h-full", "z-10", "bg-indigo-200", "text-center", "flex", "flex-col", "justify-center", "items-center");

    function criarBotao(id, imgPath, moverPara, tudo) {
        const botao = document.createElement("div");
        botao.id = id;
        botao.classList.add("w-10", "h-10", "mt-4", "bg-no-repeat", "bg-cover", "bg-center", "bg-indigo-200", "hover:bg-indigo-100", "cursor-pointer");
        botao.style.backgroundImage = `url('${imgPath}')`;

        botao.addEventListener("click", () => {
            const listaOrigem = document.getElementById(moverPara === "saida" ? "lista-entrada" : "lista-saida");
            const listaDestino = document.getElementById(moverPara === "saida" ? "lista-saida" : "lista-entrada");
            let selecionados
            if (tudo)
                selecionados = Array.from(listaOrigem.querySelectorAll("ul"));
            else
                selecionados = Array.from(listaOrigem.querySelectorAll("ul.bg-indigo-400"));
            selecionados.forEach(ul => {
                ul.classList.remove("bg-indigo-400");
                listaDestino.appendChild(ul);
            });
        });
        return botao;
    }

    const botaoDireita = criarBotao("botao-direita", "/assets/Arrow-right.svg", "saida");
    const botaoEsquerda = criarBotao("botao-esquerda", "/assets/Arrow-left.svg", "entrada");
    const botaoTudoDireita = criarBotao("botao-direita", "/assets/seta-dupla-direita.png", "saida",true);
    const botaoTudoEsquerda = criarBotao("botao-esquerda", "/assets/seta-dupla-esquerda.png", "entrada",true);

    const botaoConfirmar = document.createElement("button");
    botaoConfirmar.textContent = `Confirmar inclusão de ${tipo}`
    botaoConfirmar.classList.add(
        "text-indigo-800",
        "p-1",
        "border",
        "border-solid",
        "border-transparent",
        "rounded-md",
        "hover:border-indigo-800",
        "hover:bg-cyan-800",
        "hover:text-indigo-100")

        botaoConfirmar.addEventListener("click", async () => {
            const uls = saida.getElementsByTagName("ul"); // Retorna uma HTMLCollection
            
            if (!saida) {
                console.error("Elemento 'saida' não encontrado.");
                return;
            }
        
            const cpfsSet = new Set(); // Usamos um Set para evitar CPFs duplicados
        
            // Convertendo HTMLCollection em um array e iterando
            Array.from(uls).forEach((ul, ulIndex) => {
                const lis = ul.getElementsByTagName("li"); // Pegando os <li> dentro de cada <ul>
        
                // Convertendo NodeList em array para usar forEach
                Array.from(lis).forEach((li, liIndex) => {
                    const cpf = li.textContent.trim();
                    if (cpf && !cpfsSet.has(cpf)) { // Verifica se o CPF já foi adicionado
                        if (liIndex % 2 == 0) {
                            cpfsSet.add(cpf);
                        }
                        console.log(`UL ${ulIndex} - LI ${liIndex}: ${cpf}`);
                    }
                });
            });
        
            const cpfs = Array.from(cpfsSet); // Converte o Set para array
        
            await api.criaEleitores(cpfs);
        });
        


    botoes.appendChild(botaoDireita);
    botoes.appendChild(botaoEsquerda);
    botoes.appendChild(botaoTudoDireita);
    botoes.appendChild(botaoTudoEsquerda);
    // Montar a seção

    containerLista.appendChild(entrada);
    containerLista.appendChild(botoes);
    containerLista.appendChild(saida);

    section.appendChild(titulo)
    section.appendChild(containerLista)
    section.appendChild(botaoConfirmar)
    return section;
}
export default criarDefinicaoEleitores;
// Adicionar a seção ao body ou outro container desejado
// document.body.appendChild(criarDefinicaoEleitores());
