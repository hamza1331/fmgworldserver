const mongoose = require('mongoose');
const topicsSchema = new mongoose.Schema({
    topicName:{
        type:String
    },
    seekTime:{
        type:Number
    },
    duration:{      //in seconds
        type:Number
    },
    priority:{  //LOW, MEDIUM and HIGH
        type:String
    }
})
const Lectures = new mongoose.Schema({
    sessionID:{
        type:String,
        required:true
    },
    fileServerName:{        //file path at server
        type:String,
        required:true
    },
    title:{
        type:String
    },
    duration:{      //in seconds
        type:Number
    },
    subject:{
        type:String,
        required:true
    },
    isVideo:{
        type:Boolean,           //false:file, true: video
        required:true
    },
    videoProps:{
        topics:[topicsSchema],
        duration:{          //minutes
            type:Number
        }
    },
    description:{
        type:String
    },
    createdDate:{
        type:Date,
        default:Date.now()
    },
    thumbnail:{
        type:String
    }
})


module.exports = mongoose.model('lectures',Lectures)