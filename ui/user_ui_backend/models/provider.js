/**
 * Developer: Andy Liu
 * Contact: vikramabum@gmail.com
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const ProviderSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    jobs_running: [{
        userID: { type: String, required: true },
        jobID: { type: String, required: true },
        time_start: { type: Number, required: true }, // Unix time
        time_end: { type: Number, required: false }, // Unix time
        pcu_consumed: { type: Number, required: true, default: 0 }
    }],
    reliability: { type: Number, required: true, default: 4.5 },
})

//Adds password and username field automatically.
ProviderSchema.plugin(passportLocalMongoose)

//Sets up User collection. 
module.exports = mongoose.model('Provider', ProviderSchema);

