const mongoose = require('mongoose');
const subjectsSchema = new mongoose.Schema({
  createdDate:{
      type:Date,
      default:Date.now()
  },
  title:{
      type:String,
      required:true
  },
  isWeak:{
    type:Boolean,
    default:false
  }
});

module.exports = mongoose.model('subjects', subjectsSchema);