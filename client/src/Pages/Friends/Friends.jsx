import React, { Component } from 'react';
import {connect} from 'react-redux';
import FindForm from '../../Partials/FindForm'
import FilterForm from '../../Partials/FilterForm'
import FriendGrid from './FriendGrid'
import './css/Friends.css'

// Friends Page composed of separate components in Partials that make up the page
class Friends extends Component {
    render() {
        const {uid, users, dispatch} = this.props;
        
        return (
            <div className="Friends">
                <div className="container-fluid p-0">
                    {/* Find new friends with jumbotron that has functionallity passed to it */}
                    <FindForm  
                        uid = {uid}
                        users = {users}
                        dispatch = {dispatch}
                    />

                    {/* Form to filter a friends list */}
                    <FilterForm uid={uid} dispatch={dispatch}/>

                    {/* Grid of friendCards */}
                    <FriendGrid />
                </div>
            </div>
        )
    }
}

//put data from reducer into props to store current users ID and the users found (variables for props)
const mapStateToProps = (state) =>{
    return {
        users: state.friends.users,
        uid: state.auth.uid
    }
}

//puts actions into props - All the methods for props
const mapDispatchToProps = (dispatch) => ({dispatch});

export default connect(mapStateToProps, mapDispatchToProps)(Friends);