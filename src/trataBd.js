import { v4 as uuidv4 } from "uuid";
import cripto from "./criptografia.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const bd = {
  async insereSessao(cpf) {
    if (!cpf) cpf = "000.000.000-00";
    await this.excluiSessoesAntigas();

    const { publicKey, privateKey } = cripto.gerarParDeChaves();
    const sessionId = uuidv4();

    try {
      await prisma.$executeRaw`
            INSERT INTO "sessoes" 
                (
                "sessionId", 
                "cpf",
                "privateKey", 
                "publicKey",
                "createdAt", 
                "modifiedAt"
                )
            VALUES (
                ${sessionId}::uuid, 
                ${cpf},
                ${privateKey}, 
                ${publicKey}, 
                NOW(), 
                NOW())
        `;

      console.log("Sessão criada!");
      return { sessionId, publicKey };
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
    } finally {
      await prisma.$disconnect();
    }
  },
  async obtemPermissaoUsuarioSessao(sessionId) {
    try {
      const result = await prisma.$queryRaw`
            SELECT u."nome", u."permissao" 
            FROM "sessoes" s
            JOIN "usuarios" u 
            ON s."cpf" = u."cpf"
            WHERE s."sessionId" = CAST(${sessionId} AS UUID)
        `;

      if (result.length > 0) {
        return result[0];
      } else {
        console.log("Nenhum usuário encontrado para essa sessão.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar permissões:", error);
      return null;
    }
  },

  async obtemSessoes() {
    try {
      const sessoes = await prisma.sessoes.findMany();
      console.log("Sessões encontradas:", sessoes);
      return sessoes;
    } catch (error) {
      console.error("Erro ao conectar ao banco:", error);
      return error;
    } finally {
      await prisma.$disconnect();
    }
  },

  async excluiSessoesAntigas() {
    try {
      const result = await prisma.$executeRaw`
                DELETE FROM "sessoes" 
                WHERE "modifiedAt" < NOW() - INTERVAL '15 minutes'
            `;
      console.log(`Sessões excluídas: ${result}`);
    } catch (error) {
      console.error("Erro ao excluir sessões antigas:", error);
    }
  },

  async excluiUsuario(cpf) {
    try {
      console.log(cpf);
      const result = await prisma.$executeRaw`
                DELETE FROM "usuarios" 
                WHERE "cpf" = ${cpf}
            `;
      console.log(`Usuário excluído: ${result}`);
    } catch (error) {
      console.error("Erro ao excluir sessões antigas:", error);
    }
  },

  async verificaSessaoExiste(sessionId) {
    try {
      await this.excluiSessoesAntigas();
      const result = await prisma.$executeRaw`
                SELECT "sessionId" 
                FROM "sessoes" 
                WHERE "sessionId" =  CAST(${sessionId} AS UUID)
            `;
      console.log(`verificaSessaoExiste ${result}`);
      return result > 0 ? true : false;
    } catch (error) {
      console.error(`Sessão não encontrada ou expirada:${error}`);
    }
  },

  async refreshSessao(sessionId) {
    try {
      await this.excluiSessoesAntigas();
      const result = await prisma.$executeRaw`
                UPDATE "sessoes" 
                SET "modifiedAt" = NOW()
                WHERE "sessionId" =  CAST(${sessionId} AS UUID)
            `;
      console.log(
        `Refresh da sessão ${sessionId}: ${
          result == 0 ? "refresh efetuado" : "sessão expirada"
        }`
      );
      return result;
    } catch (error) {
      console.error(`Sessão não encontrada ou expirada:${error}`);
    }
  },

  async resetSenhaUsuario(cpf) {
    try {
      await this.excluiSessoesAntigas();
      const hashSenha = await cripto.hash("1234");
      const result = await prisma.$executeRaw`
                UPDATE "usuarios" 
                SET "modifiedAt" = NOW() ,               
                    "senha" = ${hashSenha}
                WHERE "cpf" =  ${cpf}  
            `;
      console.log(
        `Reset da senha cpf ${cpf}: ${
          result == 0 ? "Senha não alterada" : "Senha resetada"
        }`
      );
      return result;
    } catch (error) {
      console.error(`Não encontrou cpf :${error}`);
    }
  },

  async criaEleicao(dadosEleicao) {
    console.log(dadosEleicao);
    try {
      const uuid = uuidv4();
      const { titulo, descricao, cnpj, dataInicio, dataFim } = dadosEleicao;

      console.log(cnpj);
      await prisma.$executeRaw`
        INSERT INTO "eleicoes" 
            (
            "uuid",
            "titulo", 
            "descricao",
            "cnpj", 
            "data_inicio",
            "data_fim",
            "created_at"
            )
        VALUES (
            ${uuid}::uuid, 
            ${titulo}, 
            ${descricao},
            ${cnpj}, 
            ${dataInicio}::TIMESTAMP,
            ${dataFim}::TIMESTAMP,
            NOW())
    `;

      console.log("Eleição criada!");
      return "Eleição criada!";
    } catch (error) {
      console.error("Erro ao criar eleição:", error);
    } finally {
      await prisma.$disconnect();
    }
  },

  async listaEleicoes() {
    // const opcoes =
    //     [
    //         { valor: "1", texto: "Opção 1" },
    //         { valor: "2", texto: "Opção 2" },
    //         { valor: "3", texto: "Opção 3" }
    //     ];

    try {
      const result = await prisma.$queryRaw`
                    SELECT uuid, titulo FROM "eleicoes" 
                `;

      if (result.length > 0) {
        console.log(`(${result.length})Usuário encontrado:`);
        console.log(`${result}`);
        return result;
      } else {
        console.log("Nenhuma eleição encontrada.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar privateKey:", error);
    } finally {
      await prisma.$disconnect();
    }

    return opcoes;
  },


  async obtemDadosEleicao(uuid) {
    let dadosEleicao = null;
    try {       
      const result = await prisma.$queryRaw`
                    SELECT * 
                    FROM "eleicoes" 
                    WHERE "uuid" = ${uuid}::uuid      

                `;

      if (result.length > 0) {
        console.log(`(${result.length})Usuário encontrado:`);
        dadosEleicao = result[0];
        console.log(`bd ln241 - ${JSON.stringify(dadosEleicao)}`);
      } else {
        console.log("Nenhuma eleição encontrada.");
        dadosEleicao = null;
      }
      await prisma.$disconnect();
      return dadosEleicao;
    } catch (error) {
      console.error("Erro ao buscar privateKey:", error);
      await prisma.$disconnect();
      return null;
    }
  },

  async excluirSessao(sessionId) {
    try {
      console.log(`excluirSessao(${sessionId}`);
      const result = await prisma.$executeRaw`
                DELETE FROM "sessoes" 
                WHERE "sessionId" =  CAST(${sessionId} AS UUID)
            `;
      console.log(`Sessão  ${sessionId} excluídas: ${result}`);
    } catch (error) {
      console.error("Erro ao excluir sessões antigas:", error);
    }
  },

  async obtemPrivateKeyDeSessao(sessionId) {
    // Exclui as sessões com mais de 5 minutos de vida
    await this.excluiSessoesAntigas();
    try {
      if (!sessionId) {
        console.log("Session ID inválido");
        return null;
      }
      console.log(`PrivateKeyDeSessao ${sessionId}`);
      const result = await prisma.$queryRaw`
                    SELECT "privateKey" , "cpf"
                    FROM "sessoes"
                    WHERE "sessionId" =  CAST(${sessionId} AS UUID)
                `;

      if (result.length > 0) {
        console.log("Private Key encontrada");
        // Se a sessão ainda existir marca o modifiedAt com o now

        console.log(`bd ln 285 -  ${JSON.stringify(result[0])}`);
        await this.refreshSessao(sessionId);
        //return result[0].privateKey;
        //return { privateKey: result.privateKey, cpf: result.cpf };
        return result[0];
      } else {
        console.log("Nenhuma sessão encontrada para esse ID.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar privateKey:", error);
    } finally {
      await prisma.$disconnect();
    }
  },

  async verificaCpfExiste(cpf) {
    try {
      console.log("Verificando se o CPF já existe...");
      const result = await prisma.$queryRaw`
                SELECT "cpf" FROM "usuarios" WHERE "cpf" = ${cpf}
            `;

      return result.length > 0; // Retorna true se existir, false se não
    } catch (error) {
      console.error("Erro ao verificar CPF:", error);
      return false; // Em caso de erro, retorna false para evitar falhas no fluxo
    }
  },

  async obtemUsuarioComCpf(cpf) {
    try {
      const result = await prisma.$queryRaw`
                SELECT * FROM "usuarios" WHERE "cpf" = ${cpf}
            `;

      if (result.length > 0) {
        console.log("Usuário encontrado:");
        return result[0];
      } else {
        console.log("Nenhuma sessão encontrada para esse ID.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar privateKey:", error);
    } finally {
      await prisma.$disconnect();
    }
  },

  async insereUsuario(newUser) {
    const { publicKey, privateKey } = cripto.gerarParDeChaves();

    const { nome, email, cpf, senha } = newUser;
    const sessionId = uuidv4();
    try {
      await prisma.$executeRaw`
                INSERT INTO "usuarios" 
                    (
                    "nome", 
                    "email", 
                    "cpf",
                    "senha", 
                    "permissao", 
                    "privateKey",
                    "publicKey",
                    "createdAt",
                    "modifiedAt")
                VALUES (
                    ${nome}, 
                    ${email}, 
                    ${cpf}, 
                    ${senha}, 
                    2, 
                    ${privateKey}, 
                    ${publicKey}, 
                    NOW(), 
                    NOW())
            `;

      console.log("Usuário criado:", nome);
      return "Usuário criado:", nome;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    } finally {
      await prisma.$disconnect();
    }
  },

  async obtemUsuarios() {
    try {
      const sessoes = await prisma.usuarios.findMany();
      //console.log("Usuários encontrados:", sessoes);
      return sessoes;
    } catch (error) {
      console.error("Erro ao conectar ao banco:", error);
      return error;
    } finally {
      await prisma.$disconnect();
    }
  },

  async buscaDadosUsuario(cpf) {
    try {
      const result = await prisma.$queryRaw`
                SELECT nome, email, permissao FROM "usuarios" WHERE "cpf" = ${cpf}
            `;

      if (result.length > 0) {
        console.log(result);
        return result[0];
      } else {
        console.log("Nenhuma sessão encontrada para esse ID.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar privateKey:", error);
    } finally {
      await prisma.$disconnect();
    }
    return { retorna: `${cpf}` };
  },

  async updatePermissao(cpf, nome, email, permissao) {
    console.log(`ln294: CPF: ${cpf}`);
    const testeVerificaUsuario = await this.buscaDadosUsuario(cpf); //("015.145.440-08")
    console.log(
      `updatePermissao ln295 ${JSON.stringify(testeVerificaUsuario)}`
    );
    try {
      await this.excluiSessoesAntigas();
      const permissaoInt = parseInt(permissao, 10); // Converte para número
      console.log(`updatePermissao ${cpf} [${permissaoInt}]`);
      const result = await prisma.$executeRaw`
                UPDATE "usuarios" 
                SET "modifiedAt" = NOW(), 
                    "nome" = ${nome}, 
                    "email" = ${email}, 
                    "permissao" = ${permissaoInt}
                WHERE "cpf" = ${cpf} 
            `;

      console.log(`dados atualizados: ${result}`);
      return result;
    } catch (error) {
      console.error(`Erro ao atualizar usuário: ${error}`);
      throw error;
    }
  },

  async excluirEleitor(cpfsExcluir, id_eleicao) {
    if (typeof cpfsExcluir === "string") {
      try {
        cpfsExcluir = JSON.parse(cpfsExcluir);
      } catch (error) {
        console.error("Erro ao parsear cpfsExcluir:", error);
        return;
      }
    }
    console.log(`excluirEleitores ${cpfsExcluir} | ${id_eleicao}`);

    const cpf = cpfsExcluir[0];
    //for (const cpf of cpfsExcluir) {
    try {
      console.log(`CPF: ${JSON.stringify(cpfsExcluir)} (tipo: ${typeof cpf})`);
      console.log(`CPF: ${JSON.stringify(cpf)} (tipo: ${typeof cpf})`);
      console.log(`ID Eleição: ${id_eleicao} (tipo: ${typeof id_eleicao})`);

      // Verifica se o CPF existe no banco antes de deletar
      const existe = await prisma.$queryRaw`
                SELECT * FROM "eleitores" 
                WHERE "cpf" = ${cpf}
                AND "id_eleicao" = CAST(${id_eleicao} AS UUID)
            `;

      if (existe.length === 0) {
        console.log(`CPF ${cpf} não encontrado na eleição ${id_eleicao}`);
      } else {
        console.log(`CPF ${cpf} encontrado! Deletando...`);

        const result = await prisma.$executeRaw`
                    DELETE FROM "eleitores" 
                    WHERE "cpf" = ${cpf}
                    AND "id_eleicao" = CAST(${id_eleicao} AS UUID)
                `;
        console.log(`Eleitor removido: ${cpf} [${result}]`);
      }
    } catch (error) {
      console.error(`Erro ao remover eleitor ${cpf}:`, error);
    }
    // }
  },

  async criaEleitores(cpfs, id_eleicao) {
    try {
      // Se cpfs for uma string JSON, fazer o parse
      if (typeof cpfs === "string") {
        cpfs = JSON.parse(cpfs);
      }

      console.log(`${id_eleicao}\r\n${cpfs}`);

      // Incluir novos CPFs no banco
      for (const cpf of cpfs) {
        const id = uuidv4();
        try {
          await prisma.$executeRaw`
                    INSERT INTO "eleitores"  (
                            "id", 
                            "cpf", 
                            "id_eleicao", 
                            "permissao", 
                            "saldo")
                        VALUES (
                            ${id}::uuid, 
                            ${cpf}, 
                            ${id_eleicao}::uuid,
                            2, 
                            1)
                `;
          console.log("Eleitor criado:", cpf);
        } catch (error) {
          console.error("Erro ao criar eleitor:", error);
        }
      }

      return "Ok";
    } catch (error) {
      console.error("Erro geral:", error);
      return "Erro ao criar eleitores";
    } finally {
      await prisma.$disconnect(); // Fecha conexão corretamente
    }
  },

  async obtemEleitores(uuidEleicao) {
    let eleitores = null;
    try {
      const result = await prisma.$queryRaw`
       SELECT u."nome", u."cpf" 
            FROM "eleitores" e
            JOIN "usuarios" u 
            ON e."cpf" = u."cpf"
            WHERE e."id_eleicao" = CAST(${uuidEleicao} AS UUID)

                     

                `;
      // SELECT *
      // FROM "eleitores"
      // WHERE "id_eleicao" = ${uuidEleicao}::uuid
      // selecionar também o nome vinculado aos cpfs
      if (result.length > 0) {
        console.log(`${JSON.stringify(result)}`);
        eleitores = result;
      } else {
        console.log("Nenhuma eleição encontrada.");
        eleitores = null;
      }
    } catch (error) {
      console.error(error);
    } finally {
      await prisma.$disconnect();
    }
    return eleitores;
  },

  async criaCandidatos(cpfs, id_eleicao) {
    try {
      // Se cpfs for uma string JSON, fazer o parse
      if (typeof cpfs === "string") {
        cpfs = JSON.parse(cpfs);
      }

      console.log("CPFs recebidos:", cpfs);

      let idsAtual = [];
      let ids = [];

      try {
        // Buscar os eleitores da eleição informada
        const result = await prisma.$queryRaw`
                SELECT id, cpf
                FROM "eleitores"
                WHERE "id_eleicao" = CAST(${id_eleicao} AS UUID)
                AND "cpf" = ${cpfs[0]}
            `;

        console.log("Resultado da consulta:", result);

        if (result.length > 0) {
          // Filtrar apenas os IDs dos CPFs que estão na lista passada
          ids = result
            .filter((eleitor) => cpfs.includes(eleitor.cpf))
            .map((eleitor) => eleitor.id); // Extraindo os IDs dos eleitores

          // IDs de todos os eleitores cadastrados no banco
          idsAtual = result.map((eleitor) => eleitor.id);
        }
      } catch (error) {
        console.error("Erro ao buscar eleitores:", error);
        return "Erro ao buscar eleitores";
      } finally {
        await prisma.$disconnect();
      }

      console.log("IDs filtrados (presentes no banco e na lista):", ids);
      console.log("IDs atuais no banco:", idsAtual);

      // Criar lista de IDs a excluir (estão no banco, mas não foram passados)
      const idsExcluir = idsAtual.filter((id) => !ids.includes(id));

      // Criar lista de IDs a incluir (foram passados, mas não estão no banco)
      const idsIncluir = ids; // ids.filter(id => !idsAtual.includes(id));

      console.log("IDs a excluir:", idsExcluir);
      console.log("IDs a incluir:", idsIncluir);

      // Incluir novos CPFs no banco
      for (const id of idsIncluir) {
        try {
          await prisma.$executeRaw`
                    INSERT INTO "candidatos" ("id_eleitor", "apelido", "votos")
                    VALUES (${id}::uuid, 'incluir', 0)
                `;
          console.log("Candidato criado para ID:", id);
        } catch (error) {
          console.error("Erro ao criar candidato:", error);
        }
      }

      return "Ok";
    } catch (error) {
      console.error("Erro geral:", error);
      return "Erro ao criar candidatos";
    } finally {
      await prisma.$disconnect(); // Fecha conexão corretamente
    }
  },

  async obtemCandidatos(uuidEleicao) {
    let candidatos = null;
    try {
      const result = await prisma.$queryRaw`
                    SELECT u."nome", u."cpf", u."publicKey", c."id_eleitor"
                    FROM "eleitores" e
                    JOIN "candidatos" c ON e."id" = c."id_eleitor"
                    JOIN "usuarios" u ON e."cpf" = u."cpf"
                    WHERE e."id_eleicao" = ${uuidEleicao}::uuid
                `;

      if (result.length > 0) {
        console.log(`${JSON.stringify(result)}`);
        candidatos = result;
      } else {
        console.log("Nenhum candidato encontrado.");
        candidatos = null;
      }
    } catch (error) {
      console.error(error);
    } finally {
      await prisma.$disconnect();
    }
    return candidatos;
  },

  async obtemPrivateKeyCandidato(id_candidato) {
    try {
      const result = await prisma.$queryRaw`
            SELECT u."privateKey" 
            FROM "usuarios" u
            JOIN "eleitores" e ON e."cpf" = u."cpf"
            JOIN "candidatos" c ON c."id_eleitor" = e."id"
            WHERE c."id_eleitor" = CAST(${id_candidato} AS UUID)
        `;

      if (result.length > 0) {
        console.log(
          "✅ Private Key encontrada para o candidato:",
          id_candidato
        );
        return result[0].privateKey;
      } else {
        console.warn(
          "⚠️ Nenhuma chave privada encontrada para esse candidato:",
          id_candidato
        );
        return null;
      }
    } catch (error) {
      console.error("❌ Erro ao buscar privateKey do candidato:", error);
      return null;
    }
  },

  async obtemSaldoEleitor(idEleicao, cpf) {
    try {
      const saldoEleitor = await prisma.$queryRaw`
            SELECT e."saldo" 
            FROM "eleitores" e
            WHERE e."id_eleicao" = CAST(${idEleicao} AS UUID)
            AND  e."cpf" = ${cpf}
        `;
      console.log(`bd ln 689 saldoEleitor - ${JSON.stringify(saldoEleitor)}`);
      await prisma.$disconnect(); // Fecha conexão corretamente
      return saldoEleitor[0];
    } catch (error) {
      console.log(error);
      return 0;
    }
  },

  async atualizaSaldoEleitor(idEleicao, cpf, saldoAtual) {
    try {
      const result = await prisma.$executeRaw`
            UPDATE "eleitores" 
            SET "saldo" = ${saldoAtual - 1} 
            WHERE "id_eleicao" = CAST(${idEleicao} AS UUID)
            AND  "cpf" = ${cpf}
              `;
      console.log(`Saldo do eleitor decrementado`);
      return result;
    } catch (error) {
      console.error(`Não alterou saldo do eleitor :${error}`);
    }
  },

  async obtemVotosCandidato(id_candidato) {
    try {
      const saldoCandidato = await prisma.$queryRaw`
            SELECT c."votos" 
            FROM "candidatos" c
            WHERE c."id_eleicao" = CAST(${id_candidato} AS UUID)
        `;
      console.log(`bd ln 689 saldoEleitor - ${JSON.stringify(saldoCandidato)}`);
      await prisma.$disconnect(); // Fecha conexão corretamente
      return saldoCandidato[0];
    } catch (error) {
      console.log(error);
      return 0;
    }
  },

  async adicionaVotoCandidato(id_candidato) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        return await tx.candidatos.update({
          where: { id_eleitor: id_candidato },
          data: { votos: { increment: 1 } }, // Evita race condition
        });
      });

      console.log(`Voto registrado com sucesso`);
      return result;
    } catch (error) {
      console.error(`Erro ao registrar voto: ${error}`);
      return null;
    }
  },

  async votar(dado) {
    console.log("🗳️ Registrando voto na urna...");
    console.log(dado);

    const voto = {
      timestamp: dado.timestamp,
      id_candidato: dado.id_candidato,
      nome_candidato: dado.nome_candidato,
      voto_candidato: dado.voto_candidato,
    };
    try {
      await prisma.$executeRaw`
        INSERT INTO "urna" (
            "uuid_eleicao", 
            "voto") 
        VALUES (
            CAST(${dado.id_eleicao} AS UUID),
            ${JSON.stringify(voto)})`;

      // Atualiza saldo do eleitor
      await prisma.$executeRaw`
            INSERT INTO "urna" (
                "uuid_eleicao", 
                "voto") 
            VALUES (
                CAST(${dado.id_eleicao} AS UUID),
                ${JSON.stringify(voto)})`;
      await prisma.$disconnect(); // Fecha conexão corretamente
      console.log("✅ Voto incluído na urna!");
      return { success: true, message: "Voto incluído na urna" };
    } catch (error) {
      await prisma.$disconnect(); // Fecha conexão corretamente
      console.error("❌ Erro ao votar:", error);
      return { success: false, error: "Erro ao registrar voto" };
    }
  },
};

export default bd;
