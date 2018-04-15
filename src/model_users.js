const Sequelize = require('sequelize');
const sequelize = require('./seq_db_connect');

const users = sequelize.define('users', {
  id_user: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  email: Sequelize.STRING
})

module.exports = users;