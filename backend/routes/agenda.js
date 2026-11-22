const express = require("express");
const { Op } = require("sequelize");
const { Aula, Cliente } = require("../models");
const { autenticar } = require("../middleware/auth");

const router = express.Router();
router.use(autenticar);

router.get("/", async (req, res) => {
  const { data } = req.query;
  const aulas = await Aula.findAll({
    where: data ? { data } : undefined,
    include: [{ model: Cliente, attributes: ["nome"] }],
    order: [["data", "ASC"], ["horario", "ASC"]],
  });

  const resultado = aulas.map((aula) => ({
    ...aula.toJSON(),
    aluno_nome: aula.Cliente?.nome,
  }));

  res.json(resultado);
});

router.post("/", async (req, res) => {
  const { data, horario, id_cliente, tipo_aula } = req.body;
  if (!data || !horario || !id_cliente || !tipo_aula) {
    return res
      .status(400)
      .json({ erro: "data, horario, id_cliente e tipo_aula são obrigatórios" });
  }

  const aluno = await Cliente.findByPk(id_cliente);
  if (!aluno) return res.status(400).json({ erro: "Aluno informado não existe" });

  const conflitantes = await Aula.findAll({
    where: { data, horario },
    include: [{ model: Cliente, attributes: ["nome"] }],
  });

  const aula = await Aula.create({ data, horario, id_cliente, tipo_aula });

  const resposta = { ...aula.toJSON(), aluno_nome: aluno.nome };
  if (conflitantes.length > 0) {
    const nomes = conflitantes.map((c) => c.Cliente?.nome).filter(Boolean);
    resposta.aviso = `Já há aula(s) marcada(s) às ${horario} de ${data.split("-").reverse().join("/")} para: ${nomes.join(", ")}.`;
  }

  res.status(201).json(resposta);
});

router.put("/:id", async (req, res) => {
  const aula = await Aula.findByPk(req.params.id);
  if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

  const { data, horario, id_cliente, tipo_aula } = req.body;
  if (!data || !horario || !id_cliente || !tipo_aula) {
    return res
      .status(400)
      .json({ erro: "data, horario, id_cliente e tipo_aula são obrigatórios" });
  }

  const aluno = await Cliente.findByPk(id_cliente);
  if (!aluno) return res.status(400).json({ erro: "Aluno informado não existe" });

  const conflitantes = await Aula.findAll({
    where: { data, horario, id_aula: { [Op.ne]: aula.id_aula } },
    include: [{ model: Cliente, attributes: ["nome"] }],
  });

  await aula.update({ data, horario, id_cliente, tipo_aula });

  const resposta = { ...aula.toJSON(), aluno_nome: aluno.nome };
  if (conflitantes.length > 0) {
    const nomes = conflitantes.map((c) => c.Cliente?.nome).filter(Boolean);
    resposta.aviso = `Já há aula(s) marcada(s) às ${horario} de ${data.split("-").reverse().join("/")} para: ${nomes.join(", ")}.`;
  }

  res.json(resposta);
});

router.delete("/:id", async (req, res) => {
  await Aula.destroy({ where: { id_aula: req.params.id } });
  res.status(204).send();
});

module.exports = router;
