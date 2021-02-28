const router = require('../routes/');

module.exports = (app) => {

    app.use('/api/v1/user', router.user);

    app.use('/api/v1/task', router.task);

    app.use('*', (req, res, next) => res.send('<h1> Something went wrong. Try again. :thumbsup: </h1>'))
};