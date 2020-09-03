// Authentication actions for a user
import * as types from '../constants/actionTypes';
import axios from 'axios';

// User login given a set of credentials
export const login = (credentials) => {
    return async (dispatch) =>{
        const data = {...credentials};
        // Send login as json and check if login is successful
        const response = await axios.post('http://localhost:5000/users/login', data, {headers: {'Content-Type': 'application/json'}})
        const {msg, uid} = response.data; 

        if(msg==='Success'){
            dispatch({type: types.LOGIN_SUCCESS, uid});
        }
        else {
            alert(msg);
        }
    }
}

export const helloword = () => {
    return 2;
}

// User signup function with given credentals
export const signUp = (credentials) => {
    return async (dispatch) =>{
           // Create data object with form values
           const data = {...credentials};

           // Basic config for "post" axios method
           const config = {
               headers: {'Content-Type': 'application/json'}
           }
   
            // Use axios to post message to server
            const response = await axios.post('http://localhost:5000/users/signup', data, config)
            if (response.data.msg === 'Success') {
                dispatch({type: types.SIGNUP_SUCCESS, uid: response.data.uid});
            } else {
               alert(response.data.msg)
            }
    }
}