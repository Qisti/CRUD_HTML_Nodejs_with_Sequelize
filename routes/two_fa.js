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
const Sequelize = require('sequelize');
const sequelize = require('../src/seq_db_connect');
const user = require('../src/model_users');
const twoFactor = require('node-2fa');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.get('/', function(req, res){
    res.render('login')
});

router.get('/two-fa', function(req, res) {
  // console.log("gak bisa masuk")
  // // console.log('username ',req.params.username )
  //  var f = req.flash('username');
  //  console.log(f.toString())
   res.render('two_fa')
 })

router.post('/two_fa', function(req, res) {
  console.log(req.body.username)
  user.findAll({
    where: {
      username: [req.body.username]
    }
  }).then(function(rows) {
    var verifytoken = twoFactor.verifyToken(rows[0].secret_key, req.body.token);
    console.log(req.body.token)
    var newToken = twoFactor.generateToken(rows[0].secret_key)
    console.log(newToken)
    if(verifyToken !== null) {
      user.findOne({
        where: {
          username: [req.body.username]
        },
        attributes: ['id', 'username', 'password']
      }).then(user => 
      req.login(user, function(err) {
        if(err) {
          alert("Login failed");
        }
        res.redirect('/students')
      })
    )
    } else {
      res.render('/admin/two_fa')
    }
  }).catch(error => {
    res.render('/admin/two_fa')
  })
})


app.post('/setPassword', function(req, res, next) {
    var email = req.body.email;
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
        connection.query('SELECT * FROM users WHERE email = ?', email, function(err, rows) {
          if(err) throw err;
          console.log(rows.length);
          if(rows.length <= 0) {
            alert('Email not registered !');
            // req.flash('error', 'No account with that email address exists.');
          }
          console.log(token);
  
          var swd_token = token;
          var ate_reset = moment().toDate();
          var resetPswd = {
            pswd_token: swd_token, date_reset: ate_reset
          }
          // var insertUser = {
          //   username: req.body.username,
          //   email: req.body.email,
          //   pswd_token: swd_token,
          //   date_reset: ate_reset
          // };

          // user.findOne({
          //   where: {
          //     username: username,
          //     email: email
          //   }
          // }).then(function(User, err) {
          //   if (User) {
          //     alert('This username or email has already used!');
          //   } else {
          //     user.create(insertUser)
          //      .then(function(User, err) {
          //        done(err, token, User)
          //      })
          //   }
          // })
  
          // console.log(resetPswd);
  
          connection.query('update users set ? where email = ?', [resetPswd, email], function(err, rows) {
            if(err) throw err;
            console.log("token di set token :", swd_token);
            console.log(rows);
            done(err, token, rows);
            // alert("Check your email to reset password !");
          });
        res.redirect('/login')
        });  
      },
      function(token, rows, done) {
        var mailOptions = {
          to: email,
          from: config.message.from,
          subject: config.message.subject_reset,
          text: config.message.text_reset1 + 'http://'+ req.headers.host +'/login/reset/'+ token + '\n\n' + config.message.text_reset2
        };
        console.log(req.headers.host)
        console.log("proses kirim");
        sgMail.send(mailOptions, function(err) {
          done(err, 'done');
        }) 
        // .catch(err => {
        //   console.error(err);
        //   });
      }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/login/forgot');
      });
});


app.get('/reset/:token', function(req, res){

    connection.query('SELECT * FROM users WHERE pswd_token = ? ', [req.params.token], function(err, rows, fields) {
      if(err) throw err;
      console.log("token 2", req.params.token);
      console.log("length nya rows :", rows);
      if(rows.length <= 0) {
        alert("Token is invalid !");
        console.log("token belumbisa masuk");
      }
  
      var username = rows[0].username;
      res.render('reset', {susername: username, stoken: req.params.token});
      console.log(username);
    });
  });
  
  app.post('/reset/:token', function(req, res) {
    var username = req.body.username;
    console.log(username);
    async.waterfall ([
      function(done) {
        connection.query('SELECT * from users where pswd_token = ?', [req.params.token], function(err, rows) {
          if(rows.length <=0){
            alert("Email not registered !");
            console.log("email belum terdaftar")
          }
          console.log("hasil select 2", rows);
          
          var swd_token = null;
          var ate_reset = null;
          var spassword = req.body.password;
          var spassword2 = req.body.password2;
          spassword = config.salt+''+spassword;
          var dpassword = crypto.createHash('sha1').update(spassword).digest('hex')
          console.log(rows[0].email);
          var email = rows[0].email;
  
          var reset = {pswd_token: swd_token, date_reset: ate_reset}
          user.update({
            password: dpassword,
            pswd_token : swd_token,
            date_reset: ate_reset
          } , {
            where: {
              username: [req.body.username]
            }
          }).then(function(err) {
            if(err) {
              throw err;
            } else {
              alert('Success! Your password has been changed')
            }
          });
          user.findAll({
            where: {
              username: [req.body.username]
            }
          }) .then(function(user, err){
            done(err, user);
          }) .catch(err => {console.error (err)})
          
          // connection.query('UPDATE users SET password = sha1(" ? "), ? WHERE email = ? ', [spassword, reset, email], function(err, rows) {
          //   if(err) throw err;
          //   console.log("berhasil set password baru")
          //   console.log("rows", rows);
          // });
  
          // console.log(username);
          // connection.query('select * from users where username = ?', [username], function(err, rows) {
          //   done(err, rows);
          // });
        });
      },
      function(user, done) {
        // console.log("yang ke 3 :", rows)
        var optnMsg = {
          to: [req.body.username],
          from: config.message.from,
          subject: config.message.subject_success,
          text: config.message.text_confirm
        };
        sgMail.send(optnMsg, function(err) {
          console.log("email sudah dikirim");
          done(err, 'done');
        });
      }
      ], function(err) {
       if (err) throw err;
        res.redirect('/');
      })
  })



module.exports = app;
