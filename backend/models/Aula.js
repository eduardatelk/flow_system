const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

class Aula extends Model {}

Aula.init(
  {
    id_aula: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    horario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo_aula: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Aula",
    tableName: "aulas",
    timestamps: false,
  }
);

module.exports = Aula;
