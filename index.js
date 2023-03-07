require('dotenv').config()
const client = require('./public/messageHandler')


const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require('body-parser');
const multer = require("multer");
const bcrypt = require("bcrypt")

const authorize = require('./middlewares/authorize');
const jwtSign = require('./jwt/jwtSign')

const app = express();





app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());
app.use(multer().array())
app.use(cookieParser());
// bcrypt
//   .hash("sd", 8)
//   .then(hash => {
//     console.log('Hash ', hash)
//   })
//   .catch(err => console.error(err.message))
const users = {
  "MAJA98" : "$2b$08$ZHWA2Hf/3SkabmKICZQ7muISWBCGGkUqqXMG1NvIVkCeXeK2YK6ES"
};


app.set('view engine', 'ejs');


app.get("/", [authorize],(req, res) => {
    res.render('login');
});


app.post("/in", async (req, res) => {
  let pass = users[req.body.username] !== undefined;
  let passnew;
  if (pass) {
    passnew = await bcrypt.compare(req.body.password,users[req.body.username]);
  }
  
  if (passnew) {
    res.cookie("JWT", jwtSign(req.body.username));
    res.send("OK")
    

  } else {
    res.status(404);
    res.send("Invalid user/password");
  }
});

app.post("/out", (req, res) => {
  res.clearCookie("JWT");
  res.status(200);
  res.send("OK");
});

app.get("/admin", [authorize],(req, res) => {
    res.render("admin",context={username:req.cookies?.TWILIO_APP_USER,phone:process.env.TWILIO_PHONE_NUMBER})
});
app.post("/send-messages",[authorize],(req,res)=>{
        const data = req.body
        let errorArray = []
        let successArray = []
        const lenthofData = data.length
        data.forEach(  ({phone,message}) => {

              client.messages.create({
                to: phone,
                from: process.env.TWILIO_PHONE_NUMBER,
                body: message
              }).then(result => successArray.push(result.to)).catch(err=>errorArray.push({phone,message}))

        })
        setTimeout(()=>{
          return res.status(200).json({result:errorArray})
        },1500*lenthofData)
        
})

app.all('*',(req,res)=>{
    res.status(404).send('<h1>Resource Not Found</h1>')
})

app.listen(3500, ()=>{
    console.log(`http://localhost:3500`)
})