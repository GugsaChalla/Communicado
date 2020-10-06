const {User} = require('../models/user');
const {Message, Chat} = require('../models/chat');

const upload = require('../app').msgPicUpload;
const path = require('path');
const fs = require('fs');

exports.getChat = async (req, res) => {
    const {chatId} = req.params;

    if(chatId !== 'home' && chatId !== 'new'){
        const chat = await Chat.findOne({_id: chatId});
        res.json(chat);
    }
}

exports.createMessage = (req, res) => {
    upload(req, res, async () => {
        const newMessage = await createMessageUtil(req.body);
        const {chatId} = req.body;

        if(req.file){
            const {filename} = req.file;
            const newName = 'MESSAGE-' + `${newMessage._id}` + Date.now() + path.extname(filename);
    
            const oldPath = path.join(__dirname, '../',  `images/messages/${filename}`);
            const newPath = path.join(__dirname, '../', `images/messages/${newName}`);

            fs.rename(oldPath, newPath, async () => {
                const {messages} = await Chat.findOne({_id: chatId});


                for(let i=messages.length-1;i>=0;i--){
                    const currMsgId = JSON.stringify(messages[i]._id);
                    const imgMsgId = JSON.stringify(newMessage._id);

                    if(currMsgId === imgMsgId){
                        messages[i].image = newName;
                        newMessage.image = newName;
                        break;
                    }
                }

                await Chat.updateOne({_id: chatId}, {messages});
                res.json(newMessage);
            });
        }

        else{
            res.json(newMessage);
        }
    });
}

const createMessageUtil = async (data) =>{
    const {uid, content, chatId} = data;
    
    const chat = await Chat.findOne({_id:chatId});
    const {messages} = chat;

    const newMessage = new Message({
        senderId: uid,
        content,
        timeSent: new Date(),
        readBy: [uid],
        seenBy: [uid]
    });

    messages.push(newMessage);
    
    await Chat.updateOne(
        {_id:chatId},
        {messages, timeOfLastMessage: newMessage.timeSent}
    );
    
    return newMessage;
}

exports.createChat = (req, res) =>{ 
    upload(req, res, async () => {
        const result = await createChatUtil(req.body);
        const newMessage = result[0];
        const newChatId = result[1];

        if(req.file){
            const {filename} = req.file;
            const newName = 'MESSAGE-' + `${newMessage._id}` + Date.now() + path.extname(filename);
    
            const oldPath = path.join(__dirname, '../',  `images/messages/${filename}`);
            const newPath = path.join(__dirname, '../', `images/messages/${newName}`);

            fs.rename(oldPath, newPath, async () => {
                newMessage.image = newName;

                await Chat.updateOne({_id: newChatId}, {messages: [newMessage]});

                res.json({chatId: newChatId});  
            });
        }

        else{
            res.json({chatId: newChatId});
        }
    });
}

const createChatUtil = async (data) => {
    const {uid, content, recipients} = data;

    const members = JSON.parse(recipients).map(user => user._id);

    //add user creating the chat as a member
    if(!members.includes(uid)){
        members.push(uid);
    }

    const newMessage = new Message({
        senderId: uid,
        content,
        timeSent: new Date(),
        readBy: [uid],
        seenBy: [uid],
    });

    const newChat = new Chat({
        members,
        createdAt: new Date(),
        createdBy: uid,
        messages: [newMessage],
        timeOfLastMessage: new Date()
    });

    const chat = await newChat.save();

    for(let i=0;i<members.length;i++){
        const user = await User.findOne({_id: members[i]});
        const {chats} = user;

        await User.updateOne(
            {_id: members[i]}, 
            {chats: [...chats, chat._id]}
        );
    }

    return [newMessage, chat._id];
}

exports.getMessageImage = async (req, res) => {
    const {chatId, messageId} = req.body;

    if(chatId !== 'home' && chatId !== 'new'){
        const chat = await Chat.findOne({_id: chatId});
        const {messages} = chat;

        let imgName = '';

        for(let i=0;i<messages.length;i++){
            const currMsgId = JSON.stringify(messages[i]._id);
            const imgMsgId = JSON.stringify(messageId);

            if(currMsgId === imgMsgId){
                imgName = messages[i].image;
                break;
            }
        }

        res.sendFile(path.join(__dirname, '../', `images/messages/${imgName}`));
    }
}

