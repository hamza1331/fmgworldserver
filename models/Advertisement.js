const mongoose = require('mongoose');

const adsShema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Title is required']
    },
    description:{
        type:String,
        required:[true,'Description is required']
    },
    filename:{
        type:String
    }
})


module.exports = mongoose.model('advertisement',adsShema)