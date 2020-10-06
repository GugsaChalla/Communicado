import React, {Component} from 'react';
import {Redirect, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as friendActions from '../../store/actions/friendsActions';
import {getAccountData} from '../../store/actions/profileActions';
import HomeFind from './HomeFind';
import ProfileCard from './ProfileCard';
import OnlineFriendList from './OnlineFriendList';
import {io} from '../../App';
import './css/Home.css';

let interval = [];

class Home extends Component{
    constructor(){
        super();
        this.getOnlineFriends = this.getOnlineFriends.bind(this);
    }

    // After init render, read userID and get info + picture to display
    async componentDidMount(){
        const {uid, dispatch} = this.props;
        const {loadFriends, countFriends} = friendActions;
        
        dispatch(getAccountData(uid));
        dispatch(loadFriends(uid));
        dispatch(countFriends(uid));

        await this.getOnlineFriends();
    }

    async getOnlineFriends(){
        const {uid} = this.props;
        const {getUserFriends} = friendActions;

        const allFriends = await getUserFriends(uid);

        io.emit('GET_ONLINE_FRIENDS', {uid, allFriends});

        interval = setInterval(async () =>{
            const allFriends = await getUserFriends(uid);

            io.emit('GET_ONLINE_FRIENDS', {
                uid, 
                allFriends
            });
        }, 5000);
    }

    // Clear users when moving pages
    componentWillUnmount(){
        const {dispatch} = this.props;
        const {clearUsers} = friendActions;

        clearInterval(interval);
        dispatch(clearUsers());
    }

    render() {
        const {uid, dispatch, firstName, lastName, dateCreated, active, users, numFriends} = this.props;

        // If no UID, send user to Login page
        if (!uid) {
            return <Redirect to='/'/>
        }
       
        return (
            <div className='home'>
                {/* Make container 100% height of the 92vh from css */}
                <div className="container-fluid h-100">
                    <div className="row homeRow">
                        
                        {/* Empty column to fill spot */}
                        <div className="col"></div>

                        <HomeFind 
                            dispatch = {dispatch}
                            uid={uid} 
                            users={users}
                        />  

                        <ProfileCard 
                            uid = {uid} 
                            firstName = {firstName} 
                            lastName = {lastName} 
                            numFriends = {numFriends}
                            dateCreated = {dateCreated}
                            dispatch = {dispatch}
                        />
                      
                        <OnlineFriendList 
                            uid = {uid} 
                            active = {active}
                            dispatch = {dispatch}
                        />
                        
                        {/* Empty column to end */}
                        <div className="col"></div>
                    </div>
                </div>
            </div>
        )
    }
}

// Map all variables to props using redux
const mapStateToProps = (state) => {
    return {
        uid: state.auth.uid,
        firstName: state.profile.firstName,
        lastName: state.profile.lastName,
        dateCreated: state.profile.dateCreated,
        active: state.friends.active,
        users: state.friends.users,
        numFriends: state.friends.numFriends
    }
};

// Map all methods to props using redux
const mapDispatchToProps = (dispatch) => ({dispatch});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home)); 