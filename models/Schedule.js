const mongoose = require('mongoose');
const Schema = mongoose.Schema
const scheduleSchema = new mongoose.Schema({
    day:{
        type:Number,
        min:1
    },
    sessionID:{
        type:String,
        required:true
    },
    lectureID:{
        type:Schema.Types.ObjectId,
        ref:"lectures"
    },
    lectureTitle:{
        type:String
    }

})


module.exports = mongoose.model('Schedules',scheduleSchema)