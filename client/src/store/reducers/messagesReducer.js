import * as types from '../constants/actionTypes';

const initState = {
    composerResults: [],
    recipients: [],
    chats: [],
    msgsOnDisplay: [],
    typingOnDisplay: [],
    chatIdOnDisplay: null,
    unseenChats: false,
    composerChatId: null
};

// Reducer for friend actions
const messagesReducer = (state=initState, action) =>{
    switch(action.type){
        case types.LOAD_COMPOSER_RESULTS:
            return{
                ...state,
                composerResults: [...action.composerResults]
            }
        case types.UPDATE_RECIPIENTS:
            return{
                ...state,
                recipients: [...action.recipients]
            }
        case types.RENDER_COMPOSER_CHAT:
            return{
                ...state,
                composerChatId: action.chatId
            } 
        case types.CLEAR_COMPOSER_CHAT:
            return{
                ...state,
                composerChatId: null
            }
        case types.CLEAR_COMPOSER:
            return{
                ...state,
                queryResults: [],
                recipients: [],
                composerChatId: null
            }
        case types.LOAD_CHATS:
            return{
                ...state,
                chats: [...action.chats]
            }
        case types.SEE_CHATS:
            return{
                ...state,
                unseenChats: false
            }
        case types.CLEAR_CHATS:
            return{
                ...state,
                chats: []
            }
        case types.LOAD_UNSEEN_CHATS:
            return{
                ...state,
                unseenChats: action.unseen
            }
        case types.IS_TYPING:
            return{
                ...state,
                typingOnDisplay : [...state.typingOnDisplay, action.typingId]
            }
        case types.STOP_TYPING:
            return{
                ...state,
                typingOnDisplay: [...action.typingOnDisplay]
            }
        case types.SET_CHAT_ID:
            return{
                ...state,
                chatIdOnDisplay: action.chatId
            }
        case types.LOAD_MESSAGES:
            return{
                ...state,
                msgsOnDisplay: [...action.messages]
            }
        case types.NEW_MESSAGE:
            return{
                ...state,
                msgsOnDisplay: [...state.msgsOnDisplay, action.newMessage]
            }
        case types.CLEAR_TYPING:
            return{
                ...state,
                typingOnDisplay: []
            }
        case types.CLEAR_DISPLAYED_CHAT:
            return{
                ...state,
                msgsOnDisplay: [],
                chatIdOnDisplay: null
            }
        default:
            return state;
    }
}

export default messagesReducer;