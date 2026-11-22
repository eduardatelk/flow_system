const express = require("express");
const bcrypt = require("bcryptjs");
const { Usuario } = require("../models");
const { autenticar } = require("../middleware/auth");

const router = express.Router();
router.use(autenticar);

const CAMPOS_PUBLICOS = ["id_usuario", "nome", "email"];
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get("/", async (req, res) => {
  const usuarios = await Usuario.findAll({
    attributes: CAMPOS_PUBLICOS,
    order: [["nome", "ASC"]],
  });
  res.json(usuarios);
});

router.post("/", async (req, res) => {
  const nome = String(req.body.nome || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." });
  }
  if (!EMAIL_VALIDO.test(email)) {
    return res.status(400).json({ erro: "E-mail inválido." });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });
  }
  if (await Usuario.findOne({ where: { email } })) {
    return res.status(409).json({ erro: "Já existe um usuário com este e-mail." });
  }

  const senha_hash = await bcrypt.hash(senha, 10);
  const usuario = await Usuario.create({ nome, email, senha_hash });
  res.status(201).json({ id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.usuario.id_usuario) {
    return res.status(400).json({ erro: "Você não pode remover o próprio usuário." });
  }
  await Usuario.destroy({ where: { id_usuario: id } });
  res.status(204).send();
});

module.exports = router;
