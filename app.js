const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const socket = require('socket.io');
const multer = require('multer');
const session = require('express-session');
const flash = require('express-flash');
const User = require('./back-end/models/user');
require('dotenv').config();

// Port Number
const port = process.env.PORT || 8080;
 
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;

mongoose.connect(process.env.BD_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
.then(() => 
  console.log('DB Connected!'))
.catch(err => {
  console.log(err.message);
});

const app = express();

const users = require('./back-end/routes/users');
const companys = require('./back-end/routes/companys');

app.use(bodyParser.urlencoded({
  extended: false,
  parameterLimit: '500000'
}));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended:false}));
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/uploads'),
  filename: (req, file, cd) => {
    cd(null, new Date().getTime() + path.extname(file.originalname));
  }
});
app.use(multer({storage}).single('image'));

// CORS Middleware
app.use(cors());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(session({      secret: 'session secret key',     resave: false,     saveUninitialized: false }));
app.set('views', path.join(__dirname, 'public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));


// Body Parser Middleware
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(session({ cookie: { maxAge: 60000 }, 
  secret: 'woot',
  resave: false, 
  saveUninitialized: false}));

require('./back-end/config/passport')(passport);
app.use(flash());
app.use('/users', users);
app.use('/company', companys);


// Start Server
app.use(express.static(__dirname + '/dist/yummy-in'));
app.get('/*', function(re,res){
    res.sendFile(path.join(__dirname+'/dist/yummy-in/index.html'))
})
var server =  app.listen(port, function() {
  console.log("App is running on port " + port);
});

let io = socket(server)
io.on('connection', (socket) =>{
  console.log(`${socket.id} is connected`);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('send-message', (data) => {
    const sendMessage = data;
      User.findOneAndUpdate({ _id: data.idUserSent }, { $push: { message: sendMessage } }).then(function(data){
        io.emit('message-received', sendMessage);
      });

  });

  socket.on('typing', (data)=> {
    socket.broadcast.emit('typing',data);
  })
});
