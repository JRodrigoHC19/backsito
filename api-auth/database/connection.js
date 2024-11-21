const env = require('../config');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    env.PSQL_DATABASE, 
    env.PSQL_USERNAME, 
    env.PSQL_PASSWORD,
    {
        host: env.PSQL_HOST, 
        port: env.PSQL_PORT,
        dialect: 'postgres'
    }
);

module.exports = {
    sequelize
};