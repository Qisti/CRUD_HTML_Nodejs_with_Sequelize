const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const alert = require('alert-node');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require ('connect-flash');
const sess = require('express-session');
const BetterMemoryStore = require('session-memory-store')(sess);
const async = require('async');
const crypto = require('crypto');
const connection = require('./src/db_connect');
const sequelize = require('./src/seq_db_connect');
const config = require('./conf/config');
const app = express();
const moment = require('moment');
const validator = require('express-validator');
app.locals.moment = require('moment');
const Joi = require('joi');
const Sequelize = require('sequelize');
var expressJoi = require('express-joi');

const index = require('./routes/index');
const users = require('./routes/users');
const students = require('./routes/students');
const statistic = require('./routes/statistic');
const admin = require('./routes/admin');
const login = require('./routes/login');
const register = require('./routes/register')

const student = require('./src/model_students');
const user = require('./src/model_users');
var twoFactor = require('node-2fa');
const qr = require('qr-image')

// var edit = require('./routes/edit');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(validator());

// app.use(express.methodOverride());
// app.use(express.bodyParser());
// app.use(app.router);
// app.use(errorHandler);

// app.use(session({ secret: 'session secret key' }));
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// var getUsersSchema = {
//   limit: expressJoi.Joi.types.Number().integer().min(1).max(25),
//   offset: expressJoi.Joi.types.Number().integer().min(0).max(25),
//   name: expressJoi.Joi.types.String().alphanum().min(2).max(25)
// };

// var newSecret = twoFactor.generateSecret({name: 'users', account: 'username'})
// var newToken = twoFactor.generateToken('2RIG7RJDDALIR2BCPAX7JNJ4MXICSC7Z')

// app.get('/coba', function(req, res, next) {
//   console.log(newSecret);
//   var qrcode = qr.image(newSecret.uri)
//   res.send(qrcode);
// })

var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var store = new BetterMemoryStore({ expires: 60 * 60 * 1000, debug: true });
app.use(sess({
  name: config.sess.name,
  secret: config.sess.secret,
  store:  store,
  resave: true,
  saveUninitialized: true
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
var pass;

passport.use('local', new LocalStrategy({
  username: 'username',
  password: 'password',

  passReqToCallback: true} , 
  function (req, username, password, done){
    if(!username || !password ) { 
      alert('Username or password required are required !');
      return done(null, false);
    } 

    user.findAll({
      where: {
        username: [username]
      }
    }).then(function(rows, err) {
      if(!rows.length){ return done(null, false, req.flash('message','Invalid username.')); }
      var dbPassword  = rows[0].password;
      console.log('dbpw = ', dbPassword)
      console.log('pass = ', password)
      console.log(username);
      salt = config.salt+''+password;
      var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
      var dbPassword  = rows[0].password;
      if(!(dbPassword == encPassword)){
        if(err) throw err;
        alert('Invalid username or password'); 
        return done(null, false);
      }
      return done(null, rows[0]);
    }).catch(function(err) {
      console.log(err)
    })

    // connection.query("select * from users where username = ?", [username], function(err, rows){
    //   console.log(rows);
    //   if (err) return done(req.flash('message',err));
    //   if(rows.length<0){ 
    //     alert('Invalid username or password !');
    //     return done(null, false); 
    //   }
    //   salt = config.salt+''+password;
    //   var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
    //   var dbPassword  = rows[0].password;

    //   if(!(dbPassword == encPassword)){
    //     if(err) throw err;
    //     alert('Invalid username or password'); 
    //     return done(null, false);
    //   }
    //   return done(null, rows[0]);
    // });
  }
  ));

passport.serializeUser(function(user, done){
  done(null, user.id_user);
});

passport.deserializeUser(function(id_user, done){
  connection.query("select * from users where id_user = ? ", [id_user], function (err, user){
    if (err) return done(err);  
    done(null, user);
  });
});


app.get('/',function(req,res){
  res.render('login');
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("gagal login"); 
  res.redirect('/login');
}

app.use('/', index);
app.use('/statistic/', isAuthenticated, statistic);
app.use('/admin/',isAuthenticated, admin);
app.use('/students',isAuthenticated, students);
app.use('/login', login);
app.use('/register', register);

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