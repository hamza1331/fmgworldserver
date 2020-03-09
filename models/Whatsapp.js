const mongoose = require('mongoose');

const whatsappGroups = new mongoose.Schema({
    
    title:{
        type:String,
        required:[true,"Title is required"]
    },
    url:{
        type:String,
        required:[true,"URL is required"]
    },
    description:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})


module.exports = mongoose.model('whatsappgroups',whatsappGroups)