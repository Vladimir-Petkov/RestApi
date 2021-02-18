const models = require('../models');

module.exports = {
    getAll: (req, res, next) => {
        models.Task.find()
            .then((tasks) => res.send(tasks))
            .catch(next);
    },

    getOne: function (req, res, next) {
        const { id } = req.params;
        
        models.Task.findById(id)
            .then((task) => res.send(task))
            .catch(next);
    },

    workersIn: (req, res, next) => {
        const { id } = req.params;
        const pplWorkingIn = req.body;

        models.Task.findByIdAndUpdate(id, { pplWorkingIn })
            .then(updTask => {
                res.send(updTask);
            })
            .catch(next)
    },

    create: (req, res, next) => {
        const { title, description, taskColum, pplWorkingIn } = req.body;
        const { _id } = req.user;

        models.Task.create({ title, description, taskColum, pplWorkingIn, creatorId: _id, })
            .then((createdTask) => {
                return Promise.all([
                    models.User.updateOne({ _id }, { $push: { task: createdTask } }),
                    models.Task.findOne({ _id: createdTask._id })
                ]);
            })
            .then(([modifiedObj, tripObj]) => {
                res.send(tripObj);
            })
            .catch(next);
    },

    updTask: (req, res, next) => {
        const { id } = req.params;
        const { title, description, taskColum, pplWorkingIn } = req.body;
        const { _id } = req.user;

        models.Task.findByIdAndUpdate(id, { title, description, taskColum, pplWorkingIn, creatorId: _id, })
            .then((updatedTask) => res.send(updatedTask))
            .catch(next)
    },

    delete: (req, res, next) => {
        const { id } = req.params;

        models.Task.findByIdAndRemove(id)
            .then((removedTrip) => res.send(removedTrip))
            .catch(next)
    }
};