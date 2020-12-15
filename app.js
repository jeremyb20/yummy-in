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
require('dotenv').config();

// Port Number
const port = process.env.PORT || 8080;
 
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

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
  extended: false
}));

app.use(cookieParser());

require('./back-end/config/passport')(passport);
app.use('/users', users);
app.use('/company', companys);

app.use(express.static(__dirname + '/dist/yummy-in'));
app.get('/*', function(re,res){
    res.sendFile(path.join(__dirname+'/dist/yummy-in/index.html'))
})
app.listen(port, function() {
  console.log("App is running on port " + port);
});
