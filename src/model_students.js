const Sequelize = require('sequelize');
const sequelize = require('./seq_db_connect');

const students = sequelize.define('students', {
    id_student: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: Sequelize.STRING,
    gender: Sequelize.ENUM('m', 'f'),
    date_of_birth: Sequelize.DATE,
    address: Sequelize.STRING,
    mail: Sequelize.STRING

  })

module.exports = students;