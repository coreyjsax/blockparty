var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var findOrCreate = require('mongoose-findorcreate');

var UserSchema = new mongoose.Schema({
   fName: String,
    lName: String,
    email: String,
    phone: String,
    role: String,
    username: String,
    password: String,
    avatar: String,
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        fbusername: String
    },
});


UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", UserSchema);