exports.getUserChats = async (req, res) =>{
    const {uid} = req.params;

    let userChats = [];

    const user = await User.findOne({_id: uid});
    const {chats} = user;

    for(let i=0;i<chats.length;i++){
        const chat = await Chat.findOne({_id: chats[i]});
        userChats.push(chat);
    }

    userChats.sort((a, b) => b.timeOfLastMessage - a.timeOfLastMessage);

    res.json(userChats);
}

exports.getMemberNames =  async (req, res) =>{
    const {uid, chatId} = req.body;

    if(chatId !== 'new' && chatId !== 'home'){
        
        let result = '';

        const chat = await Chat.findOne({_id: chatId});
        const {members} = chat;

        members.splice(members.indexOf(uid), 1);
    
        for(let i=0;i<members.length;i++){
            const user = await User.findOne({_id: members[i]});

            const {firstName, lastName} = user;

            if(i === members.length - 1){
                result+=`${firstName} ${lastName}`;
            }

            else{
                result+=`${firstName} ${lastName}, `;
            }
        }

        res.json({memberNames: result});
    }
}

exports.getChatMessages = async (req, res) =>{
    const {chatId} = req.params;

    if(chatId !== 'home' && chatId !== 'new'){
        const chat = await Chat.findOne({_id: chatId});
        const {messages} = chat;
    
        res.json(messages);
    }
}

exports.getChatMemberIds = async (req, res) =>{
    const {uid, chatId} = req.body;

    if(chatId !== 'home' && chatId !== 'new'){
        const chat = await Chat.findOne({_id: chatId});
        const {members} = chat;
        
        res.json({members: members.filter(id => id !== uid)});
    }
}

exports.checkForUnseenChats = async (req, res) => {
    const {uid} = req.params;

    const user = await User.findOne({_id: uid});
    const {chats} = user;

    let unseen = false;

    for(let i=0;i<chats.length;i++){
        const chat = await Chat.findOne({_id: chats[i]});
        const {messages} = chat;

        const n = messages.length;
 
        unseen |= !messages[n-1].seenBy.includes(uid);
    }

    res.json({unseen}); 
}

exports.seeChats = async (req, res) =>{
    const {uid} = req.params;

    const user = await User.findOne({_id: uid});
    const {chats} = user;

    for(let i=0;i<chats.length;i++){
        const chat = await Chat.findOne({_id: chats[i]});
        const {messages} = chat;

        const n = messages.length;

        if(!messages[n-1].seenBy.includes(uid)){
            messages[n-1].seenBy.push(uid);
        }

        await Chat.updateOne({_id: chats[i]}, {messages});
    }

    res.json({msg: "Chats seen"});
}

exports.readChat = async (req, res) => {
    const {chatId, uid} = req.body;

    if(chatId !== 'new' && chatId !== 'home'){
        const chat = await Chat.findOne({_id: chatId});
        const {messages} = chat;
    
        for(let i = 0; i < messages.length; i++){
            if(messages[i].readBy.includes(uid)){
                continue;
            }
    
            messages[i].readBy.push(uid);
        }
    
        await Chat.updateOne({_id: chatId}, {messages});
    
        res.json({msg: 'Success'});
    }
}

exports.checkIfChatExists = async (req, res) => {
    const {uid, memberId} = req.body;

    const user = await User.findOne({_id: uid});
    const member = await User.findOne({_id: memberId});

    const userChats = user.chats;
    const memberChats = member.chats;

    let chatId = null;
    const map = {};

    for(let i=0;i<userChats.length;i++){
        map[userChats[i]] = true;
    }

    for(let j=0;j<memberChats.length;j++){
        if(map[memberChats[j]]){
            const chat = await Chat.findOne({_id: memberChats[j]});
            const {members} = chat;

            if(members.length === 2){
                chatId = chat._id;
            }

            if(chatId){break;}
        }
    }

    res.json({chatId});
}


exports.handleComposerQuery = async (req, res) =>{
    const {uid,recipients, name} = req.body;
    const recipientIDs={};

    for(let i=0;i<recipients.length;i++){
        recipientIDs[recipients[i]._id]=true
    }

    const user = await User.findOne({_id: uid});
    const friends = await User.find({_id: {$in: user.friends}});

    let j = 0;

    const result = [];

    for(let i=0;i<friends.length && j<4;i++){
        const friend = await User.findOne({_id: friends[i]._id});

        let firstName = friend.firstName.split(" ").join("").toLowerCase();
        let lastName = friend.lastName.split(" ").join("").toLowerCase();
        
        let query = name.split(" ").join("").toLowerCase();

        if((firstName + lastName).startsWith(query) && !recipientIDs[friend._id]){
            result.push(friend);
            j++;
        }
    }

    res.json(result);
}