const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Company = require('../models/company');
const cloudinary = require('cloudinary').v2;
const async = require('async');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const app = express();
require('dotenv').config();

var fileupload = require('express-fileupload');
const { element } = require('protractor');

app.use(fileupload({
  useTempFiles:true
}));

cloudinary.config({
  cloud_name:'ensamble',
  api_key: '218419814373569',
  api_secret: 'xBNx-qCyqTrcAahx8ZqGEAnNpwM'
});

// Register aqui hay ebviar la foto
router.post('/register/new-company', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  
  const result = await cloudinary.uploader.upload(req.file != undefined? req.file.path: obj.image);
  let newCompany = new Company ({
    companyName: obj.companyName,
    phone:obj.phone,
    email: obj.email,
    password: obj.password,
    lat: obj.lat,
    lng: obj.lng,
    userState: obj.userState,
    bussinesSelected:obj.bussinesSelected,
    photo: result.url == undefined? obj.image : result.url
  });

  Company.addCompany(newCompany,async(user, done) => {
    try {
      var smtpTransport = nodemailer.createTransport({
        host: 'mail.ticowebmail.com',
        port: 25,
        secure: false,
        logger: true,
        debug: true,
        ignoreTLS: true,
        auth: {
          user: 'marco@ticowebmail.com',
          pass: 'NTRNTxplr12'
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
        }
      });
      var mailOptions = {
        to: newUser.email,
        from: 'marco@ticowebmail.com',
        subject: 'Node.js Register User',
        text: '¡Bienvenido a Yummy Eats! ' + obj.name + ' para iniciar sesion estos serian sus credenciales: correo: ' + obj.email + ' contraseña temporal:'+obj.password 
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        res.json({ success: true, msg: 'Compañia registrada exitosamente' });
      });
      } catch (err) {
        res.json({success: false, msg: 'That Email or Username already exisits.!'});
        next(err);
      }
  
  });
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  Company.getUserByUsername(email, (err, company) => {
    if(err) throw err;
    if(!company) {
      return res.json({success: false, msg: 'Email not found'});
    }

    Company.comparePassword(password, company.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch) {
        const token = jwt.sign({data: company}, process.env.SECRET, {
          expiresIn: 604800   // 1 week: 604800 1 day //60 one minute 
        });
        res.json({
          success: true,
          token: 'JWT '+token,
          company: {
            id: company._id,
            companyName: company.companyName,
            username: company.username,
            email: company.email,
            photo: company.photo,
            userState: company.userState,
            lat: company.lat,
            lng: company.lng
          }
        })
      } else {
        return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
});

router.post('/register/newMenu', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  
  const result = await cloudinary.uploader.upload(req.file != undefined? req.file.path: obj.image);
  let newMenu = {
    foodName: obj.foodName,
    description: obj.description,
    cost: obj.cost,
    idCompany: obj.idCompany,
    photo: result.url == undefined? obj.image : result.url
  };
  Company.findOneAndUpdate({ _id: req.body.idCompany }, { $push: { newMenu: newMenu  } },async(err, menu, done) => {
    try {
      res.json({ success: true, msg: 'Nuevo menu registrado exitosamente..!' });
      } catch (err) {
        res.json({success: false, msg: err});
        next(err);
      }
    });
});



// router.get('/profile/getAllUsers', function(req, res){
//     Company.find({}, function(err, users){
//     if(err){
//       res.send('something went really wrong');
//       next();
//     }
//     res.json(users)
//   });
// });

router.get('/getAllMenuList/:id', function(req, res){
  var id = req.params.id;
  Company.findById(id, function(err, results){
    if(err){
      res.send('Algo ocurrio favor contactar a soporte');
      next();
    }
    res.json(results.newMenu)
  });
});

router.put('/update/updateMenuItemList', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  const result = await cloudinary.uploader.upload(req.file != undefined? req.file.path: obj.image);
  let newMenu = {
    foodName: obj.foodName,
    description: obj.description,
    cost: obj.cost,
    _id: obj._id,
    idCompany: obj.idCompany,
    photo: result.url == undefined? obj.image : result.url
  };

  Company.findOne({_id: req.body.idCompany }, (err, user) => {
    if (!user) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(user != null) {
       user.newMenu.forEach(element => {
         if(element._id == newMenu._id){
          element["foodName"] = newMenu.foodName;
          element["description"] = newMenu.description;
          element["cost"] = newMenu.cost;
          element["photo"] = newMenu.photo;
          user.save();
           try {
             res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
           } catch (err) {
             res.json({ success: false, msg: err });
             next(err);
           }
         }
       })
     }
   });
});

