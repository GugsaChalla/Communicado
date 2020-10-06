const active = {};

//io= socket(server) from app.js
module.exports = (io) => {
    io.on('connection', socket => {
        // JOIN SERVER --- store socket id
        socket.on('JOIN_SERVER', data =>{
            active[data.uid] = socket.id;
        });

        // DISCONNECT FROM SERVER --- delete socket id
        socket.on("DISCONNECT", data =>{
            delete active[data.uid];
        });

        // ACCEPT FRIEND REQUEST --- Store sender and recipient data from request
        socket.on("ACCEPT_REQUEST", async data =>{
            const {receiverId, senderId} = data;
            
            io.sockets.to(active[senderId]).emit(
                'ACCEPT_REQUEST', 
                {toastId: receiverId}
            ); 
        });

        socket.on("CHANGE_FRIEND_STATUS", async data =>{
            const {uid, friendId, msg} = data;

            if(msg){
                io.sockets.to(active[friendId]).emit(
                    'FRIEND_REQUEST', 
                    {toastId: uid}
                );
            }
        });

        socket.on('GET_ONLINE_FRIENDS', async data =>{
            const {allFriends, uid} = data;

            const activeFriends = [];

            for(let i=0;i<allFriends.length;i++){
                if(active[allFriends[i]._id]){
                    activeFriends.push(allFriends[i]);
                }
            }

            io.sockets.to(active[uid]).emit('GET_ONLINE_FRIENDS',{
                    friends: activeFriends
            });
        });

        socket.on('CREATE_CHAT', async data =>{
            const {recipients, uid} = data;

            for(let i=0;i<recipients.length;i++){
                const id =recipients[i]._id;

                if(id !== uid){
                    io.sockets.to(active[id]).emit(
                        'CHAT_CREATED', {uid: id}
                    );
                }
            }
        });

        socket.on('NEW_MESSAGE', data => {
            const {chatId, members, newMessage} = data;

            for(let i =0;i<members.length;i++){
                const uid = members[i];

                io.sockets.to(active[members[i]]).emit('NEW_MESSAGE', {
                    chatId, 
                    newMessage,
                    uid
                });
            }
        });

        socket.on('IS_TYPING',data =>{
            const {uid, members,chatId} = data;
            
            for(let i=0;i<members.length;i++){
                io.sockets.to(active[members[i]]).emit(
                    'IS_TYPING', {chatId, uid}
                );
            }
        });

        socket.on('STOP_TYPING',data =>{
            const {uid, members,chatId} = data;
            
            for(let i=0;i<members.length;i++){
                io.sockets.to(active[members[i]]).emit(
                    'STOP_TYPING', {chatId, uid}
                );
            }
        });

        socket.on('READ_RECEIPTS', data => {
            const {chatId, members, uid} = data;

            for(let i=0;i<members.length;i++){
                const id = members[i];

                io.sockets.to(active[id]).emit('READ_RECEIPTS',{
                    chatId,
                    readerId: uid
                });
            }
        }); 
    });
}