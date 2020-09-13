let express = require("express");
let bodyParser = require("body-parser");
const mongoose = require('mongoose');
const { Db } = require("mongodb");
mongoose.connect("mongodb://localhost:27017/parrotDB", { useUnifiedTopology: true,useNewUrlParser: true })
const parrotSchema = new mongoose.Schema({email:{type: String, required: true},password:{type: String, required: true},score:{type:[Number]}})
const Parrot = mongoose.model("Parrot",parrotSchema)
const app = express();
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))

//store the user session
var name =[]
//store the highest score and chances left
var info=[]

 //reguster/login 
app.get("/",(req,res)=>{ 
    res.sendFile('./index2.html', {root: __dirname })
})


//to get the score and chances left
app.get("/score",(req,res)=>{
const it = name[0]

   Parrot.findOne()
    .where({email: it})
    .sort('-score')
    .exec(function(err, doc)
    {
        let max = doc.score;
        maxi=Math.max(...max)
    
        obj={
            max:maxi,
            chances:10-max.length
        }
        if(info.length>0){
            info.splice(0,info.length)
        }
   info.push(obj)
       }
);
res.send(info)
})


//post route to register a new user or login 
app.post("/",(req,res)=>{
    const email=req.body.email
    const password=req.body.psw
    Parrot.findOne({email:email},(err,user)=>{
       if(err){
           console.log(err)
       }
       if(user){
      if(user.password===password){
       
          res.redirect(`/game/${user.email}`)
      }else{res.send("<h1>Please Check Your Password</h1>")}
       }else{
     let person = new Parrot({email:email,password:password})
     person.save((err)=>{if(err,person){console.log(err)}else{res.redirect(`/game/${person.email}`)}})
    }
      })
})

//gameare
app.get("/game/:userId",(req,res)=>{
   const user=req.params.userId
   name.push(user)
    

 res.sendFile('./index.html', {root: __dirname })
   
})

//get highscore and store it in db
app.post("/game/:userId",(req,res)=>{
score=req.body.score
const it = name[0]
Parrot.aggregate([{$match: {email: it}}, {$project: {score: {$size: '$score'}}}],(err,user)=>{
    if(!err){
        if(user[0].score<10){
            Parrot.findOneAndUpdate({email: it}, {$push: {score: score}},(err)=>{if(!err){console.log("score submitted")}});
        }else{
            res.redirect("/game/:userId")
        }
    }else{
        console.log(err)
    }
})
})

//logout
    app.get("/logout",(req,res)=>{
    name.splice(0,name.length)
    info.splice(0,info.length)
    
    console.log(name)
    res.redirect("/")
})


app.listen(3000,()=>{
    console.log("Server Running on port 3000")
})