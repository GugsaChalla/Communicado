import React from 'react';
import {colorNotif} from '../store/actions/notificationsActions';
import {updateOnlineFriends} from '../store/actions/friendsActions';
import * as msgActions from '../store/actions/messagesActions';
import {toast} from 'react-toastify';
import ToastMsg from '../Partials/ToastMsg';
import 'react-toastify/dist/ReactToastify.css';

export const handleSocketEvents = (io, dispatch) =>{
    
    io.on('FRIEND_REQUEST', data =>{
        const {toastId} = data;

        dispatch(colorNotif());

        toast.info(<ToastMsg toastId = {toastId} msg ={'sent you a friend request!'}/>,{
            draggable: false,
            position: toast.POSITION.BOTTOM_RIGHT
        });
    });
    
    io.on("ACCEPT_REQUEST", data =>{
        const {toastId} = data;

        dispatch(colorNotif());

        toast.success(<ToastMsg toastId={toastId} msg={'accepted your friend request!'}/>, {
            draggable: false,
            position: toast.POSITION.BOTTOM_RIGHT
        });
    });

    io.on('GET_ONLINE_FRIENDS', data =>{
        dispatch(updateOnlineFriends(data.friends));
    });

    io.on('CHAT_CREATED', data =>{
        const{loadChats}=msgActions;

        dispatch(loadChats(data.uid));
    });

    io.on('NEW_MESSAGE', async data =>{
        const {newMessage, chatId, uid} = data;

        const {
            loadChats,
            renderNewMessage, 
            getMemberIds, 
            getUnseenChats
        } = msgActions

        dispatch(loadChats(uid));
        dispatch(getUnseenChats(uid));
        dispatch(renderNewMessage(newMessage, chatId, uid));

        const members = await getMemberIds(chatId, uid);

        io.emit('READ_RECEIPTS', {
            chatId, 
            members,
            uid
        });
    });

    io.on('IS_TYPING', data =>{
        const {uid, chatId} = data;
        const {handleIsTyping} = msgActions;
        
        dispatch(handleIsTyping(uid,chatId));
    });

    io.on('STOP_TYPING', data =>{
        const {uid, chatId} = data;
        const {handleStopTyping} = msgActions

        dispatch(handleStopTyping(uid,chatId));
    });

    io.on('READ_RECEIPTS', data => {
        const {chatId, readerId} = data;

        const {handleReadReceipts} = msgActions;

        dispatch(handleReadReceipts(chatId, readerId));
    });
}