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
  email: Sequelize.STRING,
  pswd_token: Sequelize.STRING,
  date_reset: Sequelize.DATE,
  secret_key: Sequelize.STRING,
  two_fa: Sequelize.ENUM('disable', 'enable'),
  url_qr: Sequelize.STRING
})

module.exports = users;