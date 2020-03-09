const mongoose = require('mongoose');
const Schema = mongoose.Schema
const Session = new mongoose.Schema({
 title:{
     type:String,
     required:[true,"Title for session is required"]
 },
 classTime:{
     type:Number,
     min:0,
     max:23
 },
 sessionID:{
     type:String,
     unique:true
 },
 lectures:[{type:Schema.Types.ObjectId,ref:"lectures"}],
 orderedLectures:[{type:Schema.Types.ObjectId,ref:"lectures"}]

});
module.exports = mongoose.model('Sessions', Session);