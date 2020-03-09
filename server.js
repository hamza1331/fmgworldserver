//Imports
const express = require('express')
var http = require('http');
var fs = require('fs');
const app = express()
var server = http.createServer(app);
const process = require('process')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
// const url = 'mongodb://demo:demo123@ds039417.mlab.com:39417/fmgworld'
const url = 'mongodb://localhost:27017/fmgworld'
// const url = 'mongodb://demo:demo123@ds347467.mlab.com:47467/artisanpractice'
const port = process.env.PORT || 5001
const cors = require('cors')
var multer  = require('multer');
var cron = require('node-cron');

const crypto = require('crypto')
var mime = require('mime');
const User = require('./models/User')
const PastPaper = require('./models/PastPapers')
const Cover = require('./models/Cover')
const Featured = require('./models/Featured')
const Session = require('./models/Session')
const Exam = require('./models/Exam')
const Schedule = require('./models/Schedule')
const Subjects = require('./models/Subjects')
const News = require('./models/News')
const Whatsapp = require('./models/Whatsapp')
const Advertisement = require('./models/Advertisement')
const Activity = require('./models/ProfileActivity')
const Lecture = require('./models/Lectures')
const logger = require('logger').createLogger()
var upload = multer({ dest: 'uploads/' }); //setting the default folder for multer
const client = require('socket.io').listen(server).sockets;
var archiver = require('archiver');
archiver.registerFormat('zip-encryptable', require('archiver-zip-encryptable'));

// create a file to stream archive data to.
var output = fs.createWriteStream(__dirname + '/example.zip');
var archive = archiver('zip-encryptable', {
  zlib: { level: 9 },
  forceLocalTime: true,
  password: '32%#FFE$%435kk34%@%oih4oier2h3oihd324hhio3eh23hid$%#$Jjoj34#%#$moj'
});
app.use(bodyParser.json())  //Body Parser MiddleWare
app.use(express.json())
app.use(cors())
app.use(express.static('uploads'))
const admin = require("firebase-admin");
const serviceAccount = require('./fmgworldapp-firebase-adminsdk-kaxjn-980457c129.json');
// app.use(bodyParser())

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fmgworldapp.firebaseio.com"
});


mongoose.connect(url, { useNewUrlParser: true }) //MongoDB connection using Mongoose
var db = mongoose.connection //Mongo Connection Instance
db.on('open', () => console.log('database connected'))  
var storage	=	multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    console.log(file)
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var uploadMult = multer({ storage : storage }).array('userPhoto',2);
function handleErr(err){
  if(err)return{
      message:"Failed",
      err
  }   
 }
 function handleSuccess(data){
     if(data)return{
         message:"Success",
         doc:data
     }
 }
//5e54a1d414b34822685be921
//  Cover.create({},(err,doc)=>{
//    if(err)return res.json(handleErr(err))
//    else return res.json(handleSuccess(doc))
//  })

 function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(__dirname + '/uploads/'+file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}


//Dashboard

