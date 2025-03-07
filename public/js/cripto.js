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

    async generateAESKey() {
        return await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    },

    async  encryptWithAES(aesKey, data) {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(data));
    
        // Gera um IV aleatório (necessário para AES-GCM)
        const iv = crypto.getRandomValues(new Uint8Array(12));
    
        // Criptografando os dados com AES-GCM
        const encryptedData = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            encodedData
        );
    
        return { encryptedData, iv };
    },
    

    async  encryptAESKeyWithRSA(publicKeyPem, aesKey) {
        const publicKey = await this.importPublicKey(publicKeyPem);
    
        // Exportar a chave AES para um ArrayBuffer
        const exportedAESKey = await crypto.subtle.exportKey("raw", aesKey);
    
        // Criptografar a chave AES com RSA
        return await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            exportedAESKey
        );
    },
    
    // Função para importar a chave pública
    async importPublicKey(pemKey) {
        // Remove cabeçalhos e quebra de linha
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        let pemContents = pemKey.replace(pemHeader, "").replace(pemFooter, "").replace(/\n/g, "");
    
        // Decodifica de Base64 para ArrayBuffer
        const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0)).buffer;
    
        // Importa a chave no formato correto
        return await crypto.subtle.importKey(
            "spki",
            binaryDer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
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


    jsonToArrayBuffer(json) {
        const jsonString = JSON.stringify(json);
        const encoder = new TextEncoder();
        return encoder.encode(jsonString);
    },

    async encryptUserData(publicKeyPem, userData) {
        try {
            console.log("🔑 Importando chave pública...");
            const publicKey = await this.importPublicKey(publicKeyPem);
    
            console.log("🔄 Convertendo dados para ArrayBuffer...");
            const userDataBuffer = this.jsonToArrayBuffer(userData);
    
            console.log("🔒 Criptografando...");
            const encryptedData = await crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                publicKey,
                userDataBuffer
            );
    
            console.log("📤 Convertendo para Base64...");
            return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
        } catch (error) {
            console.error("❌ Erro ao criptografar os dados:", error);
            throw error;
        }
    },

    async  encryptUserBigData(publicKeyPem, userData) {
        try {
            console.log("🔑 Gerando chave AES...");
            const aesKey = await this.generateAESKey();
    
            console.log("🔄 Criptografando dados com AES...");
            const { encryptedData, iv } = await this.encryptWithAES(aesKey, userData);
    
            console.log("🔒 Criptografando chave AES com RSA...");
            const encryptedAESKey = await this.encryptAESKeyWithRSA(publicKeyPem, aesKey);
    
            console.log("📤 Convertendo tudo para Base64...");
            return {
                encryptedAESKey: btoa(String.fromCharCode(...new Uint8Array(encryptedAESKey))),
                encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
                iv: btoa(String.fromCharCode(...iv)) // IV deve ser enviado para descriptografia
            };
        } catch (error) {
            console.error("❌ Erro ao criptografar os dados:", error);
            throw error;
        }
    }
    
    

}

export default criptografia;