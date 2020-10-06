import * as types from '../constants/actionTypes';
import axios from 'axios';

const config = {headers: {'content-type': 'application/json'}};

export const getRecipients = (uid, name, recipients) =>{
    return async (dispatch) => {
        let composerResults = [];

        if(name){
            const data = {uid, name, recipients};
    
            const response = await axios.post('http://localhost:5000/chats/composer', data , config);
            composerResults = response.data;
        }

        dispatch({
            type: types.LOAD_COMPOSER_RESULTS, 
            composerResults
        });
    }
}

export const updateRecipients = (recipients) =>{
    return (dispatch) =>{
        dispatch({
            type: types.UPDATE_RECIPIENTS, 
            recipients
        });
    }
}

export const renderComposerChat = (chatId) => {
    return (dispatch) => {
        dispatch({
            type: types.RENDER_COMPOSER_CHAT,
            chatId
        });
    }
}

export const clearComposerChat = () => {
    return (dispatch) => {
        dispatch({type: types.CLEAR_COMPOSER_CHAT});
    }
}

export const clearComposer = () =>{
    return (dispatch) =>{
        dispatch({type: types.CLEAR_COMPOSER});
    }
}

export const readChat = (chatId, uid, lastMsg, isActive) => {
    return async (dispatch, getState) => {
        if(isActive){
            await axios.post(`http://localhost:5000/chats/readchat`, {chatId, uid}, config);

            const state = getState();
            const {chats} = state.messages;
    
            for(let i = 0; i < chats.length; i++){
                if(chats[i]._id === chatId){
                    const {messages} = chats[i];
                    const n = messages.length;
    
                    messages[n - 1].readBy.push(uid);
                    
                    break;
                }
            }
    
            dispatch({
                type: types.LOAD_CHATS,
                chats
            });
        }

        return lastMsg.readBy.includes(uid);
    }
}

export const getChatPics = async (chatId, uid, loadProfilePic) => {
        const members = await getMemberIds(chatId, uid);

        const size = Math.min(members.length, 2);
        const chatPics = [];

        for(let i=0;i<size;i++){
            chatPics.push(await loadProfilePic(members[i]));
        }

        return chatPics;
}
//returns object with property memberNames that has a value of a string of names
export const getMemberNames = async (chatId, uid) => {
    const response = await axios.post(`http://localhost:5000/chats/members`, {uid, chatId}, config);
    const memberNames = response.data.memberNames;
    return memberNames;
}

export const loadChats = (uid, cancelSource = null) =>{
    return async (dispatch) =>{
        const route = `http://localhost:5000/chats/user/${uid}`;

        const response = (cancelSource)? 
            await axios.get(route, {cancelToken: cancelSource.token}):
            await axios.get(route);
        
        const chats = response.data;

        dispatch({
            type: types.LOAD_CHATS, 
            chats
        });
    
        return chats;
    }
}

export const seeChats = (uid) => {
    return async (dispatch) => {
        await axios.put(`http://localhost:5000/chats/seechats/${uid}`);
        dispatch({type: types.SEE_CHATS});
    }
}

export const clearChats = () =>{
    return (dispatch) => {
        dispatch({type: types.CLEAR_CHATS});
    }
}


export const getUnseenChats = (uid) => {
    return async (dispatch) => {
        const response = await axios.get(`http://localhost:5000/chats/unseen/${uid}`);
        const {unseen} = response.data;

        dispatch({
            type: types.LOAD_UNSEEN_CHATS, 
            unseen
        });
    }
}

export const createChat = async (uid, recipients, content, photo) => {
    const formData = new FormData();
    const image = (photo) ? photo[0] : '';
    content = (content.trim() === '') ? '' : content;

    formData.append('uid', uid);
    formData.append('content', content);
    formData.append('recipients', JSON.stringify(recipients));
    formData.append('image', image);

    const fdConfig = {headers:{'content-type': 'multipart/form-data'}};

    const response = await axios.post('http://localhost:5000/chats/create', formData, fdConfig);
    const {chatId} = response.data; 
    return chatId;
}


export const sendMessage = async (chatId, uid, content, photo) =>{
    const formData = new FormData();
    const image = (photo) ? photo[0] : '';
    content = (content.trim() === '') ? '' : content;

    formData.append('chatId', chatId);
    formData.append('uid', uid);
    formData.append('content', content); 
    formData.append('image', image);

    const fdConfig = {headers:{'content-type': 'multipart/form-data'}};

    const response = await axios.post('http://localhost:5000/chats/message', formData, fdConfig);
    const newMessage = response.data;
    return newMessage;
}

export const getMessageImage = async (chatId, messageId) => {
    const data = {chatId, messageId};

    const response = await fetch('http://localhost:5000/chats/image', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: config['headers']
    });

    let file = await response.blob();

    return URL.createObjectURL(file);
}

