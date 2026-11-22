const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");
const authRouter = require("./routes/auth");
const alunosRouter = require("./routes/alunos");
const agendaRouter = require("./routes/agenda");
const usuariosRouter = require("./routes/usuarios");

const app = express();
const PORT = process.env.PORT || 3001;

let sincronizacao;
function sincronizarBanco() {
  if (!sincronizacao) sincronizacao = sequelize.sync();
  return sincronizacao;
}

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", servico: "Flow API - piloto PEX V" });
});

app.use(async (req, res, next) => {
  try {
    await sincronizarBanco();
    next();
  } catch (erro) {
    sincronizacao = null;
    next(erro);
  }
});

app.use("/api", authRouter);
app.use("/api/alunos", alunosRouter);
app.use("/api/agenda", agendaRouter);
app.use("/api/usuarios", usuariosRouter);

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ erro: "Erro interno no servidor" });
});

if (require.main === module) {
  sincronizarBanco()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Flow API rodando em http://localhost:${PORT}`);
      });
    })
    .catch((erro) => {
      console.error("Erro ao conectar/sincronizar o banco de dados:", erro);
      process.exit(1);
    });
}

module.exports = app;
