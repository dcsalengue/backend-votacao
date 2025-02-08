import { v4 as uuidv4 } from "uuid";
import cripto from "./criptografia.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const bd = {

    async insereSessao(cpf) {


        if (!cpf)
            cpf = "000.000.000-00"
        await this.excluiSessoesAntigas()

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
            return ({ sessionId, publicKey })
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
            return sessoes
        } catch (error) {
            console.error("Erro ao conectar ao banco:", error);
            return error
        } finally {
            await prisma.$disconnect();
        }
    },

    async excluiSessoesAntigas() {
        try {
            const result = await prisma.$executeRaw`
                DELETE FROM "sessoes" 
                WHERE "modifiedAt" < NOW() - INTERVAL '5 minutes'
            `;
            console.log(`Sessões excluídas: ${result}`);
        } catch (error) {
            console.error("Erro ao excluir sessões antigas:", error);
        }

    },

    async verificaSessaoExiste(sessionId) {
        try {
            await this.excluiSessoesAntigas()
            const result = await prisma.$executeRaw`
                SELECT "sessionId" 
                FROM "sessoes" 
                WHERE "sessionId" =  CAST(${sessionId} AS UUID)
            `;
            console.log(`verificaSessaoExiste ${result}`);
            return result > 0 ? true : false

        } catch (error) {
            console.error(`Sessão não encontrada ou expirada:${error}`);
        }


    },

    async refreshSessao(sessionId) {
        try {
            await this.excluiSessoesAntigas()
            const result = await prisma.$executeRaw`
                UPDATE "sessoes" 
                SET "modifiedAt" = NOW()
                WHERE "sessionId" =  CAST(${sessionId} AS UUID)
            `;
            console.log(`Refresh da sessão ${sessionId}: ${result == 0 ? "refresh efetuado" : "sessão expirada"}`);
            return result

        } catch (error) {
            console.error(`Sessão não encontrada ou expirada:${error}`);
        }
    },

    async excluirSessao(sessionId) {
        try {
            console.log(`excluirSessao(${sessionId}`)
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
            console.log(`mPrivateKeyDeSessao ${sessionId}`)
            const result = await prisma.$queryRaw`
                    SELECT "privateKey" 
                    FROM "sessoes"
                    WHERE "sessionId" =  CAST(${sessionId} AS UUID)
                `;

            if (result.length > 0) {
                console.log("Private Key encontrada");
                // Se a sessão ainda existir marca o modifiedAt com o now

                await this.refreshSessao(sessionId)
                return result[0].privateKey;
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
            console.log('Verificando se o CPF já existe...');
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

        const { nome, email, cpf, senha } = newUser
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
            return ("Usuário criado:", nome)
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
        } finally {
            await prisma.$disconnect();
        }
    },

    async obtemUsuarios() {
        try {
            const sessoes = await prisma.usuarios.findMany();
            console.log("Sessões encontradas:", sessoes);
            return sessoes
        } catch (error) {
            console.error("Erro ao conectar ao banco:", error);
            return error
        } finally {
            await prisma.$disconnect();
        }
    },


};

export default bd;
