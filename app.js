var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');

require('./models/Docs');
require('./models/Users');
require('./config/passport');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use('/public/javascripts', express.static(path.join(__dirname, '/public/javascripts')));
app.use('/public/stylesheets', express.static(path.join(__dirname, '/public/stylesheets')));
app.use('/public/fonts', express.static(path.join(__dirname, '/public/fonts')));
app.use('/bower_components/jquery/dist', express.static(path.join(__dirname, '/bower_components/jquery/dist')));

//Bower components
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

app.use('/', routes);
app.use('/users', users);

//mongoose.connect('mongodb://localhost/vault');
mongoose.connect('mongodb://marcelstaro@gmail.com:n2KwTdSq6DkGM89w@ds063809.mongolab.com:63809/heroku_app36265103');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;