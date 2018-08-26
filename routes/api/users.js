let mongoose = require('mongoose');
let router = require('express').Router();
let passport = require('passport');
let User = mongoose.model('User');
let auth = require('../../config/auth');
let globalFunction = require('../../config/constantFunc');
let mailer = require('../../Services/emailService');
//let Promise = require('bluebird')




exports.userLogout = function (req, res, next) {
    let token = globalFunction(req);
    User.findOne({access_token: token}).then(function(user) {
        if (!user || user.access_token  ==  null || !(token === user.access_token)) {
            res.status(401).json({message: "session expire"})
        }
        user.access_token = null;
        user.save().then(function () {
            res.status(200).json({message: "User logout successfully."})
        }).catch(next)
    }).catch(next)
}

exports.updateUser = function (req, res, next) {
    let token = globalFunction(req);
    let payload = req.body;

    if (payload.username) {
        res.status(400).json({'message': 'username is not allowed.'});
        return
    }
    if (payload.email) {
        res.status(400).json({'message': 'Email is not allowed.'});
        return

    }
    if (payload.password) {
        res.status(400).json({'message': 'Password is not allowed.'});
        return
    }

    User.findOne({access_token: token}).then(function(user) {
        if (!user || user.access_token  ==  null || !(token === user.access_token)) {
            res.status(401).json({message: "session expire"})
        }
        user.updateUser(payload).then(function () {
            res.status(200).json({message: "User updated successfully."})
        }).catch(next)
    }).catch(next)
}
exports.changePassword = function (req, res, next) {
    let token = globalFunction(req);
    let payload = req.body;

    if (!payload.current_password) {
        res.status(400).json({'message': 'current_password is required.'});
        return
    }
    if (!payload.new_password) {
        res.status(400).json({'message': 'new_password is required.'});
        return
    }

    User.findOne({access_token: token}).then(function(user) {
        if (!user || user.access_token  ==  null || !(token === user.access_token)) {
            res.status(401).json({message: "session expire"})
        }
        let status = user.changePassword(payload);

        switch (status) {
            case 0:
                res.status(200).json({message: "Password change successfully."});
                break;
            case 1:
                res.status(200).json({message: "New password can not be same as current password."});
                break;
            case 2:
                res.status(400).json({message: "Current Password is incorrect."});
                break;
            default:
                res.status(400).json({message: "Something went wrong."});
                break;
        }
    }).catch(next)

}

exports.singupUser = function (req, res, next) {

    let user = new User();
    user.username = req.body.username;
    user.email = req.body.email;
    user.setPassword(req.body.password);

    user.save().then(function(){
        mailer(user);
        return res.json(user.toAuthJSON());
    }).catch(next);
}

exports.login = function (req, res, next) {
    if (!req.body.email) {
        res.status(400).json({'message': 'email is required'})
    }
    if (!req.body.password) {
        res.status(400).json({'message': 'password is required'})
    }

    passport.authenticate('local', {sesssion: false}, function (error, user, info) {
        if (error) {
            next(error)
        }
        if (user) {
            user.token = user.generateJWT();
            return res.json(user.toAuthJSON());
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
}