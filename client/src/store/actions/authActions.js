// Authentication actions for a user
import * as types from '../constants/actionTypes';
import axios from 'axios';

const config = {headers: {'Content-Type': 'application/json'}};

// User login given a set of credentials
export const login = (credentials, alert) => {
    return async (dispatch) =>{
        const data = {...credentials};

        // Send login as json and check if login is successful
        const response = await axios.post('http://localhost:5000/users/login', data, config)
        const {msg, uid} = response.data; 

        if(msg==='Success'){
            dispatch({
                type: types.SIGNIN_SUCCESS, 
                uid
            });
        }
        
        else {
            alert.error(msg);
        }
    }
}

// User signup function with given credentals
export const signUp = (credentials, alert) => {
    return async (dispatch) =>{
        const {firstName, lastName} = credentials;

        if(!isValidName(firstName) || !isValidName(lastName)){
            alert.error("Invalid name: First name and last name should only contain letters!");
            return;    
        }

        // Create data object with form values
        const data = {...credentials};

        // Use axios to post message to server
        const response = await axios.post('http://localhost:5000/users/signup', data, config);
        const {msg, uid} = response.data;

        if (msg === 'Success') {
            dispatch({
                type: types.SIGNIN_SUCCESS, 
                uid
            });
        } 
        
        else {
            alert.error(msg)
        }
    }
}

const isValidName = (name) => {
    let valid = true;

    for(let i=0;i<name.length;i++){
        if(name[i].toLowerCase() !== name[i].toUpperCase()){
            continue;
        }

        else{
            valid = false;
            break;
        }
    }

    return valid;
}