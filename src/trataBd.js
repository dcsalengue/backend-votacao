import { v4 as uuidv4 } from "uuid";
import cripto from "./criptografia.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const bd = {

    async insereSessao() {

        const { publicKey, privateKey } = cripto.gerarParDeChaves();
        const sessionId = uuidv4();

        try {
            // Insere dados no bd usando prisma
            const novaSessao = await prisma.sessoes.create({
                data: {
                    sessionId: sessionId,
                    privateKey: privateKey,
                    publicKey: publicKey,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                },
            });

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

    async obtemPrivateKeyDeSessao(sessionId) {
        try {            
            const result = await prisma.$queryRaw`
                SELECT "privateKey" FROM "sessoes" WHERE "sessionId" =  CAST(${sessionId} AS UUID)
            `;

            if (result.length > 0) {
                console.log("Private Key encontrada");
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
            console.log('verificaCpfExiste')
            const result = await prisma.$queryRaw`
                SELECT "cpf" FROM "usuarios" WHERE "cpf" = ${cpf}
            `;

            if (result.length > 0) {
                console.log("Public Key encontrada:", result[0].privateKey);
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
            // Insere dados no bd usando prisma
            const novoUsuario = await prisma.usuarios.create({
                data: {
                    nome: nome,
                    email: email,
                    cpf: cpf,
                    senha: senha,
                    permissao: 0, // Criado com permissão mínima
                    privateKey: privateKey,
                    publicKey: publicKey,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                },
            });

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
