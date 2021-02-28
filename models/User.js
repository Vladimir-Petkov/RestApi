const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new mongoose.Schema({
    email: {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: props => `${props.value} is not a valid email format!`
        }
    },

    password: {
        type: mongoose.Schema.Types.String,
        require: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{10,}$/.test(v);
            },
            message: props => `${props.value} is not a valid password format!`
        }
    },

    firstName: {
        type: mongoose.Schema.Types.String
    },

    lastName: {
        type: mongoose.Schema.Types.String
    },

    genre: {
        type: mongoose.Schema.Types.String
    },

    adress1: {
        type: mongoose.Schema.Types.String
    },

    adress2: {
        type: mongoose.Schema.Types.String
    },

    emailNumberValidation: {
        type: mongoose.Schema.Types.String
    },

    emailNumberValidationTime: {
        type: mongoose.Schema.Types.Date,
        default: Date.now()
    }
});

userSchema.methods = {
    matchPassword: function (password) {
        return bcrypt.compare(password, this.password);
    }
};

userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(this.password, salt, (err, hash) => {
                if (err) { next(err); return }
                this.password = hash;
                next();
            });
        });
        return;
    }
    next();
});

module.exports = new mongoose.model('User', userSchema);