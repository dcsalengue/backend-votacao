import api from "./api.js";
// Dados entrada recebidos da lista de usuários e dados de saída recebidos da lista de eleitores / candidatos (os dados de entrada devem ser filtrados para não reexibir os dados de saída)
function criarDefinicaoEleitores(tipo, dadosEntrada, dadosSaida) {
  const section = document.createElement("section");
  section.classList.add(
    "relative",
    "w-full",
    "h-screen",
    "bg-indigo-200",
    "flex",
    "flex-col",
    "items-center",
    "p-4"
  );

  const titulo = document.createElement("p");
  titulo.classList.add(
    "bg-white",
    "text-lg",
    "font-bold",
    "text-center",
    "p-4",
    "w-full"
  );
  titulo.textContent =
    tipo === "eleitores"
      ? "Definição de eleitores da eleição"
      : "Definição de candidatos da eleição";

  const containerLista = document.createElement("section");
  containerLista.classList.add(
    "relative",
    "w-full",
    "flex-grow",
    "flex",
    "justify-center",
    "items-center",
    "pb-20"
  ); // Ajusta padding inferior para o botão

  function criarLista(id, itens) {
    const div = document.createElement("div");
    div.classList.add(
      "w-80",
      "h-[calc(100vh-250px)]",
      "bg-indigo-100",
      "p-2",
      "border",
      "overflow-y-auto"
    ); // Ajusta a altura
    div.id = id;

    const ul = document.createElement("ul");
    ul.id = `lista-${id}`;

    if (itens) {
      itens.forEach((item) => {
        const ulInterno = document.createElement("ul");
        const liCpf = document.createElement("li");
        liCpf.textContent = item.cpf;
        const liNome = document.createElement("li");
        liNome.textContent = item.nome;
        ulInterno.classList.add("cursor-pointer", "p-2", "hover:bg-indigo-300");
        ulInterno.addEventListener("click", () =>
          ulInterno.classList.toggle("bg-indigo-400")
        );
        ulInterno.appendChild(liCpf);
        ulInterno.appendChild(liNome);
        ul.appendChild(ulInterno);
      });
    }

    div.appendChild(ul);
    return div;
  }

  const entrada = criarLista("entrada", dadosEntrada);
  entrada.classList.add("border-r", "border-white");

  const saida = criarLista("saida", dadosSaida);
  saida.classList.add("border-l", "border-white");

  const botoes = document.createElement("div");
  botoes.classList.add(
    "absolute",
    "top-1/2",
    "left-1/2",
    "-translate-x-1/2",
    "-translate-y-1/2",
    "flex",
    "flex-col",
    "gap-2",
    "z-10",
    "bg-indigo-200",
    "p-2",
    "rounded-lg",
    "shadow-lg"
  );

  function criarBotao(id, imgPath, moverPara, tudo) {
    const botao = document.createElement("div");
    botao.id = id;
    botao.classList.add(
      "w-10",
      "h-10",
      "bg-no-repeat",
      "bg-cover",
      "bg-center",
      "bg-indigo-200",
      "hover:bg-indigo-100",
      "cursor-pointer",
      "rounded-md"
    );
    botao.style.backgroundImage = `url('${imgPath}')`;

    botao.addEventListener("click", () => {
      const listaOrigem = document.getElementById(
        moverPara === "saida" ? "lista-entrada" : "lista-saida"
      );
      const listaDestino = document.getElementById(
        moverPara === "saida" ? "lista-saida" : "lista-entrada"
      );
      let selecionados = tudo
        ? Array.from(listaOrigem.querySelectorAll("ul"))
        : Array.from(listaOrigem.querySelectorAll("ul.bg-indigo-400"));

      selecionados.forEach((ul) => {
        ul.classList.remove("bg-indigo-400");
        listaDestino.appendChild(ul);
      });
    });

    return botao;
  }

  const botaoDireita = criarBotao(
    "botao-direita",
    "/assets/Arrow-right.svg",
    "saida"
  );
  const botaoEsquerda = criarBotao(
    "botao-esquerda",
    "/assets/Arrow-left.svg",
    "entrada"
  );
  const botaoTudoDireita = criarBotao(
    "botao-tudo-direita",
    "/assets/seta-dupla-direita.png",
    "saida",
    true
  );
  const botaoTudoEsquerda = criarBotao(
    "botao-tudo-esquerda",
    "/assets/seta-dupla-esquerda.png",
    "entrada",
    true
  );

  botoes.appendChild(botaoDireita);
  botoes.appendChild(botaoEsquerda);
  botoes.appendChild(botaoTudoDireita);
  botoes.appendChild(botaoTudoEsquerda);

  const botaoConfirmar = document.createElement("button");
  botaoConfirmar.textContent = `Confirmar inclusão de ${tipo}`;
  botaoConfirmar.classList.add(
    "absolute",
    "bottom-4",
    "left-1/2",
    "-translate-x-1/2",
    "w-3/4",
    "bg-indigo-600",
    "text-white",
    "p-3",
    "text-center",
    "hover:bg-indigo-700",
    "transition",
    "rounded-md"
  );

  botaoConfirmar.addEventListener("click", async () => {
    
    const uls = saida.getElementsByTagName("ul");
    if (!saida) {
      console.error("Elemento 'saida' não encontrado.");
      return;
    }

    const cpfsSet = new Set();
    Array.from(uls).forEach((ul, ulIndex) => {
      const lis = ul.getElementsByTagName("li");
      Array.from(lis).forEach((li, liIndex) => {
        const cpf = li.textContent.trim();
        if (cpf && !cpfsSet.has(cpf)) {
          if (liIndex % 2 === 0) {
            cpfsSet.add(cpf);
          }
          console.log(`UL ${ulIndex} - LI ${liIndex}: ${cpf}`);
        }
      });
    });

    const cpfs = Array.from(cpfsSet);
    console.log(`botaoConfirmar `)
    console.log(`${cpfs} `)
    if(tipo === "eleitores")
        await api.criaEleitores(cpfs);
    else
    await api.criaCandidatos(cpfs);
  });

  containerLista.appendChild(entrada);
  containerLista.appendChild(botoes);
  containerLista.appendChild(saida);

  section.appendChild(titulo);
  section.appendChild(containerLista);
  section.appendChild(botaoConfirmar);
  return section;
}
export default criarDefinicaoEleitores;
