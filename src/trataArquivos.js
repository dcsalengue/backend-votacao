import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const trataArquivos = {
    arquivoUsuarios: [], // Array para armazenar usuários na memória
    bdUsuarios: path.join(__dirname, 'usuarios.json'), // Caminho do arquivo

    // Atualiza o array local com o conteúdo do arquivo
    refreshUsuarios() {
        if (fs.existsSync(this.bdUsuarios)) {
            const data = fs.readFileSync(this.bdUsuarios, 'utf-8'); // 'this' para acessar bdUsuarios
        //    console.log(data)
            this.arquivoUsuarios = data;
        }

    },

    // Adiciona um novo conteúdo ao arquivo JSON
    updateJsonFile(newContent) {
        // console.log(newContent)
        let data = [];
        if (fs.existsSync(this.bdUsuarios)) {
            data = JSON.parse(fs.readFileSync(this.bdUsuarios, 'utf-8'));
        }
        data.push(newContent); // Adiciona o novo conteúdo
        fs.writeFileSync(this.bdUsuarios, JSON.stringify(data, null, 2), 'utf-8');
    },
};

export default trataArquivos;
