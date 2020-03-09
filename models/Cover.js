const mongoose = require('mongoose');

const Cover = new mongoose.Schema({
    home:{
        type:String,
        default:"https://assets.entrepreneur.com/content/3x2/2000/20191219170611-GettyImages-1152794789.jpeg?width=700&crop=2:1"
    },
    pastPaper:{
        type:String,
        default:"https://assets.entrepreneur.com/content/3x2/2000/20191219170611-GettyImages-1152794789.jpeg?width=700&crop=2:1"
    },
    recommendations:{
        type:String,
        default:"https://assets.entrepreneur.com/content/3x2/2000/20191219170611-GettyImages-1152794789.jpeg?width=700&"
    }
})


module.exports = mongoose.model('covers',Cover)