const mongoose = require('mongoose');
const _ = require('loadash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/* JWT secret */
const jwtSecret = "k3FoW8nXJ95k0t17V@KRUhpX6MLTru6@BEXxMASzuOi74*gOdE!X6RN25!CIObp7"

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});

/*  Instances  */
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    return _.omit(userObject, ['password', 'sessions']);
}

/*  Generate Access Token */
UserSchema.methods.generateAccessAuthToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        jwt.sign({_id: user._id.toHexString() }, jwtSecret, {expiresIn: "15m "}, (err, token) => {
            if (!err) {
                resolve(token);
            } else {
                reject();
            }
        })
    })
}

/* Generate Refresh Token */
UserSchema.methods.generateRefreshAuthToken = function() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                let token = buf.toString('hex');
                return resolve(token);
            }
        })
    })
}

/* Create Session */
UserSchema.methods.createSession = function() {
    let user = this;
    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Could not save session to database' + e);
    })
}

/* Model methods */
UserSchema.statics.findByIdAndToken = function(_id, token) {
    const user = this;
    return user.findOne({
        _id,
        'session.token': token
    });
}

UserSchema.statics.findByCredentials = function(email, password) {
    let user = this;
    return User.findOne({ email}).then((user) => {
        if (!user) return Promise.reject();
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) resolve(user);
                else {
                    reject();
                }
            })
        })
    })

}

/* Hash the passwords */
UserSchema.pre('save', function (next) {
    let user = this;
    let costFactor = 10;

    if(user.isModified('password')) {
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

/* Helper methods for chaining sessions */
let saveSessionToDatabase = (user, refreshToken) => {
    return new Promise((resolve, reject) => {
        let expiresAt = generarateRefreshTokenExpiriyTime();
        user.sessions.push({ 'token': refreshToken, expiresAt });
        user.save().then(() => {
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        });
    })
}

let generarateRefreshTokenExpiriyTime = () => {
    let daysUntilExpire = '10';
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}