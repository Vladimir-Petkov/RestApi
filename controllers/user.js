const models = require('../models');
const config = require('../config/config');
const mail = require('../utils/mail');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

module.exports = {
    get: {
        userById: (req, res, next) => {
            const { id } = req.params;

            models.User.findById(id)
                .then((user) => res.send(user))
                .catch((err) => res.status(500).send("Error"));
        },

        resetPassword: (req, res, next) => {
            const { email } = req.body;

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
                        user.resetTokenTime = Date.now() + 360000;
                        return user.save();
                    })
                    .then(result => {
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
                    .catch()
            })
        },
    },

    post: {
        register: (req, res, next) => {
            const { email, password, site } = req.body;

            models.User.create({ email, password, site })
                .then((createdUser) => {

                    let userObj = {};

                    userObj._id = createdUser._id;
                    userObj.email = createdUser.email;
                    userObj.site = createdUser.site;

                    res.send(userObj);
                })
                .catch((err) => {
                    console.log(err);
                    next(err);
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
                    let userObj = {};
                    userObj._id = user._id;
                    userObj.email = user.email;
                    userObj.site = user.site;

                    res.send(userObj);

                    mail.sendMail({
                        to: email,
                        from: 'qkubu25@gmail.com',
                        subject: 'successful login',
                        html: '<h1>You successful login</h1>'
                    })
                })
                .catch(next);
        },

        resetPassword: (req, res, next) => {
            const { newPassword } = req.body;
            const { resetToken } = req.params;

            models.User.findOne({ resetToken })
                // .then(user => {
                //     resetUser = user;
                //     // return bcrypt.hash(newPassword, 10);
                // })
                .then(user => {
                    console.log(user);
                    user.password = newPassword
                    user.resetToken = undefined;
                    user.resetTokenTime = undefined;
                    user.save();
                    res.send('Successful reset password')

                    mail.sendMail({
                        to: user.email,
                        from: 'qkubu25@gmail.com',
                        subject: 'Successful reset password',
                        html: '<h1>Successful reset password</h1>'
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.send(err)
                })
        },

        logout: (req, res, next) => {
            res.send('Logout successfully!');
        }
    },

    put: (req, res, next) => {
        const id = req.params.id;
        const { email, password } = req.body;

        models.User.update({ _id: id }, { email, password })
            .then((updatedUser) => res.send(updatedUser))
            .catch(next)
    },
};