import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const trataArquivos = {
    arquivoUsuarios: [], // Array para armazenar usuários na memória
    bdUsuarios: path.join(__dirname, 'usuarios.json'), // Caminho do arquivo
    sessoesAbertas: path.join(__dirname, 'sessoes.json'),// Caminho do arquivo
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

    criaArquivoDeSessoes(newContent) { // Append ao final 
        let data = [];
        if (fs.existsSync(this.sessoesAbertas)) {
            data = JSON.parse(fs.readFileSync(this.sessoesAbertas, 'utf-8'));
        }
        data.push(newContent); // Adiciona o novo conteúdo
        fs.writeFileSync(this.sessoesAbertas, JSON.stringify(data, null, 2), 'utf-8');
    },

    atualizaArquivoDeSessoes(newContent) { // Para excluir sessões antigas 
       
        fs.writeFileSync(this.sessoesAbertas, JSON.stringify(newContent, null, 2), 'utf-8');
    },


    leArquivoDeSessoes(){
        let data = [];
        if (fs.existsSync(this.sessoesAbertas)) {
            data = JSON.parse(fs.readFileSync(this.sessoesAbertas, 'utf-8'));
        }  
        return data;
    },

    obtemPrivateKeyDeSessao(sessionId){
        // Lê a lista de sessões válidas
        const listaDeSessoes = this.leArquivoDeSessoes()
        const sessaoAtual = listaDeSessoes.filter(item => item.sessionId === sessionId);
        if(sessaoAtual[0]?.privateKey)
            return sessaoAtual[0].privateKey
        return undefined
    }
};

export default trataArquivos;
