const config = require('./config/config');
const dbConnection = require('./config/database');
const express = require('express');

const app = express();

dbConnection().then(() => {
    
    app.use(express.json())
    app.use(express.urlencoded({
        extended: true
    }));

    require('./config/routes')(app);

    app.use(function (err, req, res, next) {
        console.error(err);
        res.status(500).send(err.message);
    });

    app.listen(config.port, console.log(`Listening on port ${config.port}!`))

}).catch(console.error);