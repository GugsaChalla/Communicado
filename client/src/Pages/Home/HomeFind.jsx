import React, { Component } from 'react'
import SearchProfileCard from './SearchProfileCard'

class HomeFind extends Component {
    constructor(props) {
        super(props);
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
        const {uid} = this.props;
        const {query} = this.state;

        // If empty query, return
        if (query.trim() === '') {
            return;
        }

        // If not empty, find Users based on query
        this.props.findUsers(query, uid);
    }


    render() {
        return (
            <div className="HomeFind col-lg-3">
                <div className="card text-center d-flex justify-content-center homeCard w-100 h-100">

                    {/* Card Header */}
                    <div className="card-header rounded-0 cardTitle">
                        <h1 className="display-4">Add Friends</h1>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                        <form className="HomeFind-form" onSubmit={this.handleSubmit}>
                            <input 
                                id='query' 
                                name="query"
                                type="text"
                                className="form-control"
                                placeholder="Search Name"
                                value={this.state.query}
                                onChange={this.handleChange}
                            />
                        </form> 
                        {/* For each user found, render new Profile Card */}
                        {this.props.users.map(user =>
                            <SearchProfileCard key={user._id} user={user}/>      
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default HomeFind;