app.post('/api/helloAdmin',(req,res)=>{
  if(req.body.firebaseUID){
    let data = req.body
    if(data.firebaseUID==='jkbedfoioi23ojdoiwjeoi'){
      User.countDocuments({},(err,users)=>{
        if(err)return res.json(handleErr(err))
        else{
          Session.countDocuments({},(er,sessions)=>{
            if(er)return res.json(handleErr(er))
            else{
              Lecture.countDocuments({},(error,lectures)=>{
                if(error)return res.json(handleErr(error))
                else{
                  Whatsapp.countDocuments({},(e,whatsapp)=>{
                    if(e)return res.json(handleErr(e))
                    else{
                  User.find({isVerified:false},(errror,students)=>{
                    if(errror)return res.json(handleErr(errror))
                    else{

                  let response={
                    users,
                    sessions,
                    lectures,
                    whatsapp,
                    students
                  }
                  return res.json(handleSuccess(response))
                    }
                  })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }else{
      res.json(handleErr("You are not authorized"))
    }
  }
  else{
    return res.json(handleErr("Valid firebaseUID is required"))
  }
})

//User mgement


//create user
app.post('/api/createUser',(req,res)=>{ //tested
  if(req.body.firebaseUID){
    let data = req.body
    User.create(data,(err,doc)=>{
      if(err){
        return res.json(handleErr(err))
      }else{
        Activity.create({firebaseUID:data.firebaseUID},(er,dox)=>{
          if(er) return res.json(handleErr(er))
          else{
            return res.json(handleSuccess(doc))
          }
        })
      }
    })
  }else{
    return res.json(handleErr("Valid firebaseUID is required"))
  }
})

//get details for a specific user
app.get('/api/userDetails:firebaseUID',(req,res)=>{ //tested
  if(req.params.firebaseUID.length>15){
    User.findOne({firebaseUID:req.params.firebaseUID},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }else{
    return res.json(handleErr("Valid firebaseUID is required"))

  }
})

//add a profile pic
app.put('/api/addImage',upload.single('fileData'),(req,res)=>{    //tested
  if(req.body.firebaseUID){
    logger.info(req.file);//this will be automatically set by multer
  //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
  fs.readFile(req.file.path,(err, contents)=> {
   if (err) {
    return res.json(handleErr(err))
  }else{
    User.findOneAndUpdate({firebaseUID:req.body.firebaseUID},{profilePic:req.file.filename},{new:true},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }
 });
  }else{
    return res.json(handleErr("Valid firebaseUID is required"))

  }
})

//Search by Mobile

app.post('/api/searchByMobile',(req,res)=>{
  if(req.body.mobile){
    User.findOne({mobile:req.body.mobile},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }else{
    return res.json(handleErr("Valid Mobile number is required"))
  }
})

//get prorfile picture
app.get('/api/getProfilePic:path',(req,res)=>{  //tested
  var file = __dirname + '/uploads/'+req.params.path;
  
    var filename = path.basename(file);
    var mimetype = mime.getType(file);
  
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
  
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
})

//add token for user

app.put('/api/addToken',(req,res)=>{
  if(req.body.firebaseUID){
    User.findOneAndUpdate({firebaseUID:req.body.firebaseUID},{$push:{tokens:req.body.token}},{new:true},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      return res.json(handleSuccess(doc))
    })
  }
  else{
    return res.json(handleErr("Valid firebaseUID is required"))
  }
})

//assign session ID

app.put('/api/assignSession',(req,res)=>{   //tested
  if(req.body.firebaseUID && req.body.sessionID){
    let data = req.body
    User.findOneAndUpdate({firebaseUID:data.firebaseUID},{sessionID:data.sessionID,isVerified:true},{new:true},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }
  else{
    return res.json(handleErr("Valid firebaseUID is required"))
  }
})

//Login User and get details 
app.put('/api/login',(req,res)=>{   //tested
  if(req.body.firebaseUID){
    let data = req.body
    User.findOneAndUpdate({firebaseUID:data.firebaseUID},{isLoggedIn:true},{new:true},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }else{
    return res.json(handleErr("Valid firebaseUID is required"))

  }
})
//Update User
app.put('/api/updateUser',(req,res)=>{    //tested
  if(req.body.firebaseUID){
    let data = req.body
    User.findOneAndUpdate({firebaseUID:data.firebaseUID},data,{new:true},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }
  else{
    return res.json(handleErr("Valid firebaseUID is required"))

  }
})


//delete user
app.delete('/api/deleteUser',(req,res)=>{   //tested
  if(req.body.firebaseUID){
    let data = req.body
      User.findOneAndDelete({firebaseUID:data.firebaseUID},(err,doc)=>{
        if(err)return res.json(handleErr(err))
        else{
          Activity.findOneAndDelete({firebaseUID:data.firebaseUID})
          admin.auth().deleteUser(data.firebaseUID).then(()=>{
            return res.json(handleSuccess(doc))
          }).catch(error=>{return res.json(handleErr("Couldn't delete user from firebase"))})
        }
      })
  }
  else{
    return res.json(handleErr("Valid firebaseUID is required"))
  }
})

//delete user from firebase

app.delete('/api/deleteFirebaseUser',(req,res)=>{   //tested
  if(req.body.firebaseUID){
    let data = req.body
    admin.auth().deleteUser(data.firebaseUID).then(()=>{
      return res.json(handleSuccess("User deleted from Firebase"))
    }).catch(err=>{
      return res.json(handleErr(err))
    })
  }else{
    return res.json(handleErr("Valid firebaseUID is required"))

  }
})

//get all users

app.get('/api/allUsers:page',(req,res)=>{   //tested
  var perPage = 20
  var page = req.params.page || 1
  User.find({}).skip((perPage * page) - perPage).limit(perPage).exec((error, data) => {
      if(error)res.json(handleErr(error))
      else{
        let response = {
          data,
          current: page,
          pages: Math.ceil(data.length / perPage)
        }
        return res.json(handleSuccess(response))
      }
  })
})

//search users
app.get('/api/searchUsers:name',(req,res)=>{    //tested
  if(req.params.name){
          User.find({ $text: { $search: req.params.name } })
              .limit(30)
              .exec((err, docs) => {
                  if (err) {
                    return res.json(handleErr(errr))
                  }
                  res.json(handleSuccess(docs))
              });
  }
  else{
    return res.json(handleErr("User name is required"))
  }
})
//get filtered users
app.post('/api/getFilteredUsers:page',(req,res)=>{  //tested
  var perPage = 20
  var page = req.params.page || 1
  var query = req.body
  User.find(query).skip((perPage * page) - perPage).limit(perPage).exec((error, data) => {
      if(error)res.json(handleErr(error))
      else{
        let response = {
          data,
          current: page,
          pages: Math.ceil(data.length / perPage)
        }
        return res.json(handleSuccess(response))
      }
  })
})


//add session

app.post('/api/addSession',(req,res)=>{ //tested
  if(req.body.sessionID){
    let data = req.body
    Session.create(data,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  } else{
    return res.json(handleErr("Session ID is required"))
  }
})

//delete session

app.delete('/api/deleteSession:id',(req,res)=>{ //tested
  if(req.params.id){
    Session.findByIdAndDelete(req.params.id,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        Schedule.deleteMany({sessionID:req.params.id})
        Lecture.deleteMany({sessionID:req.params.id})
        return res.json(handleSuccess(doc))
      }
    })
  }
})

//update session

app.put("/api/updateSession",(req,res)=>{ //tested
  if(req.body.oldSessionID){
    let data = req.body
    Session.findOneAndUpdate({sessionID:data.oldSessionID},data,{new:true},(err,doc)=>{
      if(err){
        console.log(err)
        return res.json(handleErr(err))
      }
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }else{
    return res.json(handleErr("Session ID is required"))
  }
})

//get all sessions

app.get('/api/getSessions',(req,res)=>{ //tested
  Session.find({},(err,docs)=>{
    if(err)return res.json(handleErr(err))
    else{
      res.json(handleSuccess(docs))
    }
  })
})


//add lecture

// app.post('/api/addLecture',upload.single('fileData'),(req,res)=>{
//   logger.info(req.file);//this will be automatically set by multer
//   //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
//   fs.readFile(req.file.path,(err, contents)=> {
//    if (err) {
//     return res.json(handleErr(err))
//   }else{
//     let data = req.body
//     data.fileServerName = req.file.filename
//     Lecture.create(data,(err,doc)=>{
//       if(err)return res.json(handleErr(err))
//       else{
//         let obj = {
//           day:data.day,
//           sessionID:data.sessionID,
//           lectureID:doc._id,
//           lectureTitle:data.title
//         }
//         Schedule.create(obj,(er,schedule)=>{
//           if(er)return res.json(handleErr(er))
//           else{
//             let response = {
//               lecture:doc,
//               schedule
//             }
//             return res.json(handleSuccess(response))
//           }
//         })
//       }
//     })
//   }
//  });
// })

//add pdf lectures

app.post('/api/addPDFLecture',upload.single('fileData'),(req,res)=>{
  logger.info(req.file);//this will be automatically set by multer
  //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
  fs.readFile(req.file.path,(err, contents)=> {
   if (err) {
    return res.json(handleErr(err))
  }else{
    let data = req.body
    data.fileServerName = req.file.filename
    data.isVideo=false
    Lecture.create(data,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        let obj = {
          day:data.day,
          sessionID:data.sessionID,
          lectureID:doc._id,
          lectureTitle:data.title
        }
        Session.findOneAndUpdate({sessionID:data.sessionID},{$push:{lectures:doc._id}},{new:true})
        Schedule.create(obj,(er,schedule)=>{
          if(er)return res.json(handleErr(er))
          else{
            let response = {
              lecture:doc,
              schedule
            }
            console.log(response)
            return res.json(handleSuccess(response))
          }
        })
      }
    })
  }
 });
})

app.post('/api/addLecture',(req,res)=>{ //tested
	uploadMult(req,res,function(err) {
		if(err) {
      console.log(err)
			return res.json(handleErr(err))
    }
    else{
      let data = req.body
      let props = JSON.parse(data.videoProps)
      let fileData = req.files
      let thumbnail = fileData[0].mimetype.includes('image')===true?fileData[0]:fileData[1]
      let lectureFile = fileData[0].mimetype.includes('image')===true?fileData[1]:fileData[0]
    data.fileServerName = lectureFile.filename
    data.thumbnail = thumbnail.filename
    data.videoProps = props
    console.log(data)
    Lecture.create(data,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        let obj = {
          day:data.day,
          sessionID:data.sessionID,
          lectureID:doc._id,
          lectureTitle:data.title
        }
        Session.findOneAndUpdate({sessionID:data.sessionID},{$push:{lectures:doc._id}},{new:true})
        Schedule.create(obj,(er,schedule)=>{
          if(er)return res.json(handleErr(er))
          else{
            let response = {
              lecture:doc,
              schedule
            }
            return res.json(handleSuccess(response))
          }
        })
      }
    })
    }
	});
});

//get all lectures for a session

app.get('/api/getLecturesForSession:sessionID',(req,res)=>{   //tested
    Lecture.find({sessionID:req.params.sessionID},(err,docs)=>{
      if(err)return res.json(handleErr(err))
      return res.json(handleSuccess(docs))
    })
})

///get all lectures

app.get('/api/getAllLectures:uid',(req,res)=>{
  if(req.params.uid==='jkbedfoioi23ojdoiwjeoi'){
    Lecture.find({},(err,docs)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(docs))
      }
    })
  }
})

//get pdf lectures for a user
// app.post('/api/getPdfLectures',(req,res)=>{
//   if(req.body.firebaseUID){
// Activity.findOne({firebaseUID:req.params.firebaseUID},(err,doc)=>{
//   if(err)return res.json(handleErr(err))
//   else{
//     let {overAllActivity} = doc
//     Lecture.find({sessionID:req.body.sessionID,isVideo:false},(er,docs)=>{
//       if(er) return res.json(handleErr(er))
//       else{
//         let filteredLectures = docs.filter((lec)=>{
//           if(overAllActivity.indexOf(lec._id)>-1){
//             console.log(lec)
//           }else{
//             return lec
//           }
//         })
//         return res.json(handleSuccess(filteredLectures))
//       }
//     })
//   }
// })
//   }
//   else{
//     return res.json(handleErr("Valid firebaseUID is required"))

//   }
// })


//get video lectures

app.post('/api/getVidLectures',(req,res)=>{
  if(req.body.sessionID){
    Lecture.find({sessionID:req.body.sessionID,isVideo:true},(err,docs)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(docs))
      }
    })
  }else{
    return res.json(handleErr("Valid Session ID is required"))
  }
})


//get pdf lectures

app.post('/api/getPDFLectures',(req,res)=>{
  if(req.body.sessionID){
    Lecture.find({sessionID:req.body.sessionID,isVideo:false},(err,docs)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(docs))
      }
    })
  }else{
    return res.json(handleErr("Valid Session ID is required"))
  }
})

//get video lectures for a user
// app.post('/api/getVideoLectures',(req,res)=>{
//   if(req.body.firebaseUID){
// Activity.findOne({firebaseUID:req.params.firebaseUID,isVideo:true},(err,doc)=>{
//   if(err)return res.json(handleErr(err))
//   else{
//     let {overAllActivity} = doc
//     Lecture.find({sessionID:req.body.sessionID},(er,docs)=>{
//       if(er) return res.json(handleErr(er))
//       else{
//         let filteredLectures = docs.filter((lec)=>{
//           if(overAllActivity.indexOf(lec._id)>-1){
//             console.log(lec)
//           }else{
//             return lec
//           }
//         })
//         return res.json(handleSuccess(filteredLectures))
//       }
//     })
//   }
// })
//   }
//   else{
//     return res.json(handleErr("Valid firebaseUID is required"))

//   }
// })

//delete a lecture

app.delete('/api/deleteLecture',(req,res)=>{
  if(req.body.id){
    Lecture.findByIdAndDelete(req.body.id,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      Schedule.findOneAndDelete({lectureID:req.body.id})
      let path = __dirname + '/uploads/'+req.body.filename
      fs.unlink(path,(err)=>{
        if(err){
          console.log(err)
          return res.json(handleErr('File not found'))
        }
        else{
          return res.json(handleSuccess(doc))
        }
      })
    })
  }else{
    return res.json(handleErr("Valid LectureID is required"))
  }
})

//watch a video

app.post('/api/watchVideo',(req,res)=>{ //tested
  if(req.body.firebaseUID){
    /* 
    REQUIRED DATA:
      lectureID,
      firebaseUID,
      path
     */
    Activity.findOneAndUpdate({firebaseUID:req.body.firebaseUID},{$push:{overAllActivity:req.body.lectureID}},{new:true},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      var file = __dirname + '/uploads/'+req.body.path;
  
      var filename = path.basename(file);
      var mimetype = mime.getType(file);
    
      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-type', mimetype);
    
      var filestream = fs.createReadStream(file);
      filestream.pipe(res);
    })

  }else{
    return res.json(handleErr("Valid firebaseUID is required"))

  }
})

//recommend videos

// app.post('/api/recommendVideos',(req,res)=>{    //tested
//  if(req.body.sessionID){
//   let data = req.body
//   /*
//   Weak subjects
//   sessionID
//   overAllActivity
//   noOfStudyHours
//   */
//  let weakSubjects = req.body.weakSubjects
//  let noOfStudyHours = req.body.noOfStudyHours
//  let overAllActivity = req.body.overAllActivity

//   Lecture.find({
//     sessionID:data.sessionID,
//     isVideo:true
//   },(err,docs)=>{
//     if(err)return res.json(handleErr(err))
//     else{
//       // console.log(docs.length)
//       //Filter out lectures by weak subjects
//       let subjectFilteredLectures = docs.filter((lec)=>{
//         if(weakSubjects.indexOf(lec.subject)>-1){
//           return lec
//         }else{
//           console.log(lec)
//         }})
//         //remove watched
//         let filteredLectures = subjectFilteredLectures.filter((lec)=>{
//           if(overAllActivity.indexOf(lec._id)>-1){
//             console.log(lec)
//           }else{
//             return lec
//           }
//         })
//         let arr = []
//         let dur = 0;
//           filteredLectures.map((lec,i)=>{
//             let added = false
//             let lecture = {}
//             let recommendTopics = []
//           lec.videoProps.topics.forEach((elem,ind)=>{
//             if(elem.priority==="HIGH"){
//               if (dur<=noOfStudyHours){
//                 dur+=elem.duration
//                 recommendTopics.push(elem)
//               }
              
//               if(dur<=noOfStudyHours && added===false){
//                 lecture.lectureProps = lec
//                 lecture.recommendTopics = recommendTopics
//                 arr.push(lecture)
//                 added=true
//               }
//             }
//           })
//         })
//         return res.json(handleSuccess(arr))
//     }
//   })
//  }else{
//   return res.json(handleErr("Valid Session ID is required"))
//  }
// })


app.post('/api/recommendVideos',(req,res)=>{    //tested
  if(req.body.sessionID){
   let data = req.body
   /*
   Weak subjects
   sessionID
   overAllActivity
   noOfStudyHours
   */
  let weakSubjects = req.body.weakSubjects
  let noOfStudyHours = req.body.noOfStudyHours
  let overAllActivity = req.body.overAllActivity
 
   Lecture.find({
     sessionID:data.sessionID,
     isVideo:true
   },(err,docs)=>{
     if(err)return res.json(handleErr(err))
     else{
       // console.log(docs.length)
       //Filter out lectures by weak subjects
       let subjectFilteredLectures = docs.filter((lec)=>{
         if(weakSubjects.indexOf(lec.subject)>-1){
           return lec
         }else{
           console.log(lec)
         }})
         //remove watched
         let filteredLectures = subjectFilteredLectures.filter((lec)=>{
           if(overAllActivity.indexOf(lec._id)>-1){
             console.log(lec)
           }else{
             return lec
           }
         })
         let arr = []
         let recommendTopics = []
         let dur = 0;
           filteredLectures.map((lec,i)=>{
             let added = false
             let lecture = {}
           lec.videoProps.topics.forEach((elem,ind)=>{
             if(elem.priority==="HIGH"){
               if (dur<=noOfStudyHours){
                 dur+=elem.duration
                let obj = {
                  ...elem._doc,
                  fileServerName:lec.fileServerName,
                  lectureID:lec._id
                }
                 console.log(obj)
                 recommendTopics.push(obj)
               }
               
               if(dur<=noOfStudyHours && added===false){
                 lecture.lectureProps = lec
                 arr.push(lecture)
                 added=true
               }
             }
           })
         })
         let response = {
           lectures:arr,
           recommendedTopics:recommendTopics
         }
         return res.json(handleSuccess(response))
     }
   })
  }else{
   return res.json(handleErr("Valid Session ID is required"))
  }
 })
//Add Featured video

app.post('/api/addFeaturedVideo',upload.single('fileData'),(req,res)=>{
    logger.info(req.file);//this will be automatically set by multer
    //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
    fs.readFile(req.file.path,(err, contents)=> {
     if (err) {
      return res.json(handleErr(err))
    }else{
      let data = req.body
      data.fileServerName = req.file.filename
      Featured.create(data,(err,doc)=>{
        if(err){
          console.log(err)
          return res.json(handleErr(err))
        }
        else{
          return res.json(handleSuccess(doc))
        }
      })
    }
   });
})

//Delete featured video

app.delete('/api/deleteFeaturedVideo',(req,res)=>{
  if(req.body.id && req.body.filename){
    Featured.findByIdAndDelete(req.body.id,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        let path = __dirname + '/uploads/'+req.body.filename
        fs.unlink(path,(err)=>{
          if(err){
            console.log(err)
            return res.json(handleErr('File not found'))
          }
          else{
            return res.json(handleSuccess(doc))
          }
        })

      }
    })
  }
  else{
    return res.json(handleErr('File Name is required'))
  }
})


//Get all featured videos

app.get('/api/getAllFeaturedVideos',(req,res)=>{
  Featured.find({},(err,doc)=>{
    if(err)return res.json(handleErr(err))
    else{
      res.json(handleSuccess(doc))
    }
  })
})

//get single featured video

app.get('/api/getFeaturedVideo:path',(req,res)=>{
  var file = __dirname + '/uploads/'+req.params.path;
  
    var filename = path.basename(file);
    var mimetype = mime.getType(file);
  
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
  
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
})

//Add PAST PAPER

app.post('/api/addPastPaper',upload.single('fileData'),(req,res)=>{
  logger.info(req.file);//this will be automatically set by multer
  //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
  fs.readFile(req.file.path,(err, contents)=> {
   if (err) {
    return res.json(handleErr(err))
  }else{
    let data = req.body
    data.fileLink = req.file.filename
    PastPaper.create(data,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        console.log(doc)
        return res.json(handleSuccess(doc))
      }
    })
  }
 });
})

