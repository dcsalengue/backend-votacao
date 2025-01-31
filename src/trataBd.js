import { v4 as uuidv4 } from "uuid";
import cripto from "./criptografia.js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();


const bd = {
    async testarConexao() {
        try {
            const usuarios = await prisma.usuarios.findMany();
            console.log("Usuários encontrados:", usuarios);
        } catch (error) {
            console.error("Erro ao conectar ao banco:", error);
        } finally {
            await prisma.$disconnect();
        }
    },

    async getPgVersion() {
        console.log('getPgVersion')

        try {
            const result = await sql`SELECT version()`;
            const { version } = result[0];
            console.log(version)
            return version
        } catch (error) {
            return (error)
        }
    },



    async criaTabelaSessao() {
        try {
            await pool.query(`
        CREATE TABLE IF NOT EXISTS sessoes (
          sessionId UUID PRIMARY KEY,
          publicKey VARCHAR(256) UNIQUE NOT NULL,
          privateKey VARCHAR(256) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP NOT NULL,
          last_login TIMESTAMP
        );
      `);
            console.log("Tabela 'sessoes' criada com sucesso!");
            return "Tabela 'sessoes' criada no banco de dados";
        } catch (error) {
            console.error("Erro ao criar tabela:", error);
            return { erro: "Erro ao criar tabela" };
        }
    },

    async criaSessao(email) {
        try {
            const { publicKey, privateKey } = cripto.gerarParDeChaves();
            const sessionId = uuidv4();
            const created_at = new Date();
            const last_login = new Date();

            await pool.query(
                `INSERT INTO sessoes (sessionId, publicKey, privateKey, email, created_at, last_login)
         VALUES ($1, $2, $3, $4, $5, $6);`,
                [sessionId, publicKey, privateKey, email, created_at, last_login]
            );

            console.log(`Sessão criada: ${sessionId}`);
            return { sessionId, publicKey };
        } catch (error) {
            console.error("Erro ao criar sessão:", error);
            return { erro: "Erro ao criar sessão" };
        }
    },

    async obtemSessoes() {
        try {
            const result = await pool.query("SELECT * FROM sessoes;");
            return result.rows;
        } catch (error) {
            console.error("Erro ao obter sessões:", error);
            return { erro: "Erro ao obter sessões" };
        }
    },
};

export default bd;