router.put('/delete/deleteMenuItemList', async(req, res, next) => {
  Company.findOne({_id: req.body.idCompany }, (err, user) => {
    if (!user) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(user != null) {
      for (var i =0; i < user.newMenu.length; i++){
        if (user.newMenu[i]._id == req.body._id) {
          user.newMenu.splice(i,1);
          user.save();
          try {
            res.json({ success: true, msg: 'Se ha eliminado correctamente..!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
          break;
        }
      }
     }
   });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({company: req.company});
});

router.route('/users/:_id')
  .delete(function(req, res){
    Company.remove(req,res);
});

router.put('/profile/updateCompany', (req, res) => {
    Company.findByIdAndUpdate(req.body._id, { $set: req.body }).then(function (data) {
    res.json({ success: true, msg: 'Update success.' });
  });
});

router.get('/mailbox/getMessages/:id', function(req, res){
  var id = req.params.id;
  Company.findById(id, function(err, results){
    if(err){
      res.send('something went really wrong');
      next();
    }
    res.json(results.message)
  });
});

router.post('/mailbox/sendMessage', (req, res, next) => {
    Company.findOneAndUpdate({ _id: req.body.idUserSent }, { $push: { message: req.body  } }).then(function(data){
    res.json({success:true,msg: 'Message sent'});
  });
});


router.post('/forgot', (req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  console.log(obj)
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
        Company.findOne({ email: obj.email }, (err, user) => {
        if (!user) {
         return res.json({success:false,msg: 'Email not found'});
        }

        if(user != null) {
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, token, user);
          });
        }
      });
    },
    function(token, user, done) {
      // var smtpTransport = nodemailer.createTransport({
      //   host: 'mail.ticowebmail.com',
      //   port: 25,
      //   secure: false,
      //   logger: true,
      //   debug: true,
      //   ignoreTLS: true,
      //   auth: {
      //     user: 'marco@ticowebmail.com',
      //     pass: 'NTRNTxplr12'
      //   },
      //   tls: {
      //     // do not fail on invalid certs
      //     rejectUnauthorized: false
      //   }
      // });
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: 'jeremybarquero18@gmail.com',
          pass: 'octubre151096'
        }
      });
      smtpTransport.verify(function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'marco@ticowebmail.com',
        subject: 'Yummy Eats restablecimiento de la contraseña',
        text: 'Recibe esto porque usted (u otra persona) ha solicitado el restablecimiento de la contraseña de su cuenta.\n\n' +
          'Haga clic en el siguiente enlace o péguelo en su navegador para completar el proceso:\n\n' +
          //'http://localhost:4200/reset/' + token + '\n\n' +
          'https://' + req.headers.host + '/reset/' + token + '\n\n' +
          'Si no lo solicitó, ignore este correo electrónico y su contraseña permanecerá sin cambios.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({success: true, msg: 'Se ha enviado un correo electrónico a ' + user.email + ' con más instrucciones.'});
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', (req, res) => {
    Company.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.json({success:false,msg: err});
    }else{
      res
      .status(200)
      .json({ user: user, token: req.params.token });
    }
  });
});


router.post('/reset/', function(req, res) {
  req.params.token = req.body.token;
  async.waterfall([
    function(done) {
        Company.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return  res.json({success:false,msg: 'Password reset token is invalid or has expired..'});
        }else if(req.body.password === req.body.confirm){
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

            bcrypt.genSalt(10, function(err, salt) {
            if (err) return next(err);

              bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);
                user.password = hash;
                user.save(function(err) {
                  done(err, user);
                });
              });
            });
        }else{
          return  res.json({success:false,msg: 'Password do not match..'});
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: 'mail.ticowebmail.com',
        port: 25,
        secure: false,
        logger: true,
        debug: true,
        ignoreTLS: true,
        auth: {
          user: 'marco@ticowebmail.com',
          pass: 'NTRNTxplr12'
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
        }
      });
      smtpTransport.verify(function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'marco@ticowebmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({success:true,msg: 'Success! Your password has been changed.'});
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/login');
  });
});



module.exports = router;
