var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    config = require('../../config/config');

// Conectare la baza de date
mongoose.Promise = require('promise');

mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Conexiune deschisă la baza de date");
});

// Elaborarea schemei pentru bază
var UserSchema = new Schema(
  {
    name: String,
    email: {type: String},
    organisation: {type: String},
    role: {type: String},
    password: {type: String}
  }
);

// Înainte de a fi salvata, parola va fi hashuita
UserSchema.pre('save', function(next) {
  var user = this;

  // if(!user.isModified('password')) return next();
  var salt =  bcrypt.genSaltSync(15);

  bcrypt.hash(user.password, null, null, function(err, hash) {
    if(err) throw err;
    user.password = hash;
    next();
  });

});

/*
 introducerea unei metode noi in obiectul de tip schema care sa compare daca
 parola primita este cea care exista deja in hashul obiectului la password
*/
UserSchema.methods.comparePassword = function(password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
