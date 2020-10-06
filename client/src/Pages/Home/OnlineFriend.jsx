import React, { Component } from 'react';
import {loadProfilePic} from '../../store/actions/profileActions';
import * as msgActions from '../../store/actions/messagesActions';
import {withRouter} from 'react-router-dom';
import loading from '../../images/loading.jpg';
import moment from 'moment';
import './css/OnlineFriend.css';

class OnlineFriend extends Component {
    constructor(){
        super();

        this.state = { 
            imgURL: null, 
            timeOfLastMessage: null
        };

        this.messageFriend = this.messageFriend.bind(this);
    }

    // After init render, load users data
    async componentDidMount() {
        const {uid} = this.props;
        const {_id} = this.props.user;
    
        let timeOfLastMessage = null;

        const imgURL = await loadProfilePic(_id);
        const chatId = await msgActions.checkIfChatExists(uid, _id);

        if(chatId){
            const chat = await msgActions.getChat(chatId);
            timeOfLastMessage = chat.timeOfLastMessage;
        }

        this.setState({
            imgURL, 
            timeOfLastMessage
        });
    }

    async messageFriend(){
        const {uid, dispatch} = this.props;
        const {_id, firstName, lastName} = this.props.user;
     
        const chatId = await msgActions.checkIfChatExists(uid, _id);
    
        if(chatId){
            this.props.history.push(`/chat/${chatId}`);
        }

        else{
            const friend = {_id, firstName, lastName};
    
            dispatch(msgActions.updateRecipients([friend]));

            this.props.history.push('/chat/new');
        }
    }

    render() {
        // Destructuring
        const {imgURL, timeOfLastMessage} = this.state;
        const {firstName, lastName} = this.props.user;
    
        return (
            <div className = "onlineFriend card rounded-0" onClick={this.messageFriend}>
                <div className ="row no-gutters d-flex text-center justify-content-center align-items-center">
                    <div className = "col-4">
                        <div className ="avatar-icon p-0 m-0">
                            <img src={imgURL? imgURL: loading} alt = 'Profile Pic'/>
                            <span className = 'activeIconOn'/>
                        </div>
                    </div>

                    <div className ="col-5">
                        <h5>{firstName} {lastName}</h5>
                    </div>

                    <div className ="col-3">
                        {timeOfLastMessage? 
                            (<span className="text-muted lastMsgTime">
                                Last Chatted: {moment(timeOfLastMessage).calendar()}
                            </span>):
                            null
                        }
                    </div>       
                </div>
            </div>
        )
    }
}

export default withRouter(OnlineFriend);