const models = require('../models');
const config = require('../config/config');
const mail = require('../utils/mail');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

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
            const { email, password, site } = req.body;

            models.User.create({ email, password, site })
                .then((createdUser) => {
                    res.send(createdUser);
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send("Error")
                })
        },

        login: (req, res, next) => {
            const { email, password } = req.body;

            models.User.findOne({ email })
                .then((user) => Promise.all([user, user.matchPassword(password)]))
                .then(([user, match]) => {
                    if (!match) {
                        res.status(401).send('Invalid password');
                        return;
                    }

                    res.send(user);

                    mail.sendMail({
                        to: email,
                        from: 'qkubu25@gmail.com',
                        subject: 'successful login',
                        html: '<h1>You successful login</h1>'
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error");
                });
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
            res.send('Logout successfully!');
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