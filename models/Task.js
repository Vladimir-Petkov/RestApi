const mongoose = require('mongoose');

const taskShema = new mongoose.Schema({
    title: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    description: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    taskColum: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    pplWorkingIn: {
        type: mongoose.Schema.Types.Array,
        required: true
    },

    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = new mongoose.model('Task', taskShema);