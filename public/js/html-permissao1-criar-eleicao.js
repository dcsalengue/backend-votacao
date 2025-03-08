import api from "./api.js";

function htmlPermissao1CriarEleicao(tituloPadrao) {
  const sessaoCriarEleicao = document.createElement("section");
  sessaoCriarEleicao.classList.add(
    "bg-indigo-100",
    "text-indigo-800",
    "p-2",
    "flex",
    "flex-col"
  );

  const criarElemento = (titulo, placeholder, inputId, inputTipo) => {
    const label = document.createElement("label");
    const input = document.createElement("input");

    label.textContent = titulo;
    input.setAttribute("type", inputTipo);
    input.setAttribute("id", inputId);
    input.setAttribute("name", inputId);
    input.placeholder = placeholder;

    input.classList.add("border", "p-2", "rounded", "regular");
    label.classList.add("font-semibold");
    label.setAttribute("for", inputId);

    if (input.id == "titulo-eleicao") input.value = tituloPadrao;
    return { label, input };
  };

  // Criando os campos do formulário
  const { label: titulo, input: tituloConteudo } = criarElemento(
    "Título",
    "Digite o título da eleição",
    "titulo-eleicao",
    "text"
  );
  const { label: descricao, input: descricaoConteudo } = criarElemento(
    "Descrição",
    "Descreva a eleição",
    "descricao-eleicao",
    "text"
  );
  const { label: cnpj, input: cnpjConteudo } = criarElemento(
    "CNPJ",
    "CNPJ da eleição",
    "cnpj-eleicao",
    "text"
  );
  const { label: dataInicio, input: dataInicioConteudo } = criarElemento(
    "Data início",
    "Data e hora de início",
    "dataInicio-eleicao",
    "datetime-local"
  );
  const { label: dataFim, input: dataFimConteudo } = criarElemento(
    "Data fim",
    "Data e hora de fim",
    "dataFim-eleicao",
    "datetime-local"
  );

  // Função para aplicar a máscara de CNPJ
  function formatarCNPJ(valor) {
    return valor
      .replace(/\D/g, "") // Remove tudo que não for número
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18); // Limita a 18 caracteres (14 números + 4 separadores)
  }

  // Aplicando a máscara ao digitar
  cnpjConteudo.addEventListener("input", (event) => {
    event.target.value = formatarCNPJ(event.target.value);
  });

  // Função para validar se o CNPJ é real
  function validarCNPJ(cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (cnpjLimpo.length !== 14) return false; // CNPJ deve ter 14 dígitos

    // Impede CNPJs inválidos como "00000000000000"
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false;

    let tamanho = 12;
    let numeros = cnpjLimpo.substring(0, tamanho);
    let digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = 13;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  }

  // Criando botão de envio
  const botaoCriarEleicao = document.createElement("button");
  botaoCriarEleicao.classList.add(
    "text-indigo-800",
    "p-1",
    "m-2",
    "border",
    "border-solid",
    "border-transparent",
    "rounded-md",
    "hover:border-indigo-800",
    "hover:bg-cyan-800",
    "hover:text-indigo-100"
  );
  botaoCriarEleicao.textContent = "Criar Eleição";

  // Evento de clique no botão
  botaoCriarEleicao.addEventListener("click", async () => {
    if (!validarCNPJ(cnpjConteudo.value)) {
      alert(
        "CNPJ inválido! Digite um CNPJ válido no formato: XX.XXX.XXX/XXXX-XX"
      );
      return;
    }

    const dadosEleicao = {
      titulo: tituloConteudo.value,
      descricao: descricaoConteudo.value,
      cnpj: cnpjConteudo.value,
      dataInicio: new Date(dataInicioConteudo.value).toISOString(),
      dataFim: new Date(dataFimConteudo.value).toISOString(),
    };

    const resumo = `
        Confirma a criação da eleição com os seguintes dados? Depois de criada, não poderá ser editado, somente excluído.

        🗳️ Título: ${dadosEleicao.titulo}
        📝 Descrição: ${dadosEleicao.descricao}
        🏢 CNPJ: ${dadosEleicao.cnpj}
        📅 Início: ${dadosEleicao.dataInicio}
        ⏳ Fim: ${dadosEleicao.dataFim}
        `;

    // Exibe o alerta de confirmação antes de enviar os dados
    if (confirm(resumo)) {
      try {
        const resposta = await api.criarEleicao(dadosEleicao);
        alert("Eleição criada com sucesso!");
        console.log("Resposta do servidor:", resposta);
        const data = new Date();
        window.location.reload;
      } catch (erro) {
        alert("Erro ao criar eleição. Tente novamente.");
        console.error("Erro:", erro);
        window.location.reload;
      }
    }
    window.location.reload;
  });

  // Adicionando elementos ao formulário
  [
    titulo,
    tituloConteudo,
    descricao,
    descricaoConteudo,
    cnpj,
    cnpjConteudo,
    dataInicio,
    dataInicioConteudo,
    dataFim,
    dataFimConteudo,
    botaoCriarEleicao,
  ].forEach((el) => sessaoCriarEleicao.appendChild(el));

  return sessaoCriarEleicao;
}

export default htmlPermissao1CriarEleicao;
