const {User, Notification} = require('../dbschema');

// Login function for user based on credentials
const login = (req,res) => {
    // Find user based on email
    User.findOne({email: req.body.email}).then(result => {
        if(result === null) {
            // If no email found, inform user
            res.json({msg:"Email is not registred with Communicado"});
        } else {
            // If email found, verify email
            if(result.password === req.body.password){
                // Once verified, send User
                res.json({uid: result._id, msg:'Success'});
            }
            // If password is not correct
            else{res.json({msg:"incorrect password"});}
        }
    });
}

// Signup function for users.
const signup = (req, res) => {
    // Confirm that passwords match
    if (req.body.password !== req.body.confirmPassword) {
        res.json({msg: "Passwords do not match, please try again"});
    } else {
        // Check if email is already being used by another user in DB
        User.findOne({email: req.body.email}).then(result => {
            if (result !== null) {
                res.json({msg: "Email is already being used by another account"});
            } else {
                // If email is new, create new User with given info
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                    dateCreated: Date.now(),
                    profilePic: null,
                    friends: [],
                    notifs: [],
                    chats: []
                });

                // Save user to DB and return it to access, along with confirmation msg
                newUser.save().then(result => {
                    res.json({msg: 'Success', uid: result._id})
                });
            }
        });
    }
}
// Function to get user's info as json
const getUserInfo = (req, res) =>{
    User.findOne({_id: req.body.uid}).then(result =>{
        res.json(result);
    });
}

// Function to change profile pic and add as current pic
const handleProfilePic = (upload, fs, path) => (req, res) =>{
   if(req.body.action === 'load'){
       User.findOne({_id: req.body.uid}).then(result =>{
           if(result.profilePic === null){
                res.sendFile(path.join(__dirname, '../', 'images/avatar.jpg'));
            } 
            // Load img from user
            else{
                res.sendFile(path.join(__dirname, '../', `images/${result.profilePic}`));
            }
       });
   }
   else{
        // Upload profile image    
        upload(req, res, err => {
            if(err){
                console.log(err);
            }
            // Find user and update its image
            User.findOne({_id: req.body.uid}).then(result =>{
                if(result.profliePic !== null){
                    fs.unlink(path.join(__dirname, '../', `images/${result.profilePic}`), err =>{
                        if(err){
                            console.log(err);
                        }
                    });
                }
                // Update user
                User.updateOne({_id: req.body.uid}, {profilePic: req.file.filename}).then(()=>{
                    res.json({msg: 'Success'});
                });
            });
        });
    } 
}
// Changes a users same should it be provided
const changeName = (req, res) => {
    const {uid, firstName, lastName} = req.body;
    // Last name given
    if(firstName ==='' && lastName !== ''){
       User.updateOne({_id: uid}, {lastName}).then(() =>{
            User.findOne({_id: uid}).then(result =>{
                res.json({...result, msg: 'Your last name has been updated'});
            });
       });
    }
    // First name given
    else if(firstName !== '' && lastName ===''){
        User.updateOne({_id: uid}, {firstName}).then(() =>{
            User.findOne({_id: uid}).then(result =>{
                res.json({...result, msg: 'Your first name has been updated'});
            });
        });
    }
    // Both names given
    else if(firstName !== '' && lastName !== ''){
        User.updateOne({_id: uid}, {firstName, lastName}).then(() =>{
            User.findOne({_id: uid}).then(result =>{
                res.json({...result, msg: 'Your full name has been updated'});
            });
        });
    }
    // No input given
    else{
        res.json({msg: 'Both inputs are blank: your name has not been changed.'});
    }
}

// Changes a users password
const changePwd = (req, res) =>{
    const {uid, currPwd, newPwd, confirmPwd} = req.body;
    // Check if passwords match
    if(newPwd !== confirmPwd){
        res.json({msg: 'New password does not match confirm password'});
    }

    else{
        // If user's password is incorrent, inform them
        User.findOne({_id: uid}).then(result=>{
            if(result.password !== currPwd){
                res.json({msg: 'Your password is incorrect'});
            }
            // If old password is correct, successfully update password
            else{
                User.updateOne({_id: uid}, {password: newPwd}).then(()=>{
                    res.json({msg: 'Your password has been changed'});
                });
            }
        });
    }
}


//delete
const deleteUser = async  (req,res) =>{
    const {uid} = req.body

    const user = await User.findOne({_id: uid});

    const userFriends = await User.find({_id: {$in: user.friends}});

    const sentNotifs = await Notification.find({senderId: uid});


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
// Used to find new friends to add
const findUsers = async (req, res) =>{
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

const getFriends = (req, res) =>{
    const {uid} = req.params;

    User.findOne({_id: uid}).then(result =>{
        const {friends} = result;

        User.find({_id: {$in: friends}}).then(users =>{
            users.sort((a, b) => 
                a.firstName === b.firstName?
                a.lastName - b.lastName:
                a.firstName - b.firstName
            );

            res.json(users);
        });
    });
}
 
// exports
module.exports = {
    login,
    signup,
    handleProfilePic,
    getUserInfo,
    changeName,
    changePwd,
    findUsers,
    deleteUser,
    getFriends
}