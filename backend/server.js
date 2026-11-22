const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");
const authRouter = require("./routes/auth");
const alunosRouter = require("./routes/alunos");
const agendaRouter = require("./routes/agenda");
const usuariosRouter = require("./routes/usuarios");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", servico: "Flow API - piloto PEX V" });
});

app.use("/api", authRouter);
app.use("/api/alunos", alunosRouter);
app.use("/api/agenda", agendaRouter);
app.use("/api/usuarios", usuariosRouter);

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Flow API rodando em http://localhost:${PORT}`);
    });
  })
  .catch((erro) => {
    console.error("Erro ao conectar/sincronizar o banco de dados:", erro);
    process.exit(1);
  });
