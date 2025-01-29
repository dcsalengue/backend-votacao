const criptografia = {

    // Funções de criptografia e hash RSA256
    async hash(string) {
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((bytes) => bytes.toString(16).padStart(2, '0'))
            .join('');
        return hashHex;
    },


    // Função para converter a chave pública PEM em ArrayBuffer
    pemToArrayBuffer(pem) {
        const base64 = pem
            .replace(/-----BEGIN PUBLIC KEY-----/g, '')
            .replace(/-----END PUBLIC KEY-----/g, '')
            .replace(/\s+/g, ''); // Remove cabeçalhos, rodapés e espaços em branco
        const binary = atob(base64); // Decodifica de Base64
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    },

    // Função para importar a chave pública
    async importPublicKey(pem) {
        const arrayBuffer = this.pemToArrayBuffer(pem);
        return crypto.subtle.importKey(
            'spki', // Formato SPKI para chaves públicas
            arrayBuffer,
            {
                name: 'RSA-OAEP', // Algoritmo de criptografia
                hash: { name: 'SHA-256' }, // Hash utilizado
            },
            false, // Chave não exportável
            ['encrypt'] // Usada apenas para criptografia
        );
    },

    // Função para criptografar dados com a chave pública
    async encryptWithPublicKey(publicKey, data) {
        const encoder = new TextEncoder(); // Codifica dados para ArrayBuffer
        const encodedData = encoder.encode(JSON.stringify(data)); // Converte para JSON e codifica
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'RSA-OAEP',
            },
            publicKey,
            encodedData
        );
        return encryptedData; // Retorna um ArrayBuffer com os dados criptografados
    },

    async encryptUserData(publicKeyPem, userData) {
        try {
            // Importar a chave pública
            const publicKey = await this.importPublicKey(publicKeyPem);

            // Criptografar os dados do usuário
            const encryptedData = await this.encryptWithPublicKey(publicKey, userData);

            // Converter os dados criptografados para Base64 para envio ao servidor
            const encryptedBase64 = btoa(
                String.fromCharCode(...new Uint8Array(encryptedData))
            );

            // Retorna os dados criptografados em Base64
            return encryptedBase64;
        } catch (error) {
            console.error('Erro ao criptografar os dados:', error);
            throw error; // Repassa o erro para ser tratado externamente
        }
    }

}

export default criptografia;