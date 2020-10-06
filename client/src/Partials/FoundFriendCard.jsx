import React, { Component } from 'react'
import { connect } from 'react-redux';
import {getFriendStatus, changeFriendStatus} from '../store/actions/friendsActions';
import {loadProfilePic} from '../store/actions/profileActions';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {io} from '../App';
import './css/FoundFriendCard.css'

// Found friend card displayed in the FindForm to show possible new friends
class FoundFriendCard extends Component {
    constructor(){
        super();

        // Initial placeholder state
        this.state = {
            imgURL: "//placehold.it/10",
            status: 'Add Friend'
        }

        this.handleClick = this.handleClick.bind(this);
    }

    // Once rendered, load img of user from DB
    async componentDidMount(){
        const {_id} = this.props.user;
        const {uid} = this.props;
     
        const imgURL = await loadProfilePic(_id);
        const status = await getFriendStatus(_id, uid);

        this.setState({
            status, 
            imgURL
        });
    }

    // Send friend request to client when user clicks btn to add friend
    async handleClick(){
        // Destructure
        const {status} = this.state;
        const {_id, firstName, lastName} = this.props.user;
        const {uid} = this.props;

        // Add Friend button
        if(status === 'Add Friend'){
            const msg = await changeFriendStatus(uid, _id, status);

            io.emit("CHANGE_FRIEND_STATUS", {
                uid, 
                friendId: _id,
                msg
            });
            
            this.setState({status: 'Pending'});
        }
        // Pending Button
        else if(status === 'Pending'){
            const msg = await changeFriendStatus(uid, _id, status);

            io.emit("CHANGE_FRIEND_STATUS", {
                uid,
                friendId: _id,
                msg
            });
            
            this.setState({status: 'Add Friend'});
        }
        // Already friends. If clicked, will delete friend from friend list if user confirms
        else {
            const confirmDeleteFriend = async () => {
                const msg = await changeFriendStatus(uid, _id, status);

                io.emit("CHANGE_FRIEND_STATUS", {
                    uid, 
                    friendId: _id,
                    msg
                });
                
                this.setState({status: 'Add Friend'});
            }

            confirmAlert({
                title: 'Communicado',
                message: `Are you sure you want to unfriend ${firstName} ${lastName}`,
                buttons: [
                    {label: 'Yes', onClick: confirmDeleteFriend},
                    {label: 'No', onClick: () => {return;}}
                ]
            });
        }
    }

    render() {
        // Destructure
        const {imgURL, status} = this.state;
        const {_id, firstName, lastName} = this.props.user;
        const {uid} = this.props;

        return (
            <div className="FoundFriendCard card col-lg-2 col-sm-4 col-6 mb-2">
                <img 
                    src={imgURL} 
                    className="card-img" 
                    alt="user icon" 
                    id="userIcon"
                />
                
                <div className="card-body">
                    <h5 className="card-title text-center">
                        {firstName} {lastName}
                    </h5>
                </div>

                {uid !== _id ?
                    (<div className="card-footer text-center" onClick = {this.handleClick}>
                        {status === 'Add Friend'? 
                            <i className="fas fa-user-plus mb-2"></i>: status === 'Pending'?
                            <i className ='fas fa-user-clock mb-2'/> :
                            <i className ='fa fa-check mb-2'/> 
                        }      
                    </div>): 
                    null
                }
            </div>
        )
    }
}

// put data from reducer into props
const mapStateToProps = (state) =>{
    return {
        uid: state.auth.uid,
        users: state.friends.users
    }
}

export default connect(mapStateToProps)(FoundFriendCard);