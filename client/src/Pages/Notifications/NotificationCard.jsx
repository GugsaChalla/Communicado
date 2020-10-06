import React, { Component} from 'react';
import {getUserData, loadProfilePic} from '../../store/actions/profileActions';
import * as friendActions from '../../store/actions/friendsActions';
import loading from '../../images/loading.jpg';
import moment from 'moment';
import {io} from '../../App';
import './css/NotificationCard.css'

// Notification cards that will be rendered in Notifications for each one 
class NotificationCard extends Component {
    constructor() {
        super();

        // State that will control user elements of notif
        this.state = {
            firstName: "",
            lastName: "",
            imgURL: null, 
            status: ''
        }

        this.handleRequest = this.handleRequest.bind(this);
    }

    // Mount component with users ID 
    async componentDidMount(){
        // Get sender ID from notif to fetch their data and render
        const {senderId} = this.props.notif;
        const {uid} = this.props;
        
        // Get fName and lName of user who sent notification 
        const user = await getUserData(senderId);
        const status = await friendActions.getFriendStatus(uid, senderId);
        const imgURL = await loadProfilePic(senderId);

        this.setState({
            firstName: user.firstName, 
            lastName: user.lastName,
            imgURL,
            status
        });
    }

    async handleRequest(eventType){
        const {status} = this.state;
        const {_id, senderId} = this.props.notif;
        const {uid, deleteNotif} = this.props;

        if(eventType === 'ACCEPT_REQUEST'){
            const msg = await friendActions.acceptFriendRequest(uid, senderId, status);
            
            if(msg){
                io.emit(eventType, {
                    receiverId: uid, 
                    senderId
                });
            }
        } 
        
        else{
            await friendActions.declineFriendRequest(uid, senderId);
        }

        // Delete notification once clicked
        deleteNotif(_id);
    }

    render() {
        // Destructure state and props
        const {imgURL, firstName, lastName} = this.state;
        const {content, date, friendRequest} = this.props.notif;

        const acceptRequest = () => {this.handleRequest("ACCEPT_REQUEST")};
        const declineRequest = () => {this.handleRequest("DECLINE_REQUEST")};
     
        return (
            <div className="NotificationCard card mt-2">
                <div className="row">
                    <div className="col-4">
                        {/* While loading for img, display placeholer */}
                        <img 
                            src={imgURL ? imgURL : loading} 
                            className="img-fluid avatar" 
                            alt="tester" 
                        />
                    </div>

                    {/* Notif body: name, content and date */}
                    <div className="col-8">
                        <h2>
                            <strong>{firstName} {lastName} </strong>
                            
                            <span>
                                {content}
                            </span>
                        </h2>
                        
                        <h5 className="text-muted">
                            Sent {moment(date).calendar()}
                        </h5>

                        
                        {
                            friendRequest?
                            (
                                <div>
                                    <button className = 'btn btn-success mr-3' onClick = {acceptRequest}>
                                        Accept
                                    </button>

                                    <button className="btn btn-danger" onClick = {declineRequest}>
                                        Decline
                                    </button>
                                </div>
                            ): null
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default NotificationCard;