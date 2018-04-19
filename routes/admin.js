const express = require('express');
const router = express.Router();
const alert = require('alert-node');
const connection = require('../src/db_connect');
const validator = require('express-validator');
const validator_email = require('email-validator');
const Sequelize = require('sequelize');
const sequelize = require('../src/seq_db_connect');
const user = require('../src/model_users');
const path = require('path');
var qr = require('qr-image');

var QRCode = require('qrcode');

const twoFactor = require('node-2fa');


// var newSecret = twoFactor.generateSecret({name: 'users', account: 'username'})

// router.get('/coba', function(req, res, next) {
//   console.log(newSecret);
//   var code = qr.image(newSecret.uri)
//   res.send(code);
// })

router.get('/setting', function(req, res, next) {
  // user.findAll({
    
  // }).then(function(usr, err) {

  // }).catch()

  var status = req.body.status;
  var newSecret = twoFactor.generateSecret({name: 'Setting', account: username})
  console.log(newSecret);
  console.log(username)
  // var qrcode = qr.imageSync(newSecret.uri, { type: 'png' })
  res.render('setting', {qrcode: newSecret.qr, secret_key: newSecret.secret})
});


router.post('/setting', function(req, res, next) {
  console.log(user.username)
  // user.findOne({
  //   where: {username: req.user.username}
  // }).then(function(usr, err) {
  //   console.log(usr)
  // }).catch(err => {console.error(err)})

  console.log(req.body.username)
  user.findAll({
    where: {
      username: [req.body.username]
    }
  }).then(function(rows) {
    var verifytoken = twoFactor.verifyToken(rows[0].secretkey, req.body.token);
    console.log(req.body.token)
    var newToken = twoFactor.generateToken(rows[0].secretkey)
    console.log(newToken)
    if (verifytoken !== null) {
      users.findOne({
        where: {
          username: [req.body.username]
        },
        attributes: ['id', 'username', 'password']
      }).then(user => 
        req.login(user, function (err) {
          if (err) {
            console.log('user',user)
            return res.redirect('back');
          }
          console.log('Logged user in using Passport req.login()');
          console.log('username',req.user.username);
          res.redirect('/')
        })
      ) 
    } else {
      console.log('wrong token')
      res.render('setting',{stoken: req.body.token, susername: req.body.username})
    }
  }).catch(error => {
    console.log('salah')
    res.render('setting',{stoken: req.body.token, susername: req.body.username})
  })


})

router.get('/refresh', function(req, res, next) {
  res.redirect('/admin/setting');
})

router.get('/list', function(req, res) {
    var adminList = [];
    console.log(req.user.username)
    user.findAll().then(function(rows) {
    // res.send(rows);
    res.render('adminList', {title: 'Admin List', data: rows} )
    })
      .catch(err => {
      console.error(err);
      });

});

router.post('/twofactor/setup', function(req, res) {
  const secret = twoFactor.generateSecret({length: 10});
  QRCode.toDataURL(secret)
})


router.post('/add', function(req, res) {
  // req.checkBody("id_student",'input name').notEmpty();  
  // req.checkBody("name",'input name').notEmpty();
  // req.checkBody("gender",'input gender').notEmpty();
  req.checkBody("username", 'input username').notEmpty();
  req.checkBody("password", 'input Password').notEmpty();
  req.checkBody("password2", 'input password').notEmpty();
  req.checkBody("email", 'input email').notEmpty();
  var errors = req.validationErrors();

  if (errors){
    alert("Please input valid format !");
  } else {
    var username = req.body.username;
    var email = req.body.email;
    var password2= req.body.password2;
    var password = req.body.password;
    var val = validator_email.validate(email);
  
    console.log(username, password2)
  
    if (password === password2) {
      if(val === false) {
        alert('Please insert valid email !');
      } else {
        connection.query('SELECT email FROM users WHERE email = ?', [email], function(err, rows) {
          if(err) throw err;
          if(rows.length>0) {
            alert('Email already in use !');
          }
          connection.query('SELECT username FROM users WHERE username = ?', [username], function(err, rows) {
            if(rows.length>0) {
              alert("Username already in use !")
            } else {
                connection.query('INSERT INTO users (username, password, email) VALUES (? , sha1("7fa73b47df808d36c5fe328546ddef8b9011b2c6 ? "), ? )', [username, password, email], function(err, res) {
                  if (err) throw err;
                  console.log("admin berhasil ditambah");
                  alert("Succes input admin !");   
              });
                res.redirect('/admin/list');
              }
            }); 
        });
      }
    } else{
      alert("Password doesn't match !");
    }
  }
    
  });

  router.post('/delete/:id', function(req, res) {
    connection.query('DELETE from users WHERE id_user = ?', [req.params.id], function(err, rows){
      if(err) throw err;
      res.redirect('/adminList');
    })
  })

module.exports = router;

