import { v4 as uuidv4 } from "uuid";
import cripto from "./criptografia.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const bd = {

    async insereSessao() {

        const { publicKey, privateKey } = cripto.gerarParDeChaves();
        const sessionId = uuidv4();
        const createdAt = new Date();
        const modifiedAt = new Date();

        try {
            const novaSessao = await prisma.sessoes.create({
                data: {
                    sessionId: sessionId,
                    privateKey: privateKey,
                    publicKey: publicKey,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                },
            });

            console.log("Sessão criada:", novaSessao);
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
};

export default bd;