//get all past papers

app.get('/api/getPastPapers',(req,res)=>{
  PastPaper.find({},(err,docs)=>{
    if(err)return res.json(handleErr(err))
    else{
      return res.json(handleSuccess(docs))
    }
  })
})

//get all past papers for exam

app.get('/api/getPastPapers:exam',(req,res)=>{
  PastPaper.find({exam:req.params.exam},(err,docs)=>{
    if(err)return res.json(handleErr(err))
    else{
      return res.json(handleSuccess(docs))
    }
  })
})

//delete past papers

app.delete('/api/deletePaper',(req,res)=>{
  if(req.body.id && req.body.filename){
    PastPaper.findByIdAndDelete(req.body.id,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        let path = __dirname + '/uploads/'+req.body.filename
        fs.unlink(path,(err)=>{
          if(err){
            console.log(err)
            return res.json(handleErr('File not found'))
          }
          else{
            return res.json(handleSuccess(doc))
          }
        })

      }
    })
  }
  else{
    return res.json(handleErr('File Name is required'))
  }
})

//Get past paper file
app.get('/api/getPastPaper:path',(req,res)=>{
  var file = __dirname + '/uploads/'+req.params.path;
  
    var filename = path.basename(file);
    var mimetype = mime.getType(file);
  
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
  
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
})


