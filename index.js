import  app  from "./src/server.js";

const PORT = process.env.PORT||3000; // Use a variável de ambiente PORT no Vercel
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

