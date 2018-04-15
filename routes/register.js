const express = require('express');
const router = express.Router();
const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');
const alert = require('alert-node');
const connection = require('../src/db_connect');
const config = require('../conf/config');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.get('/', function(req, res) {
    res.render('register');
  })

  app.post('/verifyAccount', function(req, res, next) {
    var email = req.body.email;
    var username = req.body.username;
    console.log(email);
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        var email = req.body.email;
        var username = req.body.username;
        connection.query('SELECT * FROM users WHERE email = ?', email, function(err, rows) {
          if(err) throw err;
          console.log(rows.length);
          // if(rows.length > 0) {
          //   alert('Email has been registered !');
          //   // req.flash('error', 'No account with that email address exists.');
          // } else {
          console.log(token);
  
          var swd_token = token;
          var ate_reset = moment().toDate();
          var resetPswd = {
            pswd_token: swd_token, date_reset: ate_reset
          }
  
          console.log(resetPswd);
  
        //   connection.query('update users set ? where email = ?', [resetPswd, email], function(err, rows) {
        //     if(err) throw err;
        //     console.log("token di set token :", swd_token);
        //     console.log(rows);
        //     done(err, token, rows);
        //     alert("Check your email to verify your email!");
        //   });
        
        connection.query('INSERT INTO users (username, email, pswd_token) VALUES (? , ?, ? )', [username, email, swd_token], function(err, res) {
              if(err) console.log("ERRRR2");
              console.log('Insert email sama username ke tabel user');
              done(err, token, rows);
              alert("Check your email to verify your email!");
          })

        res.redirect('/login')
        // }
        });  
      },
      function(token, rows, done) {
        var mailOptions = {
          to: email,
          from: config.register_message.from,
          subject: config.register_message.subject_register,
          text: config.register_message.text_register1 + 'http://' + req.headers.host + '/register/next/' + token + '\n\n' + config.register_message.text_register2
        };
        console.log("proses kirim");
        sgMail.send(mailOptions, function(err) {
          // done(err, 'done');
        });
      }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/login');
      });
  });

  app.get('/register_next', function(req, res) {
    res.render('register_next');
  })

  app.get('/next/:token', function(req, res){

    // var username = req.body.username;

    connection.query('SELECT * FROM users WHERE pswd_token = ? ', [req.params.token], function(err, rows, fields) {
      if(err) throw err;
      console.log(username);
      if(rows.length <= 0) {
        alert("Token is invalid !");
        console.log("token belumbisa masuk");
      }
  
      var username = rows[0].username;
      var email = rows[0].email;
      res.render('register_next', {susername: username, stoken: req.params.token, semail: email});
      console.log(username);
    });
  });

  app.post('/next/:token', function(req, res) {
    var username = req.body.username;
    console.log("masuk ke post");
    async.waterfall ([
      function(done) {
        connection.query('SELECT * from users where pswd_token = ?', [req.params.token], function(err, rows) {

        console.log("hasil select 2", rows);

        var username = req.body.username;
        // var email = req.body.email;
        var password2= req.body.password2;
        var password = req.body.password;
        var spassword = config.salt+''+password;
        var dpassword = crypto.createHash('sha1').update(spassword).digest('hex')

        // var val = validator_email.validate(email);

        connection.query('UPDATE users SET password = ? WHERE username = ?', [dpassword, username], function(err, res) {
            if (err) console.log("ERR4");
            console.log("admin berhasil ditambah");
            alert("Succes input admin !"); 
            
        });
        // res.redirect('/students');
  
        //   var reset = {pswd_token: swd_token, date_reset: ate_reset}
        //   connection.query('INSERT INTO users (username, password, email) VALUES ', [username, spassword, email], function(err, rows) {
        //     if(err) console.log("ERRRRRR");
        //     console.log("berhasil register")
        //     console.log("rows", rows);
        //   });
  
        //   console.log(username);
        //   connection.query('select * from users where username = ?', [username], function(err, rows) {
        //     done(err, rows);
        //   });
        });
      },
      function(rows, done) {
        console.log("yang ke 3 :", rows)
        var optnMsg = {
          to: rows[0].email,
          from: config.message.from,
          subject: config.message.subject_success,
          text: config.message.text_confirm
        };
        sgMail.send(optnMsg, function(err) {
          console.log("email sudah dikirim");
          done(err, 'done');
        });
      }, 
      ], function(err) {
       if (err) return next(err);
        res.redirect('/login/proseslogin');
      //   passport.authenticate('local', {
      //     successRedirect: '/students',
      //     failureRedirect: '/login',
      //     failureFlash: true
      // }), function(req, res, info){
      //     res.render('index',{'message' :req.flash('message')});
      //     console.log("gimana ini?")
      //     // res.redirect('/students');
      // }
      })
      // res.('/login/proseslogin');
  });

module.exports = app;