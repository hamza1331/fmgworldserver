const mongosse = require('mongoose')

const newsSchema = new mongosse.Schema({
    title:{
        type:String
    },
    description:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongosse.model('News',newsSchema)