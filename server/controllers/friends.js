const {User} = require('../models/user');
const {Notification} = require('../models/notif');

exports.getUserFriends = async (req, res) =>{
    const {uid} = req.params;

    const user = await User.findOne({_id: uid});
    const {friends} = user;

    const userFriends = await User.find({_id: {$in: friends}});
    userFriends.sort((a, b) => 
        a.firstName === b.firstName?
        a.lastName - b.lastName:
        a.firstName - b.firstName
    );

    res.json(userFriends);
}

exports.getFriendStatus = async (req, res) => {
    const {senderId, receiverId} = req.body;

    const receiver = await User.findOne({_id: receiverId});
    const {notifs, friends} = receiver;

    let found = false;

    for(let i=0;i<friends.length;i++){
        if(friends[i] === senderId){
            found = true;
            break;
        }
    }

    if(found){
        res.json({status: 'Friends'});
    }

    else{
        found = false;

        for(let i=0;i<notifs.length;i++){
            if(notifs[i].senderId === senderId && notifs[i].friendRequest){
                found = true;
                break;
            }
        }

        const status = found? 'Pending' : 'Add Friend';
    
        res.json({status});
    }
}

exports.changeFriendStatus = async (req, res) => {
    const {uid, friendId, iconStatus, serverStatus} = req.body;

    if (iconStatus === serverStatus) {
        if (iconStatus === "Add Friend") {
            const result = await User.findOne({ _id: uid});
            const {firstName, lastName} =result;

            const user = await User.findOne({ _id: friendId});
            const {notifs} = user;

            // Send possible friend a new friend request notification 
            const newNotification = new Notification({
                friendRequest: true,
                acceptFriendRequest: false,
                read: false,
                content: `sent you a friend request`,
                senderId: uid,
                receiverId: friendId,
                date: new Date()
            });

            notifs.push(newNotification);
            
            //store new notif in notification collection, and update friends notifs
            await newNotification.save();
            await User.updateOne({_id: friendId}, {notifs});
            
            res.json({msg: `${firstName} ${lastName} sent you a friend request`});
        }

        //cancel pending friend request
        else if (iconStatus === "Pending") {
            const result = await User.findOne({_id: friendId})
            const {notifs} = result;

            // If already pending, cancel request and remove notif
            for(let i=0;i<notifs.length;i++){
                if(notifs[i].senderId === uid && notifs[i].friendRequest){

                    //delete from collection of notifications as well
                    await Notification.deleteOne({_id: notifs[i]._id});
                    notifs.splice(i, 1);
                    break;
                }
            }

            // Update users notification list
            await User.updateOne({_id: friendId}, {notifs});
            res.json({msg: null});
        }

        else {
            const result = await User.findOne({_id: uid});
            let {friends, notifs} = result;

            // Remove friend from friends list
            for(let i=0;i<friends.length;i++){
                if(friends[i] === friendId){
                    friends.splice(i, 1);
                    break;
                }
            }

            for(let i=0;i<notifs.length;i++){
                if(notifs[i].senderId ===friendId && notifs[i].acceptFriendRequest){

                    //delete from collection of notifications as well
                    await Notification.deleteOne({_id: notifs[i]._id});
                    notifs.splice(i, 1);
                    break;
                }
            }

            // Update friends list of user
            await User.updateOne({_id: uid}, {friends, notifs});

            // Remove current user from friends' list of friends
            const friend = await User.findOne({_id: friendId})
            
            let oldFriends = friend.friends;
            let oldNotifs = friend.notifs;

            // Remove friend from friends list
            for(let i=0;i<oldFriends.length;i++){
                if(oldFriends[i] === uid){
                    oldFriends.splice(i, 1);
                    break;
                }
            }

            for (let i=0; i<oldNotifs.length;i++){
                if(oldNotifs[i].senderId ===uid && oldNotifs[i].acceptFriendRequest){
                    
                    //delete from collection of notifications as well
                    await Notification.deleteOne({_id: oldNotifs[i]._id});
                    oldNotifs.splice(i, 1);
                    break;
                }
            }

            // Update friends list of user who is removed
            await User.updateOne({_id: friendId}, {friends: oldFriends, notifs:oldNotifs});
            res.json({msg: null});
        }
    }

    else{res.json({msg: null});}
}

exports.acceptFriendReq = async (req, res) => {
    const {clientStatus, serverStatus, receiverId, senderId} = req.body;

    if (clientStatus === serverStatus) {
        if (clientStatus === 'Pending') {
            // Find receiver and destructure user
            const receiver = await User.findOne({_id: receiverId});
            const {firstName, lastName, friends, notifs} = receiver;

            // Find notification and remove from sender
            for (let i = 0; i < notifs.length; i++) {
                if (notifs[i].senderId === senderId && notifs[i].friendRequest) {

                    //delete from collection of notifications as well
                    await Notification.deleteOne({_id: notifs[i]._id});
                    notifs.splice(i, 1);
                    break;
                }
            }

            // Add new notification list to user
            friends.push(senderId);

            // Create new notif to send acceptance
            const newNotif = new Notification({
                friendRequest: false,
                acceptFriendRequest: true,
                content: `accepted your friend request`,
                read: false,
                senderId: receiverId, // Sender of acceptance is receiver who accepted it
                receiverId: senderId,
                date: new Date()
            });

            //store new notif in notification collections
            // Update receiver's friends and notifs
            await newNotif.save();
            await User.updateOne({_id: receiverId}, {friends, notifs})
        
            const sender = await User.findOne({_id: senderId});
            
            //after finding sender, add receiver onto their friend's list
            const senderFriends = sender.friends;
            senderFriends.push(receiverId);

            // also add new notification to sender of acceptance
            const senderNotifs = sender.notifs;
            senderNotifs.push(newNotif);

            // handles the case where they both sent each other friend requests
            // deletes the other user's friend request
            for (let i = 0; i < senderNotifs.length; i++) {
                if (senderNotifs[i].senderId === receiverId && senderNotifs[i].friendRequest) {

                    //delete from collection of notifications as well
                    await Notification.deleteOne({_id: senderNotifs[i]._id});
                    senderNotifs.splice(i, 1);
                    break;
                }
            }

            await User.updateOne({_id: senderId}, {friends: senderFriends, notifs: senderNotifs});
            res.json({msg: `${firstName} ${lastName} accepted your friend request`});
        }
    }

    else{res.json({msg: null});}
}

exports.declineFriendReq = async (req, res) => {
    const {receiverId, senderId} = req.body;

    // Find receiver from ID
    const result = await User.findOne({_id: receiverId})
    const {notifs} = result;

    // Look for friend request sent by user
    for (let i = 0; i < notifs.length; i++) {
        if (notifs[i].senderId === senderId && notifs[i].friendRequest) {

            //delete from collection of notifications as well
            await Notification.deleteOne({_id: notifs[i]._id});
            notifs.splice(i, 1);
            break;
        }
    }

    await User.updateOne({ _id: receiverId}, {notifs}); 
    
    res.json({msg: 'Friend request was declined'});
}