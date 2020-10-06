require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//used for image uplaoding
const multer=require('multer');
const path=require('path');
const cors=require('cors');
const express = require('express');
const app = express();
const socket = require('socket.io');

//connect to database
mongoose.connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}); 

// Open Connection to database
mongoose.connection.once('open', () => {
    console.log("Connected to Database");
}).on('error', err => {console.log(err);});

// Set up image storage into images folder
const profilePicStorage = multer.diskStorage({
    destination: './images/profile',
    filename: (req, file, cb) =>{
        cb(null, 'PROFILE-' + req.body.uid + Date.now() + path.extname(file.originalname));
    }
});

// Use multer to upload imgs
exports.profilePicUpload = multer({
    storage: profilePicStorage,
    limits: {fileSize: 1000000000}
}).single('image');

const msgPicStorage = multer.diskStorage({
    destination: './images/messages',
    filename: (req, file, cb) =>{
        cb(null, 'MESSAGE-' + req.body.chatId + Date.now() + path.extname(file.originalname))
    }
})

exports.msgPicUpload = multer({
    storage: msgPicStorage,
    limits: {fileSize: 1000000000}
}).single('image');

app.use(bodyParser.json());
app.use(cors());

app.use('/users', require('./routes/user'));
app.use('/notifs', require('./routes/notif'));
app.use('/chats', require('./routes/chat'));
app.use('/friends', require('./routes/friends')); 

//Specify localhost port number
const server = app.listen(process.env.PORT);

//Here we pass socket server as a parameter to the arrow io function in socketEvents
require('./socket/socketEvents')(socket(server));