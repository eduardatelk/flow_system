const path = require("path");
const { Sequelize } = require("sequelize");

function criarConexao() {
  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectModule: require("pg"),
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
      logging: false,
    });
  }

  return new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "flow.sqlite3"),
    logging: false,
  });
}

module.exports = criarConexao();
