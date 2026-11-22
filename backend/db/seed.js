const bcrypt = require("bcryptjs");
const { sequelize, Cliente, Aula, Usuario } = require("../models");

async function popularBanco() {
  await sequelize.sync();

  const usuarioExiste = await Usuario.findOne({ where: { email: "eduardatelk@gmail.com" } });
  if (!usuarioExiste) {
    const senha_hash = await bcrypt.hash("123456", 10);
    await Usuario.create({
      nome: "Eduarda Telk",
      email: "eduardatelk@gmail.com",
      senha_hash,
    });
    console.log("Usuário de acesso criado -> e-mail: eduardatelk@gmail.com | senha: 123456");
  } else {
    console.log("Usuário já existe. Seeder de usuário não executado novamente.");
  }

  const jaTemAlunos = (await Cliente.count()) > 0;
  if (jaTemAlunos) {
    console.log("Banco já possui alunos cadastrados. Seed de alunos/aulas não executado.");
    return;
  }

  const clientes = [
    { nome: "Maria Silva", contato: "(11) 98765-4321" },
    { nome: "João Santos", contato: "(11) 98765-4322" },
    { nome: "Ana Costa", contato: "(11) 98765-4323" },
    { nome: "Pedro Lima", contato: "(11) 98765-4324" },
  ];
  const criados = await Cliente.bulkCreate(clientes);

  const hoje = new Date();
  const formatarData = (d) => d.toISOString().slice(0, 10);
  const calcularDataEmDias = (n) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() + n);
    return formatarData(d);
  };

  await Aula.bulkCreate([
    { data: calcularDataEmDias(1), horario: "09:00", id_cliente: criados[0].id_cliente, tipo_aula: "Yoga" },
    { data: calcularDataEmDias(2), horario: "14:00", id_cliente: criados[1].id_cliente, tipo_aula: "Treinamento Funcional" },
    { data: calcularDataEmDias(3), horario: "10:00", id_cliente: criados[2].id_cliente, tipo_aula: "Yoga" },
    { data: calcularDataEmDias(4), horario: "16:00", id_cliente: criados[3].id_cliente, tipo_aula: "Treinamento Funcional" },
  ]);

  console.log("Seed de alunos e aulas concluído com sucesso.");
}

popularBanco()
  .then(() => process.exit(0))
  .catch((erro) => {
    console.error("Erro ao executar o seed:", erro);
    process.exit(1);
  });
