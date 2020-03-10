const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email:{
      type:String,
      required:[true,'Email is required']
  },
  fName:{
      type:String,
      required:[true,'Full Name is required']
  },
  lName:{
    type:String,
    required:[true,'Full Name is required']
},
  profilePic:String,
  firebaseUID:{
      type:String,
      unique:true
  },
  isLoggedIn:{
      type:Boolean,
      default:false
  },
  createdDate:{
      type:Date,
      default:Date.now()
  },
  tokens:{
      type:[String]
  },
  collegeName:{
        type:String
  },
  age:{
      type:Number
  },
  gender:{
      type:Boolean          //true:male, false:female
  },
  qualification:{
      type:String
  },
  yearOfGraduation:{
      type:Number,
      min:1900,
      max:2100
  },
  appearedInFCPS:{
      type:Boolean          
  },
  fcpsExams:{
      type:Number,
      min:0
  },
  reference:{           //how did you come to know about us
      type:String           
  },
  weakSubjects:[String],
  sessionID:{
      type:String
  },
  noOfStudyHours:{
      type:Number
  },
  timeOfStudy:{         // 24 hour format time hours
      type:Number,
      min:0,
      max:23
  },
  isVerified:{
      type:Boolean,
      default:false
  },
  mobile:{
      type:String,
      unique:[true,'Mobile number should be unique']
  },
  recommended:{
    type:Boolean,
    default:false
  }
});

UserSchema.index({name:'text','fName':"text"})
module.exports = mongoose.model('Users', UserSchema);