const sequelize = require("../db/sequelize");
const Cliente = require("./Cliente");
const Aula = require("./Aula");
const Usuario = require("./Usuario");

Cliente.hasMany(Aula, { foreignKey: "id_cliente", onDelete: "CASCADE" });
Aula.belongsTo(Cliente, { foreignKey: "id_cliente" });

module.exports = { sequelize, Cliente, Aula, Usuario };