//Add a new Whatsapp Group

app.post('/api/addWhatsapp',(req,res)=>{
  let data = req.body
  console.log(data)
  Whatsapp.create(data,(err,doc)=>{
    if(err)return res.json(handleErr(err))
    else return res.json(handleSuccess(doc))
  })
})

//delete a whatsapp group

app.delete('/api/deleteWhatsapp',(req,res)=>{
  if(req.body.id){
    Whatsapp.findByIdAndDelete(req.body.id,(err,doc)=>{
      if(err) return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }else{
    return res.json(handleErr("Valid ID from Whatsapp group required"))
  }
})


//Get all Whatsapp groups

app.get('/api/getWhatsapp',(req,res)=>{
  Whatsapp.find({},(err,docs)=>{
    if(err)return res.json(handleErr(err))
    else return res.json(handleSuccess(docs))
  })
})

//Get schedule by session

app.get('/api/getSchedule:sessionID',(req,res)=>{
  Schedule.find({sessionID:req.params.sessionID})
  .sort('day').populate('lectureID')
  .exec((err,docs)=>{
    if(err)return res.json(handleErr(err))
    else return res.json(handleSuccess(docs))
  })
})

//Add a news

app.post('/api/addNews',(req,res)=>{
  if(req.body.title){
    let data = req.body
    News.create(data,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }
  else{
    return res.json(handleErr("Title is required"))
  }
})

//Delete a news

app.delete('/api/deleteNews',(req,res)=>{
  if(req.body.id){
    console.log(req.body.id)
    News.findByIdAndDelete(req.body.id,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      return res.json(handleSuccess(doc))
    })
  }
  else{
    console.log('No ID')
    return res.json(handleErr("Valid News ID is required"))

  }
})

//Get News 

app.get('/api/getNews',(req,res)=>{
  News.find({},(err,docs)=>{
    if(err)return res.json(handleErr(err))
    else{
      return res.json(handleSuccess(docs))
    }
  })
})


//add Subject

app.post('/api/addSubject',(req,res)=>{
  if(req.body.title){
    let data = req.body
    Subjects.create(data,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      return res.json(handleSuccess(doc))
    })
  }
  else{
    return res.json(handleErr("Title is required"))

  }
})

//get all subjects

app.get('/api/getSubjects',(req,res)=>{
  Subjects.find({},(err,docs)=>{
    if(err)return res.json(handleErr(err))
    else return res.json(handleSuccess(docs))
  })
})
//delete a subject
app.delete('/api/deleteSubject:id',(req,res)=>{
  if(req.params.id){
    Subjects.findByIdAndDelete(req.params.id,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }
  else{
    return res.json(handleErr("Subject ID is required"))
  }
})

//update subject

app.put("/api/updateSubject",(req,res)=>{ //tested
  if(req.body.id){
    let data = req.body
    Subjects.findByIdAndUpdate(req.body.id,data,{new:true},(err,doc)=>{
      if(err){
        console.log(err)
        return res.json(handleErr(err))
      }
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }else{
    return res.json(handleErr("Subject ID is required"))
  }
})

//get all lectures for a subject

app.post('/api/getLecturesOfSubject',(req,res)=>{
  if(req.body.subject && req.body.sessionID){
    Lecture.find({subject:req.body.subject,sessionID:req.body.sessionID},(err,docs)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(docs))
      }
    })
  } 
  else{
    return res.json(handleErr("Subject and Session ID is required"))
  }
})
app.post('/upload',upload.single('fileData'), (req, res,next) => {
    logger.info(req.file);//this will be automatically set by multer
    // logger.info(req.body);
    //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
    fs.readFile(req.file.path,(err, contents)=> {
     if (err) {
     console.log('Error: ', err);
    }else{
      res.json({
        message:"Success"
      })
    }
   });
  });
  app.get('/getFile:filename',(req,res)=>{         //working
    // res.sendFile(fs.readFile(path.join(__dirname+'/uploads/d6764085776b0e8d035e45a7eef999d6')))
    // res.sendFile(__dirname+'/uploads/d6764085776b0e8d035e45a7eef999d6')
    // const id = crypto.randomBytes(16).toString("hex");
    // // res.sendFile(__dirname+'/uploads/video.txt')
    // res.download(__dirname+'/uploads/video.txt')
    var output = fs.createWriteStream(__dirname + `/uploads/${req.params.filename}.zip`);
var archive = archiver('zip-encryptable', {
  zlib: { level: 9 },
  forceLocalTime: true,
  password: '32%#FFE$%435kk34%@%oih4oier2h3oihd324hhio3eh23hid$%#$Jjoj34#%#$moj'
});
    output.on('close', ()=> {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      res.download(__dirname+ `/uploads/${req.params.filename}.zip`)
    });
    
    output.on('end', function() {
      console.log('Data has been drained');
    });
    
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });
    
    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      throw err;
    });
    
    // pipe archive data to the file
    archive.pipe(output);
    
    // append a file from stream
    var file1 = __dirname + '/uploads/'+req.params.filename;
    archive.append(fs.createReadStream(file1), { name: req.params.filename });
    
    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
  })

  app.get('/download', function(req, res){    //working

    var file = __dirname + '/uploads/video.txt';
  
    var filename = path.basename(file);
    var mimetype = mime.getType(file);
  
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
  
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
  });

  cron.schedule('* 50 * * * *', () => {
    console.log('running a task 50th minute');
    let date = new Date()
    let hours = date.getHours()+1
    User.find({timeOfStudy:hours},(err,docs)=>{
      if(err)console.log(err)
      else{
        let users = docs
        if(users.length>0){
          users.map(user=>{
            const message={
                notification: {
                    body: "STUDY TIME!",
                    title: "Your time for study is about to start!"
                  },
                  tokens:user.tokens
            }
            admin.messaging().sendMulticast(message)
          .then((response) => {
            // Response is a message ID string.
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                  if (!resp.success) {
                    failedTokens.push(user.tokens[idx]);
                  }
                });
                console.log('List of tokens that caused failures: ' + failedTokens);
              }
          })
          })
        }
      }
    })
  });

