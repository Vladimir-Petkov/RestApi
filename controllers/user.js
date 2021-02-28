const models = require('../models');
const config = require('../config/config');
const utils = require('../utils');
const mail = require('../utils/mail');

module.exports = {
    get: {
        allUsers: (req, res, next) => {
            models.User.find({})
                .then((users) => res.send(users))
                .catch((err) => res.status(500).send("Error"));
        },

        userById: (req, res, next) => {
            const { id } = req.params;

            models.User.findById(id)
                .then((user) => res.send(user))
                .catch((err) => res.status(500).send("Error"));
        },

        resetPassword: (req, res, next) => {
            const { email } = req.body;
            console.log(email);

            crypto.randomBytes(32, (err, buffer) => {
                if (err) {
                    console.log(err);
                    res.send('error message');
                }

                const token = buffer.toString('hex');

                models.User.findOne({ email })
                    .then(user => {
                        if (!user) {
                            res.send('no registered user')
                        }
                        user.resetToken = token;
                        user.resetTokenTime = Date.now() + 3600000;
                        return user.save();
                    })
                    .then(result => {
                        res.send("Password reset");
                        mail.sendMail({
                            to: email,
                            from: 'qkubu25@gmail.com',
                            subject: 'Password reset',
                            html: `
                            <p>You registered a password reset</p>
                            <p>Click this <a href="http://localhost:3000/api/user/reset/${token}">link</a> to set a new password</p>
                            `
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).send("Error");
                    })
            })
        },
    },

    post: {
        register: (req, res, next) => {
            const { email, password } = req.body;
            const number = Math.floor(100000 + Math.random() * 900000);

            models.User.create({ email, password, emailNumberValidation: number })
                .then((createdUser) => {
                    const token = utils.jwt.createToken({ id: createdUser._id });
                    res.header("Authorization", token).send(createdUser);

                    mail.sendMail({
                        to: email,
                        from: 'qkubu25@gmail.com',
                        subject: 'Validation email',
                        html: `
                        <p>You registered in our website</p>
                        <p>${number}</p>
                        `
                    })
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send('Error');
                })
        },

        verifyNumber: (req, res, next) => {
            const { email, verifyNumber } = req.body;

            models.User.findOne({ email: email, emailNumberValidation: verifyNumber })
                .then((user) => {
                    user.emailNumberValidation = undefined
                    user.emailNumberValidationTime = undefined;
                    return user.save();
                })
                .then(() => {
                    res.send('True');
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send('Error');
                })
        },

        login: (req, res, next) => {
            const { username, password } = req.body;
            models.User.findOne({ username })
                .then((user) => Promise.all([user, user.matchPassword(password)]))
                .then(([user, match]) => {
                    if (!match) {
                        res.status(401).send('Invalid password');
                        return;
                    }

                    const token = utils.jwt.createToken({ id: user._id });
                    res.header("Authorization", token).send(user);
                })
                .catch(next);
        },

        resetPassword: (req, res, next) => {
            const { email } = req.body;
            const { newPassword } = req.body;
            const { token } = req.params;

            models.User.findOne({ email: email, resetToken: token, resetTokenTime: { $gt: Date.now() } })
                .then((user) => {
                    user.password = newPassword
                    user.resetToken = undefined;
                    user.resetTokenTime = undefined;
                    console.log(user);
                    return user.save();
                })
                .then((user) => {
                    console.log(user);
                    res.send('Successful reset password');

                    mail.sendMail({
                        to: user.email,
                        from: 'qkubu25@gmail.com',
                        subject: 'Successful reset password',
                        html: '<h1>Successful reset password</h1>'
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error");
                })
        },

        logout: (req, res, next) => {
            const token = req.cookies[config.authCookieName];
            models.TokenBlacklist.create({ token })
                .then(() => {
                    res.clearCookie(config.authCookieName).send('Logout successfully!');
                })
                .catch(next);
        }
    },

    put: {
        updateUser: (req, res, next) => {
            const id = req.params.id;
            const { email, password } = req.body;

            models.User.update({ _id: id }, { email, password })
                .then((updatedUser) => res.send(updatedUser))
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error");
                })
        },
    },

    delete: {
        deleteUser: (req, res, next) => {
            const { id } = req.params;

            models.User.findOneAndDelete({ _id: id })
                .then((deletedUser) => res.send("You successful Delete"))
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error");
                })
        },
    }
};