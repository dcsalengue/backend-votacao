import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Meu backend na Vercel");
});

app.get("/favicon.ico", (req, res) => res.status(204));

export default app ;
