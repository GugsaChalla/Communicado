const {User} = require('../models/user');
const {Notification} = require('../models/notif');

const bcrypt = require('bcrypt');
const upload = require('../app').profilePicUpload;
const path = require('path');
const fs = require('fs');

// Login function for user based on credentials
exports.login = async (req,res) => {
    const {email, password} =req.body;

    // Find user based on email
    const user = await User.login(email, password);

    res.json(user);
}

// Signup function for users.
exports.signUp = async (req, res) => {
    const {firstName, lastName, email, password, confirmPassword} = req.body;

    const user = await User.findOne({email});

    //Check if email is already being used by another user in DB
    if(user !== null){
        res.json({msg: 'Email is already being used by another account'});
    }

    //confirm that passwords match
    else if(password !== confirmPassword){
        res.json({msg: 'Passwords do not match, please try again'});
    }

    //if email is new, create new User with given info
    else{
        const newUser = new User({
            firstName, lastName, email, password,
            dateCreated: new Date(),
            profilePic: null,
            friends: [],
            notifs: [],
            chats: []
        });

        // Save user to DB and return it to access, along with confirmation msg
        const user = await newUser.save();
        res.json({msg: 'Success', uid: user._id});
    }
}

// Function to get user's info as json
exports.getUserInfo = async (req, res) =>{
    const {uid} = req.params;

    const user = await User.findOne({_id: uid})

    res.json(user);
}

exports.loadProfilePic = async (req, res) =>{
    const {uid} = req.params;

    const user = await User.findOne({_id: uid});
    const {profilePic} = user;

    if(profilePic === null){
        res.sendFile(path.join(__dirname, '../', 'images/profile/avatar.jpg'));
    }

    else{
        res.sendFile(path.join(__dirname, '../', `images/profile/${profilePic}`));
    }
}

exports.updateProfilePic = (req, res) =>{
    //upload profile image
    upload(req, res,  async err =>{
        if(err){
            console.log(err);
        }

        //find user and update its image
        const user = await User.findOne({_id: req.body.uid});
        const {profilePic} = user;

        if(profilePic !== null){
            fs.unlink(path.join(__dirname, '../', `images/profile/${profilePic}`), err =>{
                if(err){
                    console.log(err);
                }
            });
        }

        await User.updateOne({_id: req.body.uid}, {profilePic: req.file.filename});

        res.json({msg: 'Success'});
    });
}

// Changes a users same should it be provided
exports.changeName = async (req, res) => {
    const {uid, firstName, lastName} = req.body;

    // Last name given
    if(firstName ==='' && lastName !== ''){
       await User.updateOne({_id: uid}, {lastName});

       res.json({
           msg: 'Your last name has been updated'
        });
    }

    // First name given
    else if(firstName !== '' && lastName ===''){
        await User.updateOne({_id: uid}, {firstName});

        res.json({
           msg: 'Your first name has been updated'
        });
    }
    // Both names given
    else if(firstName !== '' && lastName !== ''){
        await User.updateOne({_id: uid}, {firstName, lastName});

        res.json({
           msg: 'Your full name has been updated'
        });
    }
    // No input given
    else{
        res.json({msg: 'Both inputs are blank: your name has not been changed.'});
    }
}


// Changes a users password
exports.changePwd = async (req, res) =>{
    const {uid, currPwd, newPwd, confirmPwd} = req.body;

    const user = await User.findOne({_id: uid});
    const {password} = user;

    const valid = await bcrypt.compare(currPwd, password);

    if(!valid){
        res.json({msg: 'Your password is incorrect'});
    }

    else if(newPwd !== confirmPwd){
        res.json({msg: 'New password does not match confirm password'});
    }

    else{
        await User.updateOne({_id: uid}, {password: newPwd});
        res.json({msg: 'Your password has been changed'});
    }
}

//delete
exports.deleteUser = async  (req,res) =>{
    const {uid} = req.params;

    const user = await User.findOne({_id: uid});
    const userFriends = await User.find({_id: {$in: user.friends}});
    const sentNotifs = await Notification.find({senderId: uid});

    //delete profile pic if it exists
    const {profilePic} = user;
    
    if(profilePic){
        fs.unlink(path.join(__dirname, '../', `images/${profilePic}`), err =>{
            if(err){
                console.log(err);
            }
        });
    }

    //delete all the notifications that other users have received from this one
    for(let i=0;i<sentNotifs.length;i++){
        const receiver = await User.findOne({_id: sentNotifs[i].receiverId});

        const receiverNotifs = receiver.notifs;

        for(let j =0;j<receiverNotifs.length;j++){
            let found = false;

            if(receiverNotifs[j].senderId === uid){
                receiverNotifs.splice(j, 1);

                found = true;

                break;
            }

            if(found){break;}
        }

        await User.updateOne({_id: sentNotifs[i].receiverId}, {notifs: receiverNotifs});
    }

    await Notification.deleteMany({senderId: uid});

    //iterate through all of the deleted user's friends
    for(let i=0;i<userFriends.length;i++){
        for(let j=0;j<userFriends[i].friends.length;j++){
            let found =  false;

            //remove the deleted user's id from their former friends' lists
            if(userFriends[i].friends[j] === uid){
                userFriends[i].friends.splice(j, 1);
                
                found = true;
                
                await User.updateOne({_id: userFriends[i]._id}, {friends: userFriends[i].friends});
                
                break;
            }

            if(found){break;}
        }
    }
    
    await User.deleteOne({_id: uid});

    res.json({msg: 'Account is being deleted, press ok to continue.'});
}

// Find all users based on a given name
exports.findUsers = async (req, res) =>{
    let {name, uid, findFriends} = req.body;
    // No users found
    if(name.length === 0){
        res.json({msg: "No users found"});
    }
    let listOfNames = [];
    if(req.body.name.includes(" ")){
        // Check if user gave 1 or multiple words
        oneWord =false;
        split = name.split(" ");
        
        // convert to lowercase 
        for(let i=0;i<split.length;i++){
            listOfNames.push(split[i].toLowerCase());
        }
    }
    else{
        listOfNames.push(name.toLowerCase());
    }

    let result;

    if(findFriends){
        let user = await User.findOne({_id: uid});
        result = await User.find({_id: {$in: user.friends}});
    }

    else{
        result = await User.find({});
    }

    // Find all users and filter name
    const users = [];
    for(let i=0;i<result.length;i++){
        let userNames = `${result[i].firstName} ${result[i].lastName}`.split(" ");
            
        for(let j=0;j<userNames.length;j++){
            let found = false;
            // Convert names of all users to lowercase when comparing 
            // If matching, add to array of found users
            for(let k=0;k<listOfNames.length;k++){
                if(userNames[j].toLowerCase().startsWith(listOfNames[k])){
                    users.push(result[i]);
                    found = true;
                    break;
                }
            }

            if(found){break;}
        }
    }

    res.json({users, msg: "Success, here are your users"});
}