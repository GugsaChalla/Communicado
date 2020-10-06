import React, { Component } from 'react';
import {findFriends, loadFriends} from '../store/actions/friendsActions';
import './css/FilterForm.css'

// Class that creates form that filters through a friends list 
// Takes up a row, goes in a container
class FilterForm extends Component {
    constructor() {
        super();

        this.state = { 
            friendQuery: "" 
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    // Handle change in input to adjust state every character
    handleChange(evt) {
        this.setState({ [evt.target.name] : evt.target.value });
    }

    // Trim result on submit and findFriends from props with given query
    handleKeyUp(){
        const {friendQuery} = this.state;
        const {uid, dispatch} = this.props;
        
        if(friendQuery.trim() === "") { 
            dispatch(loadFriends(uid));
            return; 
        }
        
        dispatch(findFriends(friendQuery, uid));
    }

    render() {
        const {friendQuery} = this.state;

        return (
            <div className="row my-4 py-3 FilterForm">
                <div className = "col-12 d-flex justify-content-center text-center">
                    <form className="FilterForm-form">
                        <label htmlFor="friendQuery">Search your friends: </label>
                        <input 
                            type = "text"
                            name = "friendQuery"
                            value = {friendQuery}
                            onChange = {this.handleChange}
                            onKeyUp = {this.handleKeyUp}
                            placeholder = "Name"
                            className="FilterForm-inp"
                        />
                    </form>
                </div>
            </div>
        )
    }
}

export default FilterForm;