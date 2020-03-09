const mongoose = require('mongoose');

const featuredLecture = new mongoose.Schema({
    
    fileServerName:{        //file path at server
        type:String,
        required:true
    },
    title:{
        type:String
    },
    duration:{      //in minutes
        type:Number
    },
    isVideo:{
        type:Boolean,           //false:file, true: video
        required:true
    },
    description:{
        type:String
    },
    thumbnail:{
        type:String
    }
})


module.exports = mongoose.model('Featured',featuredLecture)