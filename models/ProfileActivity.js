const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ActivitySchema = new mongoose.Schema({
lastDayLectures:[{type:Schema.Types.ObjectId,ref:"lectures"}],
overAllActivity:[{type:Schema.Types.ObjectId,ref:"lectures"}],
firebaseUID:{
    type:String,
    required:true
},
notificationLength:{
    type:Number,
    default:0
}
});

module.exports = mongoose.model('Activity', ActivitySchema);