const mongoose = require('mongoose');
const subjectsSchema = new mongoose.Schema({
  createdDate:{
      type:Date,
      default:Date.now()
  },
  title:{
      type:String,
      required:true
  }
});

module.exports = mongoose.model('subjects', subjectsSchema);