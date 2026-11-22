const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

class Cliente extends Model {}

Cliente.init(
  {
    id_cliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contato: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Cliente",
    tableName: "clientes",
    timestamps: false,
  }
);

module.exports = Cliente;
