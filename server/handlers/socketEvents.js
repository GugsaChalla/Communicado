const {User, Notification} = require('../dbschema');

const axios = require('axios');

const active = {};

module.exports = (io) => {
    io.on('connection', socket =>{
        socket.on('JOIN_SERVER', data =>{
            active[data.uid] = socket.id;
        });
    
        socket.on("DISCONNECT", data =>{
            delete active[data.uid];
        });

        socket.on("DECLINE_REQUEST", data =>{
            const {receiverId, senderId} = data;

            User.findOne({_id: receiverId}).then(result =>{
                const {notifs} = result;

                for(let i =0;i<notifs.length;i++){
                    if(notifs[i].senderId === senderId && notifs[i].friendRequest){
                        notifs.splice(i, 1);
                        break;
                    }
                }

                User.updateOne({_id: receiverId}, {notifs}).then(()=>{console.log("Request declined");});
            }); 
        });

        socket.on("ACCEPT_REQUEST", data =>{
            const {status, receiverId, senderId} = data;

            axios.post('http://localhost:5000/friends/status', {receiverId, senderId}).then(response =>{
                if(status === response.data.staus){
                    if(status === 'Pending'){
                        User.findOne({_id: receiverId}).then(receiver =>{
                            if(receiver.friends.includes(senderId)){
                                io.sockets.to(active[senderId]).emit(
                                    'ACCEPT_REQUEST', 
                                    {msg: "You're already friends"}
                                ); 
                            }

                            else{
                                const {firstName, lastName, friends, notifs} = receiver;

                                for(let i =0;i<notifs.length;i++){
                                    if(notifs[i].senderId === senderId && notifs[i].friendRequest){
                                        notifs.splice(i, 1);
                                        break;
                                    }
                                }

                                friends.push(senderId);
                
                                //construct message for the sender
                                const msg = `${firstName} ${lastName} accepted your friend request`;
                
                                //update receiver's friends
                                User.updateOne({_id: receiverId}, {friends, notifs}).then(() =>{
                
                                    //find sender and add receiver onto their friend's list
                                    User.findOne({_id: senderId}).then(sender =>{
                                        const senderFriends = sender.friends;
                
                                        senderFriends.push(receiverId);
                
                                        //update sender's friends and send them a notification
                                        User.updateOne({_id: senderId}, {friends: senderFriends}).then(() =>{
                                            io.sockets.to(active[senderId]).emit(
                                                'ACCEPT_REQUEST', 
                                                {msg}
                                            ); 
                                        });
                                    });
                                });
                            }
                        });
                    }
                }
            });
        });
    
        socket.on("CHANGE_FRIEND_STATUS", data =>{
            const {uid, friendId, status} = data;

            axios.post('http://localhost:5000/friends/status', {senderId: uid, receiverId: friendId}).then(response=>{
                if(status === response.data.status){
                    if(status === 'Add Friend'){
                        User.findOne({_id: uid}).then(result =>{
                            const {firstName, lastName} = result;
                
                            const msg = `sent you a friend request`;
            
                            User.findOne({_id: friendId}).then(user =>{
                                const {notifs} = user;
            
                                let prevRequest = false;
            
                                for(let i =0;i<notifs.length;i++){
                                    if(notifs[i].senderId === uid && notifs[i].friendRequest){
                                        prevRequest = true;
                                        break;
                                    }
                                }                    
                    
                                if(prevRequest){
                                    io.emit('FRIEND_REQUEST', {msg: "Request already has been sent."});
                                }
            
                                else{
                                    const newNotification = new Notification({
                                        friendRequest: true,
                                        read: false,
                                        content: msg,
                                        senderId: uid,
                                        date: new Date()
                                    });
                
                                    notifs.push(newNotification);
                
                                    User.updateOne({_id: friendId}, {notifs}).then(() =>{
                                            io.sockets.to(active[friendId]).emit(
                                                'FRIEND_REQUEST', 
                                                {msg: `${firstName} ${lastName} ${msg}`}
                                            ); 
                                    });
                                }
                            });
                        }); 
                    }

                    else if(status === 'Pending'){
                        User.deleteOne({_id: friendId}).then(()=>{});
                    }

                    else{
                        User.findOne({_id: uid}).then(result =>{
                            const {friends} = result;

                            for(let i=0;i<friends.length;i++){
                                if(friends[i] === friendId){
                                    friends.splice(i, 1);
                                    break;
                                }
                            }

                            User.updateOne({_id: uid}, {friends}).then(()=>{});
                        });

                        User.findOne({_id: friendId}).then(result =>{
                            const {friends} = result;

                            for(let i=0;i<friends.length;i++){
                                if(friends[i] === uid){
                                    friends.splice(i, 1);
                                    break;
                                }
                            }

                            User.updateOne({_id: friendId}, {friends}).then(()=>{});
                        });
                    }
                }
            });
        });
    });
}