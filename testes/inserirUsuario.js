import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function criarUsuario() {
    try {
        const novoUsuario = await prisma.usuarios.create({
            data: {
                nome: "João Silva",
                email: "joao@email.com",
                cpf: "123.456.789-00",
                senha: "senha123",
                permissao: 1,
                privateKey: "chave_privada_aleatoria",
                publicKey: "chave_publica_aleatoria",
                createdAt: new Date(),
                modifiedAt: new Date(),
            },
        });

        console.log("Usuário criado:", novoUsuario);
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
    } finally {
        await prisma.$disconnect();
    }
}

criarUsuario();
