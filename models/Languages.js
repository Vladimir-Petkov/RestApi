const mongoose = require('mongoose');

const languagesShema = new mongoose.Schema({
    en: {
        type: mongoose.Schema.Types.String,
        default: 'en'
    },
    de: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    bg: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    tr: {
        type: mongoose.Schema.Types.Array,
        required: true
    },

    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = new mongoose.model('Languages', languagesShema);