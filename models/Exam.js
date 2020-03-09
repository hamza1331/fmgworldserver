const mongosse = require('mongoose')

const examSchema = new mongosse.Schema({
    name:{
        type:String,
        required:[true,'Exam Name is required']
    },
    sessionID:{
        type:String,
        required:[true,'Sesison is required']
    },
    examAt:{
        type:Date,
        required:[true,'Exam Date is required']
    }
})

module.exports = mongosse.model('exams',examSchema)