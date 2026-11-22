const express = require("express");
const { Op } = require("sequelize");
const { Cliente, Aula } = require("../models");
const { autenticar } = require("../middleware/auth");
const { padronizarTelefone } = require("../utils/telefone");

const ERRO_TELEFONE = "Contato inválido. Informe DDD + número, ex.: (11) 98765-4321";

const router = express.Router();
router.use(autenticar);

router.get("/", async (req, res) => {
  const { busca } = req.query;
  const alunos = await Cliente.findAll({
    where: busca ? { nome: { [Op.like]: `%${busca}%` } } : undefined,
    order: [["nome", "ASC"]],
  });

  const agora = new Date();
  const hoje = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0"),
  ].join("-");
  const horaAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;

  const jaRealizada = {
    [Op.or]: [
      { data: { [Op.lt]: hoje } },
      { data: hoje, horario: { [Op.lte]: horaAtual } },
    ],
  };

  const resultado = await Promise.all(
    alunos.map(async (aluno) => ({
      ...aluno.toJSON(),
      aulas_realizadas: await Aula.count({ where: { id_cliente: aluno.id_cliente, ...jaRealizada } }),
    }))
  );

  res.json(resultado);
});

router.get("/:id", async (req, res) => {
  const aluno = await Cliente.findByPk(req.params.id);
  if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });
  res.json(aluno);
});

router.post("/", async (req, res) => {
  const { nome, contato } = req.body;
  if (!nome || !contato) {
    return res.status(400).json({ erro: "Nome e contato são obrigatórios" });
  }
  const telefone = padronizarTelefone(contato);
  if (!telefone) return res.status(400).json({ erro: ERRO_TELEFONE });
  const aluno = await Cliente.create({ nome, contato: telefone });
  res.status(201).json(aluno);
});

router.put("/:id", async (req, res) => {
  const aluno = await Cliente.findByPk(req.params.id);
  if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });

  const { nome, contato } = req.body;
  let telefone = aluno.contato;
  if (contato !== undefined) {
    telefone = padronizarTelefone(contato);
    if (!telefone) return res.status(400).json({ erro: ERRO_TELEFONE });
  }
  await aluno.update({ nome: nome ?? aluno.nome, contato: telefone });
  res.json(aluno);
});

router.delete("/:id", async (req, res) => {
  await Cliente.destroy({ where: { id_cliente: req.params.id } });
  res.status(204).send();
});

module.exports = router;
