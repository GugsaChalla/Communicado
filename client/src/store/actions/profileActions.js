// Actions for users to interact with their profile and update any settings
import axios from 'axios';

// Get user profile info
export const getUserInfo = (uid) =>{
    return (dispatch) =>{
        // Send json
        const config = {
            headers: {'Content-Type': 'application/json'}
        }
        // Send post request to userInfo branch in server handlers
        axios.post('http://localhost:5000/userinfo', {uid}, config).then(response =>{
            const {firstName, lastName} = response.data;
            dispatch({
                type: "USER_INFO",
                firstName,
                lastName
            });
        });
    }
}

// export const getUserInfo = async (uid) =>{
//     return (dispatch) => {
//         const config = {
//             headers: {'Content-Type': 'application/json'}
//         }
//         // Send post request to userInfo branch in server handlers
//         axios.post('http://localhost:5000/userinfo', {uid}, config).then(response =>{
//             const {firstName, lastName} = response.data;
//             dispatch({
//                 type: "USER_INFO",
//                 firstName,
//                 lastName
//             });
//         });
//     }
// }

// Load a users profile picture 
export const loadProfilePic = (uid) =>{
    return (dispatch) =>{
            const data = {action: 'load', uid};
            const config={'Content-Type': 'application/json'};
            // Fetch from server functional route using post with stringified data
            fetch('http://localhost:5000/profilepic', {method: 'POST', headers:  config , body: JSON.stringify(data)}) 
            .then(response =>response.blob())
            .then(file =>{
                dispatch({type: "LOAD_PROFILE_PIC", imgURL: URL.createObjectURL(file)});
            });
    }
}

// export const loadProfilePic = async (uid) =>{
//     return (dispatch) => {
//         const data = {action: 'load', uid};
//         const config={'Content-Type': 'application/json'};
//         // Fetch from server functional route using post with stringified data
//         const response = await fetch('http://localhost:5000/profilepic', {method: 'POST', headers:  config , body: JSON.stringify(data)}) 
//         file = await response.blob()
//         dispatch({type: "LOAD_PROFILE_PIC", imgURL: URL.createObjectURL(file)});
//     }
// }

// Changes a users profile picture based on the given image
export const changeProfilePic = (uid, imgFile) => {
    return () => {
            const formData =new FormData();

            formData.append('uid',  uid);
            formData.append('image', imgFile);
    
            const config = {headers: {'Content-Type': 'multipart/form-data'}};
            // Post new image and reload browser
            axios.post('http://localhost:5000/profilepic', formData, config)
            .then(()=> window.location.reload());
    }
}

// export const changeProfilePic = async (uid, imgFile) => {
//     return () => {
//         const formData = new FormData();

//         formData.append('uid',  uid);
//         formData.append('image', imgFile);
    
//         const config = {headers: {'Content-Type': 'multipart/form-data'}};
        
//         // Post new image and reload browser
//         const response = await axios.post('http://localhost:5000/profilepic', formData, config)
//         window.location.reload();
//     }
// }

// Change users name based on a given first name, last name or both
export const changeUserName = (uid, firstName, lastName) =>{
    return (dispatch) =>{
        const data={
            uid,
            firstName,
            lastName
        }
        // Send all names, even if undefined, and handle in server routes
        axios.post('http://localhost:5000/changename', data , {headers: {'content-type': 'application/json'}})
        .then(response => {
            const {_doc, msg} =response.data;
            if(_doc){
                dispatch({type: 'CHANGE_NAME', firstName: _doc.firstName, lastName: _doc.lastName})
            }
            alert(msg);
        });
    }
}

// export const changeUserName = async (uid, firstName, lastName) =>{
//     return (dispatch) => {
//         const data = {uid, firstName, lastName}
//         // Send all names, even if undefined, and handle in server routes
//         const response = await axios.post('http://localhost:5000/changename', data , {headers: {'content-type': 'application/json'}})
//         const {_doc, msg} =response.data;
//         if(_doc){
//             dispatch({type: 'CHANGE_NAME', firstName: _doc.firstName, lastName: _doc.lastName})
//         }
//         alert(msg);
//     }
// }

// Change passwords by providing old password and new password twice
export const changePwd = (uid, currPwd, newPwd, confirmPwd) =>{
    return () =>{
        const data={uid, currPwd, newPwd, confirmPwd}
        // Send post to server route to handle passwords and check if conditions met
        axios.post('http://localhost:5000/changepwd', data, {headers:{'content-type': 'application/json'}})
        .then(response =>{
            const {msg} = response.data;
            alert(msg);
        });
    }
}

// export const changePwd = async (uid, currPwd, newPwd, confirmPwd) => {
//     return () => {
//         const data = {uid, currPwd, newPwd, confirmPwd}
//         // Send post to server route to handle passwords and check if conditions met
//         const response = await axios.post('http://localhost:5000/changepwd', data, {headers:{'content-type': 'application/json'}});
//         const {msg} = response.data;
//         alert(msg);
//     }
// }

export const deleteUser = (uid) =>{
    return () =>{ 
        const data = {uid}
        
        axios.post('http://localhost:5000/deleteUser', data,   {headers: {'content-type': 'application/json'}}).then(response =>{
            const {msg} =response.data;
            alert(msg);
            window.localStorage.clear();
            window.location.href='/';
        }); 
    }
}

// // Delete a User
// export const deleteUser = async (uid) =>{
//     return () =>{ 
//         const data = {uid}
//         // Delete user from DB
//         const response = await axios.post('http://localhost:5000/deleteUser', data,   {headers: {'content-type': 'application/json'}})
//         const {msg} =response.data;
//         alert(msg);
//         window.localStorage.clear();
//         window.location.href='/';
//     }
// }