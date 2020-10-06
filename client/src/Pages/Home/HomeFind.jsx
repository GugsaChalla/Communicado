import React, { Component } from 'react'
import {findUsers, clearUsers} from '../../store/actions/friendsActions';
import SearchProfileCard from './SearchProfileCard';

class HomeFind extends Component {
    constructor() {
        super();

        this.state = { query: "" };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // Change the state name to the value that the user is typing
    handleChange(evt) {
        this.setState({ [evt.target.name] : evt.target.value });
    }

    // If user query is not empty, find Users with that match the query
    handleSubmit(e){
        e.preventDefault();

        // Destructuring
        const {uid, dispatch} = this.props;
        const {query} = this.state;

        // If empty query, return
        if (query.trim() === '') {
            dispatch(clearUsers());
        } else{
            dispatch(findUsers(query, uid));
        }
    }

    render() {
        const {uid, users} = this.props;
        const {query} = this.state;

        return (
            <div className="HomeFind col-lg-12 col-xl-3 mb-4 mb-sm-4 mb-md-4 mb-lg-4 mb-xl-0">
                <div className="card text-center d-flex justify-content-center homeCard w-100 h-100">

                    {/* Card Header */}
                    <div className="card-header rounded-0 cardTitle">
                        <h1 className="display-4">Add Friends</h1>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                        <form className="HomeFind-form" onSubmit={this.handleSubmit}>
                            <input 
                                id = 'query' 
                                name = "query"
                                type = "text"
                                className = "form-control"
                                placeholder = "Search Name"
                                value = {query}
                                onChange = {this.handleChange}
                            />
                        </form> 

                        {/* For each user found, render new Profile Card */}
                        {users.map(user =>
                            <SearchProfileCard key={user._id} user={user} uid={uid}/>      
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default HomeFind;