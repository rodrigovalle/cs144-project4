var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var blog = require('./routes/blog');
var login = require('./routes/login');
var api = require('./routes/api');
var authenticate = require('./routes/authenticate');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.locals.secret = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());

app.use('/edit', authenticate('/login?redirect=/edit'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/blog', blog);
app.use('/login', bodyParser.urlencoded({ extended: false }));
app.use('/login', login);
app.use('/api', authenticate());
app.use('/api', bodyParser.json());
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
