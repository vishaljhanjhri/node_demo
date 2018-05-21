let mongoose = require('mongoose');
let router = require('express').Router();
let passport = require('passport');
let User = mongoose.model('User');
let auth = require('../config/auth');
let globalFunction = require('../config/constantFunc');
let mailer = require('../Services/emailService');

let users = require('./api/users');

 //////
////// User api's
router.post('/user/signup', function(req, res, next) { users.singupUser(req, res, next) });
router.post('/user/login', function(req, res, next) { users.login(req, res, next) });
router.post('/user/logout', auth.required, function(req, res, next) { users.userLogout(req, res, next) });
router.post('/user/update', auth.required, function(req, res, next) { users.updateUser(req, res, next) });
router.post('/user/changePassword', auth.required, function(req, res, next) { users.changePassword(req, res, next) });


router.get('/getAllUsers', function(req, res, next) { getAllUser(req, res, next) });




function getAllUser(req, res, next) {
    let token = globalFunction(req);
    // User.findOne({access_token: token}).then(function(user){

    //     if (!user || user.access_token  ==  null || !(token === user.access_token)) {
    //         res.status(401).json({message: "session expire"})
    //     }
        
    // }).catch(next)
       let userarray = [];
        User.find().then(function (list) {
            for (let i = 0; i < list.length; ++i) {
                let object = User(list[i]).toProfileJSONFor();
                userarray.push(object)
            }
            res.status(200).json({'users': userarray})

        }).catch(next)
}



module.exports = router;