import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function testarConexao() {
    console.log("Conectando no banco:", process.env.DATABASE_URL);
    try {
        const usuarios = await prisma.usuarios.findMany();
        console.log("Usuários encontrados:", usuarios);
    } catch (error) {
        console.error("Erro ao conectar ao banco:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testarConexao();