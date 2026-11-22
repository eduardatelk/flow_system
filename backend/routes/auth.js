const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario } = require("../models");
const { SEGREDO_JWT } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const { senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: "Informe e-mail e senha." });
  }

  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.status(401).json({ erro: "E-mail ou senha inválidos." });
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaConfere) {
    return res.status(401).json({ erro: "E-mail ou senha inválidos." });
  }

  const token = jwt.sign(
    { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email },
    SEGREDO_JWT,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    usuario: { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email },
  });
});

module.exports = router;
