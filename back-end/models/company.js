const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passportLocalMongoose = require('passport-local-mongoose');

// User Schema
const CompanySchema = mongoose.Schema ({
  companyName: {
    type: String
  },
  phone: {
    type: Number,
    require: false
  },
  email: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true
  },
  lat: {
    type: String,
    require: true
  },
  lng: {
    type: String,
    require: true
  },
  photo: {
    type: String,
    require: false
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  userState: {
    type: Number,
    require: false
  },
  bussinesSelected: {
    type: Number,
    require: true
  },
  newMenu: [{
    idCompany: {
      type: String,
      require: true
    },
    foodName: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true
    },
    cost: {
      type: Number,
      require: true
    },
    photo: {
      type: String,
      require: false
    }
  }],
  orderList: [{
    idOrder: {
      type: String,
      require: true
    },
    idUserSent: {
      type: String,
      require: true
    },
    orderName: {
      type: String,
      require: true
    },
    customerName: {
      type: String,
      require: true
    },
    location: [{
      lat: {
        type: String,
        require: true
      },
      lng: {
        type: String,
        require: true
      },
    }],
    delivery: {
      type: String,
      require: true
    },
    time: {
      type: String,
      require: true
    },
    quantity: {
      type: String,
      require: true
    },
    price: {
      type: String,
      require: true
    },
    status: {
      type: String,
      require: true
    }
  }]
}, { autoIndex: false });

CompanySchema.plugin(passportLocalMongoose);

const Company = module.exports = mongoose.model('Company', CompanySchema);

module.exports.getCompanyById = function(id, callback) {
    Company.findById(id, callback);
}

module.exports.getUserByUsername = function(email, callback) {
  const query = {email: email}
  Company.findOne(query, callback);
}

module.exports.addCompany = function(newCompany, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newCompany.password, salt, (err, hash) => {
      if(err) throw err;
      newCompany.password = hash;
      newCompany.save(callback);
    });
  });
}

module.exports.getUsers = function(users, callback){
  const query = {users: users}
  Company.find();
}

module.exports.deleteOne = function(req,res){
    Company.findByIdAndRemove({_id:req.body.id}).then(function(data){
    res.json({success:true,msg:'Se ha eliminado correctamente.'});
  });
}

module.exports.update = function(username, callback){
    Company.findByIdAndUpdate(username, callback);
}

module.exports.getUserMessage = function(req, callback){
  console.log(req, 'que sale');
  const query = {id: req.body._id}
  Company.find();
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}
