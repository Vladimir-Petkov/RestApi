const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

module.exports = transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: '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'
    }
}));