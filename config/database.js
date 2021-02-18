const mongoose = require('mongoose');
const config = require('./config');
const dbName = 'BlockPosts';

module.exports = () => {
    return mongoose.connect(config.dbURL + dbName, { useNewUrlParser: true, useUnifiedTopology: true });
};