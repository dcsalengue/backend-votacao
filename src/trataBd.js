import { v4 as uuidv4 } from "uuid";
import cripto from "./criptografia.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const bd = {

    async insereSessao() {


        await this.excluiSessoesAntigas() 

        const { publicKey, privateKey } = cripto.gerarParDeChaves();
        const sessionId = uuidv4();

        try {

            await prisma.$executeRaw`
            INSERT INTO "sessoes" 
                (
                "sessionId", 
                "privateKey", 
                "publicKey", 
                "createdAt", 
                "modifiedAt")
            VALUES (
                ${sessionId}::uuid, 
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

    async refreshSessao(sessionId) {
        try {
            await this.excluiSessoesAntigas() // 
            const result = await prisma.$executeRaw`
                UPDATE "sessoes" 
                SET "modifiedAt" = NOW()
                WHERE "sessionId" =  CAST(${sessionId} AS UUID)
            `;
            console.log(`Refresh da sessão ${sessionId}: ${result==0?"refresh efetuado":"sessão expirada"}`);
            return result
            
        } catch (error) {
            console.error(`Sessão não encontrada ou expirada:${error}`);
        }
    },

    async obtemPrivateKeyDeSessao(sessionId) {

        // Exclui as sessões com mais de 5 minutos de vida
        await this.excluiSessoesAntigas();
        
        try {
            const result = await prisma.$queryRaw`
                SELECT "privateKey" FROM "sessoes" WHERE "sessionId" =  CAST(${sessionId} AS UUID)
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
                    0, 
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
