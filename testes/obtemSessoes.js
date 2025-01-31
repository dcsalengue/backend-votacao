import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function testarConexao() {
    console.log("Conectando no banco:", process.env.DATABASE_URL);
    try {
        const sessoes = await prisma.sessoes.findMany();
        console.log("Sessões encontradas:", sessoes);
    } catch (error) {
        console.error("Erro ao conectar ao banco:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testarConexao();