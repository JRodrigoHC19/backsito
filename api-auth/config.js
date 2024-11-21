const path = require('node:path');

// Importar Variables de Entorno
require('dotenv').config({
    path: path.resolve(__dirname, 'auth.env')
});


module.exports = {
    HOST: process.env.HOST || '0.0.0.0',
    PORT: process.env.PORT || 3000,
    PSQL_DATABASE: process.env.PSQL_DATABASE || "tecsup",
    PSQL_USERNAME: process.env.PSQL_USERNAME || "postgres",
    PSQL_PASSWORD: process.env.PSQL_PASSWORD || "c0tras3naS3gur@",
    PSQL_HOST: process.env.PSQL_HOST || "db-psql",  // localhost
    PSQL_PORT: process.env.PSQL_PORT || "5432",
}