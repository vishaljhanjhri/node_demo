let http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');


let config = require('./config/config')
var isProduction = process.env.NODE_ENV === 'production';
// Create global app object
var app = express();

// app.use(cors());
//
// // Normal express config defaults
// app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'mongo_dev', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
    app.use(errorhandler());
}

if(isProduction){
    mongoose.connect('mongodb://dev529:vishal12@ds137110.mlab.com:37110/mongo_dev')
} else {
    mongoose.connect('mongodb://dev_user:123456@ds137110.mlab.com:37110/mongo_dev');
    mongoose.set('debug', false);
}
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("Mongo DB is now connected..");
});

require('./model/User');
require('./config/passport');

app.use(require('./routes'));


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
    app.use(function(err, req, res, next) {
        console.log(err.stack);

        res.status(err.status || 500);
        res.json({
                 'message': err.message,
                 'status': 400

        })
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        'message': err.message,
        'status': 400
    })
});

// finally, let's start our server...
var server = app.listen( config.port, function(){
    console.log('Listening on port ' + server.address().port);
});
