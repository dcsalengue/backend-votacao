import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function criarUsuario() {
    try {
        const novaSessao = await prisma.sessoes.create({
            data: {
                sessionId: "e59e5b21-3d42-4d90-8af4-04ddb8ab0aee",
                privateKey: "chave_privada_aleatoria",
                publicKey: "chave_publica_aleatoria",
                createdAt: new Date(),
                modifiedAt: new Date(),
            },
        });

        console.log("Sessão criada:", novaSessao);
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
    } finally {
        await prisma.$disconnect();
    }
}

criarUsuario();
