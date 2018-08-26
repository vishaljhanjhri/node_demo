var mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');
let crypto = require('crypto');
let jwt = require('jsonwebtoken');
let secret = require('../config/config').secret;

let UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    bio: { type: String, default: "" },
    phone_number: { type: String, default: "" },
    country_code: { type: String, default: "" },
    full_name: { type: String, default: "" },
    access_token: { type: String, default: null },
    image: { type: String, default: 'https://static.productionready.io/images/smiley-cyrus.jpg' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hash: String,
    salt: String
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});


UserSchema.methods.validPassword = function(password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function() {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
    }, secret);
};

UserSchema.methods.toAuthJSON = function(){

    let new_token = this.generateJWT();
    this.access_token = new_token;
    this.save();

    let obj = this.toProfileJSONFor();
    obj.access_token = this.access_token;

    return obj
};
UserSchema.methods.updateUser = function(body) {
        this.bio = body.bio;
        this.full_name = body.full_name;
        this.image = body.image;

        return this.save()
};

UserSchema.methods.changePassword = function(body) {
    if (this.validPassword(body.current_password)) {
        if (this.validPassword(body.new_password)) {
            return 1
        }
        this.setPassword(body.new_password);
        this.save();
        return 0
    } else {
        return 2
    }
};

UserSchema.methods.toProfileJSONFor = function(user){
    return {
        username: this.username,
        bio: this.bio,
        full_name: this.full_name,
        email: this.email,
        lastUpdated: this.updatedAt,
        image: this.image,
        id: this._id,
        following: user ? user.isFollowing(this._id) : false,
    };
};

UserSchema.methods.favorite = function(id){
    if(this.favorites.indexOf(id) === -1){
        this.favorites.push(id);
    }

    return this.save();
};

UserSchema.methods.unfavorite = function(id){
    this.favorites.remove(id);
    return this.save();
};

UserSchema.methods.isFavorite = function(id){
    return this.favorites.some(function(favoriteId){
        return favoriteId.toString() === id.toString();
    });
};

UserSchema.methods.follow = function(id){
    if(this.following.indexOf(id) === -1){
        this.following.push(id);
    }

    return this.save();
};

UserSchema.methods.unfollow = function(id){
    this.following.remove(id);
    return this.save();
};

UserSchema.methods.isFollowing = function(id){
    return this.following.some(function(followId){
        return followId.toString() === id.toString();
    });
};

mongoose.model('User', UserSchema);
