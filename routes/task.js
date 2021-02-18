const controllers = require('../controllers');
const router = require('express').Router();
const { auth } = require('../utils');

router.get('/getAll', controllers.task.getAll);

router.get('/getOne/:id', auth(), controllers.task.getOne);

router.post('/create', auth(), controllers.task.create);

router.patch('/workersIn/:id', auth(), controllers.task.workersIn);

router.put('/updTask/:id', auth(), controllers.task.updTask);

router.delete('/delete/:id', auth(), controllers.task.delete);

module.exports = router;