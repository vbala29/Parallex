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
    clusters_created: [{name: {type: String, required: true}, url: {type: String, required: true}, alive: {type: Boolean, required: true},
        creation_time: {type: Number, required: true}, termination_time: {type: Number, required: true}, 
        cpu_count: {type: Number, required: true}, memoryCount: {type: Number, required: true}}]

})

//Adds password and username field automatically.
UserSchema.plugin(passportLocalMongoose)

//Sets up User collection. 
module.exports = mongoose.model('User', UserSchema);

