const express = require('express')
const session = require("express-session")
const cookieParser = require("cookie-parser")
const http = require('http')
const mongoose = require('mongoose')
const user = require('./Models/users')
const axiosReq = require('axios')//AXIOS is used to fetch information from Internet/Servers
const validator = require('email-validator');
const nodemailer = require('nodemailer');
const fs = require('fs')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { error } = require('console')



//SET UP CONNECTION WITH MONGODB DATABASE
const url = 'mongodb://127.0.0.1:27017/chatAppProject'
mongoose.connect(url)
const db = mongoose.connection;
db.on('open',()=>
{
    console.log('Database Connected')
})
db.on('error',(err)=>
{
    console.log('Database Not Connected',+err);s
})


//SET UP EXPRESS APP
const app = express();
const port = 3500;


// '192.168.1.3'
app.listen(port,()=>
{
    try{
        console.log('App Listening at Port '+port)
    }catch(err)
    {
        console.error(err);
    }
})


//EXTRAS
jwtSecret = '00100'
const expiredTokens = []

//APIs

//API#0 TESTING API FOR AXIOS
app.get('/test',async(req,res)=> 
{
   await axiosReq.get('https://www.boredapi.com/api/Activity').then(response=>
    {
        console.log("OK");
        res.status(200).json(response.data.activity);
        
    }).catch(error=>
    {
        console.error("FAIL..."+error.message);
        responseError(res); //response error function called
    })
    
})

//API#1
app.get('/',(req,res)=>
{
    new Promise((resolve,reject)=>
    {
        setTimeout(() => {
        const responseData = { message: "Welcome to chatApplication" };
        resolve(responseData);
    }, 1000);
    }).then((data)=> // here the 'data' is actually the 'responseData'
    {
        console.log("OK")
        res.status(200).json(data);
    }).catch((err)=>
    {
        console.log("FAIL")
        responseError(res);
    })

})

//API#2-HOME
app.get('/home',async(req,res)=>
{
        res.setHeader('Content-Type', 'text/html');
        await res.sendFile('E:/Portfolio-Project-2/chatApplication/Views/home.html',(error)=>
        {
            if(error)
            {
                console.error("FAIL...."+error);
                responseError(res);
            }
            else
            {
                console.log("OK")
            }
        })
})




//This api deals with registering the new user, so use async await as database call is involved
app.get('/Register',async(req,res)=>
    {
        res.setHeader('Content-Type', 'text/html');
        res.sendFile('E:/Portfolio-Project-2/chatApplication/Views/signUp.html')
    })

app.use(express.json())//Used for Post requests
app.post('/register',async(req,res)=>
{
    const {name,email,password} = req.body;
    const existingUser = await user.findOne({name}) 
    //findOne() searches for the given parameter in the mongodb collection and if
    //found, returns the document/object else will be null.
    if(existingUser)
    {
        console.log("USER ALREADY EXISTS");
        return res.status(409).json({message:"User Already Exists. Try again with fresh username"})
    }
  
    try{
        const hashedPass = await bcrypt.hash(password,12);
        const newUser = new user({name,email,password,hpassword:hashedPass});
        await newUser.save()
            console.log("New user Created");
            // console.log({name}); This is an object
            console.log(name+" is Registered");//This is a Stirng
            return res.status(200).json({name})
        }
        catch(error)
        {
            console.error(error);
            return res.status(409).json({message:"Error in Registering"})
        }
})


//API#-LOGIN

app.get('/Login',async(req,res)=>
    {
        res.setHeader('Content-Type', 'text/html');
        res.sendFile('E:/Portfolio-Project-2/chatApplication/Views/login.html')
    })



