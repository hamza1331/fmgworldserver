const mongosse = require('mongoose')

const paperSchema = new mongosse.Schema({
    title:{
        type:String
    },
    fileLink:{
        type:String
    },
    exam:{          //0:FCPS, 1:FCPS1, 2:FCPS2
        type:Number
    }
})

module.exports = mongosse.model('papers',paperSchema)