// Colocar aqui as funções que comunicam com o DOM html
import api from "./api.js"




const ui = {
    montaListaDeUsuarios(usuarios) {
        const listaUsuarios = document.getElementById("lista-usuarios")
        usuarios.forEach(usuario => {
            listaUsuarios.innerHTML += `<li>[${usuario.nome}][${usuario.cpf}][${usuario.usuario}][${usuario.senha}]</li>`
        });
    },

}
export default ui;