export const getMemberIds = async (chatId, uid) => {
    const response = await axios.post('http://localhost:5000/chats/memberids', {uid, chatId});
    const memberIds = response.data.members;
    return memberIds;
}

export const handleIsTyping = (uid, chatId) =>{
    return async (dispatch, getState) => {
        const state = getState();

        const {chatIdOnDisplay, typingOnDisplay} = state.messages;
        
        if(chatIdOnDisplay === chatId && !typingOnDisplay.includes(uid)){
            dispatch({
                type: types.IS_TYPING, 
                typingId: uid
            });
        }
    }
};

export const handleStopTyping = (uid, chatId) =>{
    return async (dispatch, getState) => {
        const state = getState();

        const {chatIdOnDisplay, typingOnDisplay} = state.messages;
        
        if(chatIdOnDisplay === chatId){
            for(let i=0;i<typingOnDisplay.length;i++){
                if(typingOnDisplay[i] === uid){
                    typingOnDisplay.splice(i,1);
                }
            }

            dispatch({
                type: types.STOP_TYPING, 
                typingOnDisplay
            });
        }
    }
}

export const setChatIdOnDisplay = (chatId) => {
    return (dispatch) =>{
        dispatch({
            type: types.SET_CHAT_ID, 
            chatId
        });
    }
}

export const setMsgsOnDisplay = (chatId, uid) =>{
    return async (dispatch) =>{
        const response = await axios.get(`http://localhost:5000/chats/messages/${chatId}`);
        const messages = response.data;

        for(let i=0;i<messages.length;i++){
            if(messages[i].readBy.includes(uid)){
                continue;
            }

            messages[i].readBy.push(uid);
        }

        dispatch({
            type: types.LOAD_MESSAGES, 
            messages
        });
    }
}

export const renderNewMessage = (newMessage, chatId, uid) =>{
    return (dispatch, getState) => {
        const state = getState();

        const {chatIdOnDisplay} = state.messages;

        if(chatIdOnDisplay === chatId){
            if(!newMessage.readBy.includes(uid)){
                newMessage.readBy.push(uid);
            }

            dispatch({
                type: types.NEW_MESSAGE, 
                newMessage
            });
        }
    }
}

export const getReadReceipts = async (readBy, uid, getProfilePic) => {
    const readReceipts = [];

    for(let i=0;i<readBy.length;i++){
        if(readBy[i] === uid){
            continue;
        }

        const imgURL = await getProfilePic(readBy[i]);

        readReceipts.push(imgURL);
    }

    return readReceipts;
}

export const handleReadReceipts = (chatId, readerId) => {
    return (dispatch, getState) => {
        const state = getState();

        const {chatIdOnDisplay, msgsOnDisplay} = state.messages;
        const messages = msgsOnDisplay;

        if(chatIdOnDisplay === chatId){
            for(let i =0;i<messages.length;i++){
                if(messages[i].readBy.includes(readerId)){
                    continue;
                }

                messages[i].readBy.push(readerId);
            }

            dispatch({
                type: types.LOAD_MESSAGES,
                messages
            });
        }
    }
}

export const filterMsgCards = (uid, query)=>{
    return async (dispatch) =>{
        const result = [];

        let response = await axios.get(`http://localhost:5000/chats/user/${uid}`); 
        const chats = response.data;
    
        for(let i=0;i<chats.length;i++){    
            const chatId = chats[i]._id;

            response = await axios.post(`http://localhost:5000/chats/members`, {uid, chatId}, config);
            let {memberNames} = response.data;
             
            memberNames = memberNames.split(" ").join("").toLowerCase();
            query = query.split(" ").join("").toLowerCase();

            if (chats[i].members.length-1!==1){
                let chatMembers = memberNames.split(",");

                for(let j=0;j<chatMembers.length;j++){
                    if(chatMembers[j].startsWith(query)){
                        result.push(chats[i]);
                        break;
                    }
                }
            }
            
            else if(memberNames.startsWith(query)){
                 result.push(chats[i]);
            }
        }

        dispatch ({
            type: types.LOAD_CHATS, 
            chats: result
        });
    }
}

export const checkIfChatExists = async (uid, memberId) => {
    const data = {uid, memberId};

    const response = await axios.post('http://localhost:5000/chats/exists', data, config);
    const {chatId} = response.data;

    return chatId;
}

export const getChat = async (chatId) => {
    const response = await axios.get(`http://localhost:5000/chats/${chatId}`);
    return response.data;
}

export const clearTyping = () => {
    return (dispatch) => {
        dispatch({type: types.CLEAR_TYPING});
    }
}

export const clearChatOnDisplay = () => {
    return (dispatch) => {
        dispatch({type: types.CLEAR_DISPLAYED_CHAT});
    }
}