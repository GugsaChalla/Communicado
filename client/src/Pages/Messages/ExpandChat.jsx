import React, {Component} from 'react';
import {connect} from 'react-redux';

import {
    setMsgsOnDisplay,
    setChatIdOnDisplay
} from '../../store/actions/messagesActions'

import MessageBubble from './MessageBubble';
import loading from './loading.jpg';
import axios from 'axios';
import './ExpandChat.css';

class ExpandChat extends Component{
    constructor(){
        super();

        this.state = {
            memberNames: 'Loading Users...',
            imgURL: null
        }

        this.getMessages = this.getMessages.bind(this);
        this.getMemberNames = this.getMemberNames.bind(this);
    }

    async componentDidMount(){
        await this.getMessages();
        await this.getMemberNames();
        await this.getChatPic();
    }

    async componentDidUpdate(prevProps){
        const {chatId} = this.props;

        if(chatId !== prevProps.chatId){
            await this.getMessages();
            await this.getMemberNames();
            await this.getChatPic();
        }
    }

    async getChatPic(){
        const {chatId, uid} = this.props;

        let response = await axios.post('http://localhost:5000/chats/memberids', {uid, chatId});
        const {members} = response.data;

        //get the chat picture
        response = await fetch(`http://localhost:5000/users/profilepic/${members[0]}`, {
            method: 'GET'
        }); 
            
        let file = await response.blob();

        this.setState({
            imgURL: URL.createObjectURL(file)
        });
    }

    async getMessages(){
        const {chatId} = this.props;

        const response = await axios.get(`http://localhost:5000/chats/messages/${chatId}`);
        const messages = response.data;

        this.props.setMsgsOnDisplay(messages);
        this.props.setChatIdOnDisplay(chatId);
    }

    
    async getMemberNames(){
        const {uid, chatId} = this.props;

        const response = await axios.post(`http://localhost:5000/chats/members`, {uid, chatId});
        const {memberNames} = response.data;

        this.setState({memberNames});
    }

    render(){
        const {uid} = this.props;
        const typing = this.props.typingOnDisplay;
        console.log(typing);
        const {memberNames, imgURL} = this.state;

        const messages = this.props.msgsOnDisplay.map(msg =>
            <MessageBubble
                key = {msg._id}
                uid = {uid}
                senderId = {msg.senderId}
                content = {msg.content}
            />
        );

        return(
            <div className ='expandChat'>
               <header>
                    <div className='profile'>
                        <img src = {imgURL? imgURL : loading} className= 'profilePic'/>
                        <h2>{memberNames}</h2>
                    </div>
               </header>

                <section className = 'chat-box'>
                    {messages}
                </section>
            </div>
        )
    }
}

const mapStateToProps = (state) =>{
    return{
        uid: state.auth.uid,
        msgsOnDisplay: state.messages.msgsOnDisplay,
        typingOnDisplay: state.messages.typingOnDisplay
    }
}

const mapDispatchToProps = (dispatch) =>{
    return{
        setMsgsOnDisplay: (messages) => {dispatch(setMsgsOnDisplay(messages));},
        setChatIdOnDisplay: (chatId) => {dispatch(setChatIdOnDisplay(chatId));}
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpandChat);