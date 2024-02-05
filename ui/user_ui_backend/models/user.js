/**
 * Developer: Vikram Bala
 * Contact: vikrambala2002@gmail.com
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email : {
        type: String,
        required: true,
        unique: true
    },
})

//Adds password and username field automatically.
UserSchema.plugin(passportLocalMongoose)

//Sets up User collection. 
module.exports = mongoose.model('User', UserSchema);