app.post('/login',async(req,res)=>
{
    const {name,password} = req.body;
    const userFromDb = await user.findOne({name,password});
    if(!userFromDb)
    {
        console.log("login Attempt Failed")
        return res.status(409).json({message:"Login Attempt Failed"})
    }
    console.log("Ok....") 
    const passCheck = await bcrypt.compare(password,userFromDb.hpassword)
    if(passCheck&&name===userFromDb.name)
    {
        console.log(`${userFromDb.name} is logged in`)//prints name
        const loggedUser = userFromDb.name;
        const token = initToken(user._id,jwtSecret,'1m');
        const userData = {username:loggedUser}
        res.cookie('authorization',token, { maxAge: 60000, httpOnly: true })
        return res.status(200).json({message:token,user:loggedUser})
        
    }
})

app.get('/Forgot',(req,res)=>
{
    try
    {
        res.setHeader('Content-Type', 'text/html');
        res.sendFile('E:/Portfolio-Project-2/chatApplication/Views/Forgot.html')
    }catch(error)
    {
        console.error(error)
        res.status(500).json({message:"Internal Server Error"})
    }
        
})
app.post('/forgot',async(req,res)=>
{
    const email = req.body;
    const userFromDb = await user.findOne(email)
    console.log(userFromDb.email)
    const isValidEmail = validator.validate(userFromDb.email);
                if(isValidEmail&&userFromDb)
                {
                    // let transporter = nodemailer.createTransport({
                    //     service: 'gmail',
                    //     auth: {
                    //     user: 'hassaanindominus09@gmail.com',
                   
                    //     }
                    // });
                    
                    let mailOptions = {
                        from: 'hassaanindominus09@gmail.com',
                        to: userFromDb.email,
                        subject: 'Password Reset',
                        text: jwtSecret
                    };
                    
                    await transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                        console.error(error);
                        } else {
                        console.log('Email sent: ' + info.response);
                        }
                    });
                    const username = userFromDb.name;
                    const useremail  =userFromDb.email;
                    return res.status(200).json({message:username,Email:useremail})
                }
                else
                {
                    console.log("Email not Valid")
                    return res.status(400).json({Message:"Email Not Valid"})
                }



})
app.get('/Forgot2',(req,res)=>
{
    try
    {
        res.setHeader('Content-Type', 'text/html');
        res.sendFile('E:/Portfolio-Project-2/chatApplication/Views/Forgot2.html')
    }catch(error)
    {
        console.error(error)
        res.status(500).json({message:"Internal Server Error"})
    }
        
})

app.put('/forgot2',async(req,res)=>
{
    try
    {
        const { retrievedEmail, password, code } = req.body;
        if(code===jwtSecret)
        {
            const hashedPass = await bcrypt.hash(password,12);
        const updateUser = await user.findOneAndUpdate({email:retrievedEmail},{$set:{password:password,hpassword:hashedPass}})
        await updateUser.save(); //For Better Validation
        return res.status(200).json({message:"Password Updated"})
        }
    }
    catch(error)
        {
            responseError(res);
        }

})


app.post('/logout',async(req,res)=>
 {
    const token  = req.headers.authorization;
    console.log(token)
    if(!token)
    {
        return res.status(401).json({message:"Token Missing"})
    }
    if(expiredTokens.includes(token))
    {
        return res.status(401).json({message:"Token Already Expired"})
    }
    await expiredTokens.push(token);
    return res.status(200).json("Successfully LOGGED Out")
 
 })

//This function is defined to avoid repetition of returning response error.
    function responseError(res)
    {
        res.status(500).json({message:"Internal Server Error"})
    }

//EXPORT MODULES FOR DIFFERENT FILES
module.exports = app;


function initToken(userID,jwtSecret,expiresIn)
{
    const genToken= jwt.sign({userID:userID},jwtSecret,{expiresIn:expiresIn});
    return genToken;
}

function jwtAuthentication(req,res,next)
 {
    let token = req.header('Authorization'); //getting the encrypted message fromat from theader
    if(!token)
    {
        return res.status(401).json({message:"Inavlid token/Token Not Found"})
    }
    else
    {
        jwt.verify(token,jwtSecret,(err,user)=>{
            if(err)
            {
                return res.status(401).json({message:"Access denied"})
            }
            else
            { 
                req.user = user;
                next(); //controlled passed to the next item in validateAPI
            }
           
        })
    }

 }

    
    