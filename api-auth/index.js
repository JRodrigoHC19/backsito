const env = require('./config');
const { sequelize } = require('./database/connection');
const { User, Client, Company } = require('./models');
const express = require('express');
const routes = require('./routes.js');
const app = express();

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong, please try again later' });
});

// Routes
app.get('/', (req, res) => res.json({ message: 'API is running!' }));
app.use('/api/users', routes);

sequelize
    .authenticate()
    .then( function () {
        console.log("Database Connection Successful!");
        return sequelize.sync();
    })
    .then(function () {
        console.log("Sync Models");
        app.listen(env.PORT, env.HOST, function () { 
            console.log('Server Initialized!');
            console.log(`URL: http://${env.HOST}:${env.PORT}`);
        });
    })
    .catch(function (err) {
        console.log("Error connecting to database: ", err);
    });
