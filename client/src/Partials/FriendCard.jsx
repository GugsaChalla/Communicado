import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {removeFriend} from '../store/actions/friendsActions';
import {loadProfilePic} from '../store/actions/profileActions';
import {updateRecipients, checkIfChatExists} from '../store/actions/messagesActions';
import {io} from '../App';
import './FriendCard.css'

// Friend card to be rendered on friends page for each friend
class FriendCard extends Component {
    constructor(){
        super();
        // Init state

        this.state = {
            imgURL: null
        }

        this.deleteFriend = this.deleteFriend.bind(this);
        this.messageFriend = this.messageFriend.bind(this);
    }

    // load image of user after initial render
    async componentDidMount(){
        const {_id} = this.props.user;
    
        const imgURL = await loadProfilePic(_id);

        this.setState({imgURL});
    }

    // Delete friend function from props store that asks user to confirm
    deleteFriend(){
        const {_id, firstName, lastName} = this.props.user;
        const {uid, friends, dispatch} = this.props;

        if(!window.confirm(`Are you sure you want to unfriend ${firstName} ${lastName}?`)){
            return;
        }
        
        dispatch(removeFriend(_id, friends));

        // Emit change of friend status to server so that Add Friend is next option
        io.emit("CHANGE_FRIEND_STATUS", {
            status: "Friends", 
            uid, 
            friendId: _id
        });
    }

    async messageFriend(){
        const {_id, firstName, lastName} = this.props.user;
        const {uid, dispatch} = this.props;

        const chatId = await checkIfChatExists(uid, _id);
    
        if(chatId){
            this.props.history.push(`/chat/${chatId}`);
        }

        else{
            const friend = {_id, firstName, lastName};
    
            dispatch(updateRecipients([friend]));
    
            this.props.history.push('/chat/new');
        }
    }

    render() {
        // Destructure
        const {firstName, lastName} = this.props.user;
        const {imgURL} = this.state;

        return (
            <div className="col-lg-6 col-sm-12 d-flex justify-content-center">
                <div className="FriendCard card bg-light mb-5">
                    <div className="row d-flex justify-content-center text-center no-gutters align-items-center h-100 w-100">
                        <div className="col-3 d-flex justify-content-center">
                            <img 
                                src={imgURL? imgURL: "//placehold.it/30"} 
                                className="img-fluid friendImg" 
                                alt="tester" 
                            />
                        </div>

                        <div className="col-7">
                            <h3 className="card-title">
                                {firstName} {lastName}
                            </h3>
                        </div>

                        <div className="col-1 delete pr-3" onClick={this.deleteFriend}>
                            <i className="fas fa-times"/>
                        </div>

                        <div className="col-1 msg pr-3">
                            <i className="far fa-comment-dots" onClick = {this.messageFriend}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return{
        uid: state.auth.uid,
        recipients: state.messages.recipients
    }
}

const mapDispatchToProps = (dispatch) => ({dispatch});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FriendCard));