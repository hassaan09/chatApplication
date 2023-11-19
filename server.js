const express = require('express');
const session = require("express-session")
const cookieParser = require("cookie-parser")
const http = require('http');
const {Server} = require('socket.io');
const fs= require('fs')
const path = 'E:/Csv-file.csv'


const application = express();
const server = http.createServer(application);
const io = new Server(server);

//Sockets.io .... socket = client 
let count=1;
io.on('connection',(socket)=>
{
    console.log(`user # ${count} is connected having socket id ${socket.id}`);
    socket.on('msg',(message)=>
    {
        fs.writeFile(path,message,'utf-8',(err)=>
        {
            if(err)
            {
                console.log("Error:::"+err)
            }
            else
            {
                console.log("Data written to the file,\n The data is as follows:")
                // console.log(fs.readFileSync(path,'utf-8'))
            }
            
        })
        io.emit('message',message,socket.id);
        console.log("User Message   "+message);
       
    });
    socket.on('disconnect', ()=>
    {
        console.log('A user disconnected',socket.id);
    });
    count++;
    
})


//Route for index.html
// application.use(cookieParser());
application.get('/Global',(req,res)=>
{

    console.log("OK..Global API Working")
    return res.status(200).sendFile('E:/Portfolio-Project-2/chatApplication/Views/globalChatRoom.html')
})


// '192.168.1.3',

server.listen(9000,()=>
{console.log("Server started at PORT: 9000")
});