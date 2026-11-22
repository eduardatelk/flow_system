const jwt = require("jsonwebtoken");

const SEGREDO_JWT = process.env.JWT_SECRET || "flow-piloto-segredo-dev";

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;
  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não informado. Faça login novamente." });
  }

  const token = cabecalho.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, SEGREDO_JWT);
    req.usuario = payload;
    next();
  } catch (e) {
    return res.status(401).json({ erro: "Token inválido ou expirado. Faça login novamente." });
  }
}

module.exports = { autenticar, SEGREDO_JWT };
