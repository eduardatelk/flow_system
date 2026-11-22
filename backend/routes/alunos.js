const express = require("express");
const { Op } = require("sequelize");
const { Cliente, Aula } = require("../models");
const { autenticar } = require("../middleware/auth");
const { padronizarTelefone } = require("../utils/telefone");

const ERRO_TELEFONE = "Contato inválido. Informe DDD + número, ex.: (11) 98765-4321";

function obterAgoraEmBrasilia() {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  return {
    hoje: `${partes.year}-${partes.month}-${partes.day}`,
    horaAtual: `${partes.hour}:${partes.minute}`,
  };
}

const router = express.Router();
router.use(autenticar);

router.get("/", async (req, res) => {
  const { busca } = req.query;
  const operadorBusca = Cliente.sequelize.getDialect() === "postgres" ? Op.iLike : Op.like;
  const alunos = await Cliente.findAll({
    where: busca ? { nome: { [operadorBusca]: `%${busca}%` } } : undefined,
    order: [["nome", "ASC"]],
  });

  const { hoje, horaAtual } = obterAgoraEmBrasilia();

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
