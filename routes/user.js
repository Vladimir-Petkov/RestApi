const controllers = require('../controllers/');
const router = require('express').Router();

router.get('/', controllers.user.get.allUsers);

router.post('/register', controllers.user.post.register);

router.post('/verifyNumber', controllers.user.post.verifyNumber);

router.post('/login', controllers.user.post.login);

router.get('/reset', controllers.user.get.resetPassword);

router.post('/reset/:token', controllers.user.post.resetPassword);

router.delete('/delete/:id', controllers.user.delete.deleteUser);

router.post('/logout', controllers.user.post.logout);

router.get('/:id', controllers.user.get.userById);

module.exports = router;