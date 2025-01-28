
import crypto from 'crypto';

const cripto = {
    criptografar(mensagem, chavePublica) {
        const bufferMensagem = Buffer.from(mensagem, 'utf-8');
        const mensagemCriptografada = crypto.publicEncrypt(
            {
                key: chavePublica,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // Define o padding OAEP
                oaepHash: 'sha256', // Define o hash compatível com Web Crypto API
            },
            bufferMensagem
        );
        return mensagemCriptografada.toString('base64'); // Retorna o resultado em Base64
    },


    async descriptografar(mensagemCriptografada, chavePrivada) {
        const bufferMensagemCriptografada = Buffer.from(mensagemCriptografada, 'base64');
        const mensagemDescriptografada = crypto.privateDecrypt(
            {
                key: chavePrivada,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            bufferMensagemCriptografada
        );
        return mensagemDescriptografada.toString('utf-8'); // Converte de volta para string
    },

    // Gerar um par de chaves RSA-OAEP
    gerarParDeChaves() {
        return crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048, // Tamanho da chave
            publicKeyEncoding: {
                type: 'spki', // Formato compatível com Web Crypto API
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8', // Formato compatível com Web Crypto API
                format: 'pem',
            },
        });
    },

    removeKeyHeaders(key) {
        // Remove as linhas de início e fim, e também espaços em branco extras
        return key
            .replace('-----BEGIN PRIVATE KEY-----', '') // Remove a linha de início
            .replace('-----END PRIVATE KEY-----', '')   // Remove a linha de fim
            .replace('-----BEGIN PUBLIC KEY-----', '') // Remove a linha de início
            .replace('-----END PUBLIC KEY-----', '')   // Remove a linha de fim
            .replace(/[\n\r]/g, '')              // Remove quebras de linha
            .trim();                                    // Remove espaços em branco extras
    },
}

export default cripto;