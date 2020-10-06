// Actions regarding friends such as find all users or find all friends
import * as types from '../constants/actionTypes';
import axios from 'axios';

const config = {headers: {'Content-Type': 'application/json'}};

export const getFriendStatus  = async (receiverId, senderId) => {
    const data = {receiverId, senderId};
    const response = await axios.post('http://localhost:5000/friends/status', data, config);
    return response.data.status;
}

// Finds all users in the database that match a given name
export const findUsers = (name, uid) => {
    return async (dispatch) => {
        const data = {
            name: name.trim(),
            uid,
            findFriends: false
        }
       
        const response = await axios.post('http://localhost:5000/users/search', data , config);
        const {users} = response.data;

        dispatch({
            type: types.USERS_FOUND, 
            users
        });
    }
}

export const clearUsers = () =>{
    return (dispatch) =>{
        dispatch({type: types.CLEAR_USER_SEARCH});
    }
}

export const findFriends = (name, uid) =>{
    return async (dispatch) =>{
        const data = {
            name: name.trim(),
            uid,
            findFriends: true
        };

        const response = await axios.post('http://localhost:5000/users/search', data , config);
        const friends = response.data.users;

        dispatch({
            type: types.UPDATE_FRIENDS, 
            friends
        });
    }
}


export const loadFriends = (uid) =>{
    return async (dispatch) =>{
        const response = await axios.get(`http://localhost:5000/friends/${uid}`);
        const friends = response.data;
        
        dispatch({
            type: types.UPDATE_FRIENDS, 
            friends
        });
    }
}

export const countFriends = (uid) =>{
    return async (dispatch) =>{
        const response = await axios.get(`http://localhost:5000/friends/${uid}`)
        const numFriends = response.data.length;
    
        dispatch({
            type: types.COUNT_FRIENDS, 
            numFriends
        });
    }
}

export const removeFriend = (friendId, friends) =>{
    return (dispatch) => {
        for(let i=0;i<friends.length;i++){
            if(friends[i]._id === friendId){
                friends.splice(i, 1);
                break;
            }
        }

        dispatch({
            type: types.UPDATE_FRIENDS, 
            friends
        });
    }
}

export const updateOnlineFriends = (friends) =>{
    return (dispatch) =>{
        dispatch({
            type: types.LOAD_ONLINE_FRIENDS,
            active: friends
        });
    }
}

export const changeFriendStatus = async (uid, friendId, iconStatus) => {
    let response = await axios.post('http://localhost:5000/friends/status', {senderId: uid, receiverId: friendId}, config);
    const serverStatus = response.data.status;

    const data = {
        uid,
        friendId, 
        iconStatus,
        serverStatus
    }

    response = await axios.post('http://localhost:5000/friends/change', data, config);
    const {msg} = response.data;

    return msg;
}

export const acceptFriendRequest = async (receiverId, senderId, clientStatus) => {
    let response = await axios.post('http://localhost:5000/friends/status', {receiverId, senderId}, config);
    const serverStatus = response.data.status;

    const data = {
        receiverId,
        senderId,
        clientStatus, 
        serverStatus
    }

    response = await axios.post('http://localhost:5000/friends/accept', data, config);
    const {msg} = response.data;

    return msg;
}

export const declineFriendRequest = async (receiverId, senderId) => {
    const response = await axios.post('http://localhost:5000/friends/decline',{receiverId, senderId}, config);
    const {msg} = response.data;
    return msg;
}

export const getUserFriends = async (uid) => {
    const response = await axios.get(`http://localhost:5000/friends/${uid}`);
    const friends = response.data;
    return friends;
}