app.get('/downloadBase64:filename',(req,res)=>{
  if(req.params.filename){
    var base64str = base64_encode(req.params.filename);
    fs.writeFile(__dirname + `/uploads/basefiles/${req.params.filename}.txt`, base64str, (err) => {
      if (err) console.log(err);
     else{
    res.sendFile(__dirname + `/uploads/basefiles/${req.params.filename}.txt`)
       
    } 
    });
  }
})

//add home cover

app.post('/api/addHomeCover',upload.single('fileData'),(req,res)=>{
  logger.info(req.file);//this will be automatically set by multer
  //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
  fs.readFile(req.file.path,(err, contents)=> {
   if (err) {
    return res.json(handleErr(err))
  }else{
    let data = {}
    data.home = req.file.filename
    Cover.findByIdAndUpdate('5e54a1d414b34822685be921',data,{new:true},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }
 });
})
//add pastPaper cover

app.post('/api/addPastPaperCover',upload.single('fileData'),(req,res)=>{
  logger.info(req.file);//this will be automatically set by multer
  //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
  fs.readFile(req.file.path,(err, contents)=> {
   if (err) {
    return res.json(handleErr(err))
  }else{
    let data = {}
    data.pastPaper = req.file.filename
    Cover.findByIdAndUpdate('5e54a1d414b34822685be921',data,{new:true},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }
 });
})
//add recommendations cover

app.post('/api/addRecommendationsCover',upload.single('fileData'),(req,res)=>{
  logger.info(req.file);//this will be automatically set by multer
  //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
  fs.readFile(req.file.path,(err, contents)=> {
   if (err) {
    return res.json(handleErr(err))
  }else{
    let data = {}
    data.recommendations = req.file.filename
    Cover.findByIdAndUpdate('5e54a1d414b34822685be921',data,{new:true},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }
 });
})


//Exams

//Add an exam
app.post('/api/addExam',(req,res)=>{
  if(req.body.sessionID){
    let data = req.body
    Exam.create(data,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }
  else{
    return res.json(handleErr("Session ID is required"))
  }
})

app.get('/api/getAllExams',(req,res)=>{
  Exam.find({},(err,docs)=>{
    if(err)return res.json(handleErr(err))
    else{
      return res.json(handleSuccess(docs))
    }
  })
})
//Delete an exam
app.delete('/api/deleteExams',(req,res)=>{
  if(req.body.id){
    let {id} = req.body
    Exam.findByIdAndDelete(id,(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }else{
    return res.json(handleErr("Valid exam id required"))
  }
})

//Advertisements

//Add advertisement

app.post('/api/addAdvertisement',upload.single('fileData'),(req,res)=>{
  logger.info(req.file);//this will be automatically set by multer
  //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
  fs.readFile(req.file.path,(err, contents)=> {
   if (err) {
    return res.json(handleErr(err))
  }else{
    let data = req.body
    data.filename = req.file.filename
    let id = '5e599276e170752200dafa69'
    Advertisement.findByIdAndUpdate(id,data,{new:true},(err,doc)=>{
      if(err)return res.json(handleErr(err))
      else{
        return res.json(handleSuccess(doc))
      }
    })
  }
 });
})

app.get('/api/getAdvertisement',(req,res)=>{
  Advertisement.find({},(err,docs)=>{
    if(err)return res.json(handleErr(err))
    else{
      return res.json(handleSuccess(docs))
    }
  })
})

//Server
server.listen(port, function () {
  console.log('Listening on port' + port)
})


